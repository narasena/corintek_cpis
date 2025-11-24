'use client';

import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';

export default function AbsencePage() {
  const { user } = useAuthStore();
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isTechnician, setIsTechnician] = useState(false);
  useEffect(() => {
    if (user) {
      setIsSupervisor(user.role === 'SUPERVISOR');
      setIsTechnician(user.role === 'TECHNICIAN');
    }
  }, [user]);
  if (isSupervisor) {
    return (
      <div>
        <h1>Supervisor Absence Page</h1>
      </div>
    );
  } else if (isTechnician) {
    return (
      <div>
        <h1>Technician Absence Page</h1>
      </div>
    );
  } else {
    return (
      <div>
        <h1>Not Authorized</h1>
      </div>
    );
  }
}
