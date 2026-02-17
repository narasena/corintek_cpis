export type TSignatureUiRole = 'TECHNICIAN' | 'CLIENT_PIC';
export function signatureRoleLabel(role: TSignatureUiRole): string {
  if (role === 'TECHNICIAN') return 'Teknisi';
  return 'PIC Klien';
}
