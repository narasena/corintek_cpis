'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getProfilesForSelectAction } from '../actions';
import type { IParameterLimitProfile } from '../types';

interface IProfileSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ProfileSelector({
  value,
  onChange,
  disabled = false,
  placeholder = 'Pilih profil limit',
}: IProfileSelectorProps) {
  const [profiles, setProfiles] = useState<
    Array<Pick<IParameterLimitProfile, 'id' | 'name' | 'isDefault'>>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const result = await getProfilesForSelectAction({});
        if (result.success) {
          setProfiles(result.data);
        }
      } catch (error) {
        console.error('[CPIS-ERROR] ProfileSelector.fetchProfiles:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfiles();
  }, []);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const selectedProfile = profiles.find(p => p.id === value);

  return (
    <Select
      value={value ?? undefined}
      onValueChange={newValue => onChange(newValue || null)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {selectedProfile && (
            <span className="flex items-center gap-2">
              {selectedProfile.name}
              {selectedProfile.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  Default
                </Badge>
              )}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {profiles.map(profile => (
          <SelectItem key={profile.id} value={profile.id}>
            <span className="flex items-center gap-2">
              {profile.name}
              {profile.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  Default
                </Badge>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
