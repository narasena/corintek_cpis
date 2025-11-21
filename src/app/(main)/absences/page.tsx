'use client';

import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';

export default function AbsencePage() {
  const { user } = useAuthStore();
  const [isTechnician, setIsTechnician] = useState(false);
  if (user) {
    return <div>{JSON.stringify(user)}</div>;
  } else {
    return null;
  }
}
