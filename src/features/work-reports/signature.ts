import type { TWorkReportStatus } from './types';

export type TWorkReportSignatureRole = 'TECHNICIAN' | 'CLIENT_PIC';

export interface IAuthContext {
  userId: string;
  role: string;
  email: string;
}

export interface IWorkReportSignature {
  workReportId: string;
  role: TWorkReportSignatureRole;
  signerUserId: string;
  signatureUrl: string;
  signedAt: Date;
}

export interface IWorkReportSnapshot {
  id: string;
  projectId: string;
  status: TWorkReportStatus;
  technicianSignature?: IWorkReportSignature | null;
  clientPicSignature?: IWorkReportSignature | null;
}

export interface IProjectAssignment {
  userId: string;
  projectId: string;
  role: string;
  isActive: boolean;
}

// Persistence and infrastructure ports

export interface IWorkReportRepository {
  getByIdForSignature(id: string): Promise<IWorkReportSnapshot | null>;
  saveSignature(signature: IWorkReportSignature): Promise<IWorkReportSnapshot>;
  updateStatus(
    id: string,
    status: TWorkReportStatus,
    submittedByUserId?: string | null,
    approvedByUserId?: string | null
  ): Promise<IWorkReportSnapshot>;
}

export interface IProjectAssignmentRepository {
  getActiveAssignmentsForUserOnProject(
    userId: string,
    projectId: string
  ): Promise<IProjectAssignment[]>;
}

export interface ISignatureStorage {
  storeSignature(
    projectId: string,
    workReportId: string,
    role: TWorkReportSignatureRole,
    dataUrl: string
  ): Promise<string>;
}

// Policy and validation ports

export interface IWorkReportSigningPolicy {
  assertCanSign(
    actor: IAuthContext,
    report: IWorkReportSnapshot,
    role: TWorkReportSignatureRole
  ): Promise<void>;
}

export interface IWorkReportValidationService {
  assertValidForSubmission(report: IWorkReportSnapshot): Promise<void>;
  assertValidForApproval(report: IWorkReportSnapshot): Promise<void>;
}

// Use-case level contracts

export interface ISignWorkReportCommand {
  actor: IAuthContext;
  workReportId: string;
  role: TWorkReportSignatureRole;
  dataUrl: string;
}

export interface ISignWorkReportResult {
  report: IWorkReportSnapshot;
}

export interface IWorkReportSignatureService {
  signWorkReport(
    command: ISignWorkReportCommand
  ): Promise<ISignWorkReportResult>;
}

// Concrete, DI-based implementations (function-style, not classes)

export type WorkReportSigningPolicyDeps = {
  projectAssignmentRepository: IProjectAssignmentRepository;
};

export function createWorkReportSigningPolicy(
  deps: WorkReportSigningPolicyDeps
): IWorkReportSigningPolicy {
  return {
    async assertCanSign(actor, report, role) {
      if (report.status !== 'DRAFT') {
        throw new Error(
          'Work report sudah dikirim dan tidak bisa ditandatangani'
        );
      }

      if (actor.role === 'ADMIN') {
        return;
      }

      const assignments =
        await deps.projectAssignmentRepository.getActiveAssignmentsForUserOnProject(
          actor.userId,
          report.projectId
        );

      if (role === 'TECHNICIAN') {
        const allowed =
          actor.role === 'TECHNICIAN' &&
          assignments.some(a => a.role === 'TECHNICIAN' && a.isActive);
        if (!allowed) {
          throw new Error('Hanya teknisi proyek yang dapat menandatangani');
        }
        return;
      }

      const isClientRole =
        actor.role === 'CLIENT_TECHNICIAN' ||
        actor.role === 'CLIENT_SUPERVISOR';
      const isClientPic = assignments.some(
        a => a.role === 'CLIENT_PIC' && a.isActive
      );

      if (!isClientRole || !isClientPic) {
        throw new Error('Hanya PIC klien proyek yang dapat menandatangani');
      }
    },
  };
}

export function createWorkReportValidationService(): IWorkReportValidationService {
  return {
    async assertValidForSubmission(report) {
      if (!report.technicianSignature || !report.clientPicSignature) {
        throw new Error(
          'Tanda tangan teknisi dan PIC klien wajib sebelum submit'
        );
      }
    },
    async assertValidForApproval(report) {
      if (!report.technicianSignature || !report.clientPicSignature) {
        throw new Error(
          'Tanda tangan teknisi dan PIC klien wajib sebelum submit'
        );
      }
      if (report.status !== 'SUBMITTED') {
        throw new Error(
          'Work report hanya bisa disetujui dari status SUBMITTED'
        );
      }
    },
  };
}

export type WorkReportSignatureServiceDeps = {
  workReportRepository: IWorkReportRepository;
  signingPolicy: IWorkReportSigningPolicy;
  validationService: IWorkReportValidationService;
  signatureStorage: ISignatureStorage;
};

export function createWorkReportSignatureService(
  deps: WorkReportSignatureServiceDeps
): IWorkReportSignatureService {
  return {
    async signWorkReport(command) {
      const report = await deps.workReportRepository.getByIdForSignature(
        command.workReportId
      );

      if (!report) {
        throw new Error('Work report tidak ditemukan');
      }

      await deps.signingPolicy.assertCanSign(
        command.actor,
        report,
        command.role
      );

      const url = await deps.signatureStorage.storeSignature(
        report.projectId,
        report.id,
        command.role,
        command.dataUrl
      );

      const signature: IWorkReportSignature = {
        workReportId: report.id,
        role: command.role,
        signerUserId: command.actor.userId,
        signatureUrl: url,
        signedAt: new Date(),
      };

      const updated = await deps.workReportRepository.saveSignature(signature);

      return { report: updated };
    },
  };
}

export type WorkReportSignatureModuleDeps = {
  workReportRepository: IWorkReportRepository;
  projectAssignmentRepository: IProjectAssignmentRepository;
  signatureStorage: ISignatureStorage;
};

export type WorkReportSignatureModule = {
  workReportRepository: IWorkReportRepository;
  projectAssignmentRepository: IProjectAssignmentRepository;
  signatureStorage: ISignatureStorage;
  signingPolicy: IWorkReportSigningPolicy;
  validationService: IWorkReportValidationService;
  signatureService: IWorkReportSignatureService;
};

export function createWorkReportSignatureModule(
  deps: WorkReportSignatureModuleDeps
): WorkReportSignatureModule {
  const signingPolicy = createWorkReportSigningPolicy({
    projectAssignmentRepository: deps.projectAssignmentRepository,
  });

  const validationService = createWorkReportValidationService();

  const signatureService = createWorkReportSignatureService({
    workReportRepository: deps.workReportRepository,
    signingPolicy,
    validationService,
    signatureStorage: deps.signatureStorage,
  });

  return {
    workReportRepository: deps.workReportRepository,
    projectAssignmentRepository: deps.projectAssignmentRepository,
    signatureStorage: deps.signatureStorage,
    signingPolicy,
    validationService,
    signatureService,
  };
}
