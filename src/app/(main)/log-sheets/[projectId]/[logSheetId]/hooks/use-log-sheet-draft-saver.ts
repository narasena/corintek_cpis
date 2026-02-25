import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  saveLogSheetChemicalsAction,
  saveLogSheetEntriesAction,
  updateLogSheetAdminOverrideAction,
  updateLogSheetAction,
  uploadLogSheetImageAction,
} from '@/features/log-sheets/actions';
import type { TChemicalUsageState } from '@/features/log-sheets/components/chemical-usage-section';
import type { TEntryRole, TEntryState } from '../types';

export function useLogSheetDraftSaver(args: {
  projectId: string;
  logSheetId: string;
  notes: string;
  replacedByUserId: string | null;
  entryState: Record<string, TEntryState>;
  chemicalState: TChemicalUsageState;
  reload: () => Promise<void>;
  allowAdminOverride?: boolean;
}) {
  const router = useRouter();
  const {
    projectId,
    logSheetId,
    notes,
    replacedByUserId,
    entryState,
    chemicalState,
    reload,
    allowAdminOverride,
  } = args;

  const saveDraft = useCallback(
    async (showToast: boolean) => {
      const headerRes = allowAdminOverride
        ? await updateLogSheetAdminOverrideAction({
            id: logSheetId,
            notes: notes.trim() ? notes.trim() : undefined,
            replacedByUserId,
          })
        : await updateLogSheetAction({
            id: logSheetId,
            notes: notes.trim() ? notes.trim() : undefined,
            replacedByUserId,
          });

      if (!headerRes.success) {
        toast.error('Gagal menyimpan header log sheet', {
          description: headerRes.error,
        });
        return false;
      }

      const keys = Object.keys(entryState);
      const uploadedUrls: Record<string, string> = {};

      for (const key of keys) {
        const entry = entryState[key];
        if (entry.pendingFile) {
          try {
            const formData = new FormData();
            formData.append('file', entry.pendingFile);
            if (projectId) formData.append('projectId', projectId);
            if (logSheetId) formData.append('logSheetId', logSheetId);

            const uploadRes = await uploadLogSheetImageAction(formData);

            if (uploadRes.success) {
              uploadedUrls[key] = uploadRes.data.url;
            } else {
              toast.error('Gagal mengupload foto', {
                description: uploadRes.error,
              });
            }
          } catch {
            toast.error('Gagal mengupload foto');
          }
        }
      }

      const entriesToSave = keys.map(key => {
        const [parameterId, machineIdStr, roleStr] = key.split(':');
        const machineId = machineIdStr === 'null' ? null : machineIdStr;
        const role = roleStr as TEntryRole;
        const state = entryState[key];
        const fileUrl = uploadedUrls[key] || state.fileUrl;

        return {
          parameterId,
          machineId,
          role,
          valueType: state.valueType,
          numericValue: state.numericValue,
          boolValue: state.boolValue,
          textValue: state.textValue,
          fileUrl,
        };
      });

      const entriesRes = await saveLogSheetEntriesAction({
        logSheetId,
        entries: entriesToSave,
        adminOverride: allowAdminOverride,
      });

      const chemicalRes = await saveLogSheetChemicalsAction({
        logSheetId,
        usages: chemicalState
          .filter(c => c.chemicalId && c.amount > 0)
          .map(c => ({
            id: c.id,
            chemicalId: c.chemicalId,
            amount: c.amount,
          })),
        adminOverride: allowAdminOverride,
      });

      if (entriesRes.success && chemicalRes.success) {
        if (showToast) toast.success('Log sheet berhasil disimpan');
        // Refresh notifications immediately as limit breaches might have occurred
        window.dispatchEvent(new Event('refresh-notifications'));
      } else {
        if (!entriesRes.success) {
          toast.error('Gagal menyimpan entry log sheet', {
            description: entriesRes.error,
          });
        }
        if (!chemicalRes.success) {
          toast.error('Gagal menyimpan data chemical', {
            description: chemicalRes.error,
          });
        }
      }

      router.refresh();
      await reload();
      return entriesRes.success && chemicalRes.success;
    },
    [
      chemicalState,
      entryState,
      logSheetId,
      notes,
      projectId,
      reload,
      replacedByUserId,
      router,
      allowAdminOverride,
    ]
  );

  return { saveDraft };
}
