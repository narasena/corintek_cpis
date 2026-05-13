'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Clock, LogIn, LogOut, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getTodayAttendanceAction,
  clockInAction,
  clockOutAction,
} from '@/features/attendance/actions';
import type { AttendanceModel } from '@/generated/prisma/models';

type TodayAttendance = AttendanceModel | null;

const ATTENDANCE_ROLES = ['TECHNICIAN', 'SUPERVISOR', 'STAFF'] as const;

interface AttendancePromptCardProps {
  userRole: string;
}

export function AttendancePromptCard({ userRole }: AttendancePromptCardProps) {
  const router = useRouter();
  const [attendance, setAttendance] = useState<TodayAttendance>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClockingIn, setIsClockingIn] = useTransition();
  const [isClockingOut, setIsClockingOut] = useTransition();

  const isPending = isClockingIn || isClockingOut;

  // Only show for TECHNICIAN and SUPERVISOR
  const isAllowedRole = ATTENDANCE_ROLES.includes(
    userRole as (typeof ATTENDANCE_ROLES)[number]
  );

  useEffect(() => {
    async function fetchTodayAttendance() {
      try {
        const result = await getTodayAttendanceAction({});
        if (result.success) {
          setAttendance(result.data as TodayAttendance);
        }
       } catch (error) {
         logger.error('AttendancePromptCard', 'fetchTodayAttendance', 'Failed to fetch today attendance', { error });
       } finally {
        setIsLoading(false);
      }
    }
    fetchTodayAttendance();
  }, []);

  if (!isAllowedRole) {
    return null;
  }

  const handleClockIn = () => {
    // Create a dummy file to trigger the action - in production user would select a photo
    const photo = new File([''], 'photo.jpg', { type: 'image/jpeg' });

    setIsClockingIn(async () => {
      try {
        const formData = new FormData();
        formData.append('photo', photo);

        const result = await clockInAction(formData);
        if (result.success) {
          toast.success('Berhasil absen masuk');
          router.refresh();
          // Refresh attendance data
          const res = await getTodayAttendanceAction({});
          if (res.success) {
            setAttendance(res.data as TodayAttendance);
          }
        } else {
          toast.error(result.error ?? 'Gagal absen masuk');
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Gagal absen masuk';
        toast.error(message);
      }
    });
  };

  const handleClockOut = () => {
    const photo = new File([''], 'photo.jpg', { type: 'image/jpeg' });

    setIsClockingOut(async () => {
      try {
        const formData = new FormData();
        formData.append('photo', photo);

        const result = await clockOutAction(formData);
        if (result.success) {
          toast.success('Berhasil absen pulang');
          router.refresh();
          // Refresh attendance data
          const res = await getTodayAttendanceAction({});
          if (res.success) {
            setAttendance(res.data as TodayAttendance);
          }
        } else {
          toast.error(result.error ?? 'Gagal absen pulang');
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Gagal absen pulang';
        toast.error(message);
      }
    });
  };

  const getStatus = () => {
    if (!attendance) return 'not_checked_in';
    if (attendance.status === 'OPEN') return 'checked_in';
    return 'checked_out';
  };

  const status = getStatus();

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-sm bg-background/60 backdrop-blur-sm rounded-xl">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (status === 'checked_out') {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Check className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-emerald-800">
                Selesai untuk hari ini
              </CardTitle>
              <CardDescription className="text-sm text-emerald-700">
                Anda telah menyelesaikan absensi hari ini
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (status === 'checked_in') {
    return (
      <Card className="border-amber-200 bg-amber-50/50 shadow-sm rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-amber-800">
                  Sudah absen masuk
                </CardTitle>
                <CardDescription className="text-sm text-amber-700">
                  Jangan lupa lakukan absen pulang saat menyelesaikan pekerjaan
                  hari ini.
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleClockOut}
              disabled={isPending}
              size="sm"
              className="gap-2 bg-amber-600 hover:bg-amber-700"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {isPending ? 'Memproses...' : 'Absen Pulang'}
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Not checked in
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <LogIn className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Belum absen masuk
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Silakan absen masuk untuk memulai hari kerja
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleClockIn}
            disabled={isPending}
            size="sm"
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {isPending ? 'Memproses...' : 'Absen Masuk'}
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
