import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-10">
      <h1 className="text-xl font-semibold">Akses ditolak</h1>
      <p className="text-sm text-muted-foreground">
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <div>
        <Link href="/" className="text-sm font-medium text-primary">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
