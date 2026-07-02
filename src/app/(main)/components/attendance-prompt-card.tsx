'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { getTodayAttendanceAction } from '@/features/attendance/actions';
import type { AttendanceModel } from '@/generated/prisma/models';

type TodayAttendance = AttendanceModel | null;

const ATTENDANCE_ROLES = ['TECHNICIAN'] as const;

interface AttendancePromptCardProps {
  userRole: string;
}

export function AttendancePromptCard({ userRole }: AttendancePromptCardProps) {
  const router = useRouter();
  const [attendance, setAttendance] = useState<TodayAttendance>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Only show for TECHNICIAN
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

  const goToAttendance = () => {
    router.push('/attendance');
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
              onClick={goToAttendance}
              size="sm"
              className="gap-2 bg-amber-600 hover:bg-amber-700"
            >
              <LogOut className="h-4 w-4" />
              Absen Pulang
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
            onClick={goToAttendance}
            size="sm"
            className="gap-2"
          >
            <LogIn className="h-4 w-4" />
            Absen Masuk
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
