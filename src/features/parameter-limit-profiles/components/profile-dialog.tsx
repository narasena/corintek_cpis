'use client';

import { useState, useEffect } from 'react';
import { ProfileForm } from './profile-form';
import { ProfileLimitsForm } from './profile-limits-form';
import { CrudDialog } from '@/components/crud-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, SlidersHorizontal } from 'lucide-react';
import type { IParameterLimitProfile } from '../types';

interface IProfileDialogProps {
  mode: 'create' | 'edit';
  profile?: IParameterLimitProfile;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (profile: IParameterLimitProfile) => void;
  trigger?: React.ReactNode;
  initialTab?: 'info' | 'limits';
}

export function ProfileDialog({
  mode,
  profile,
  open,
  onOpenChange,
  onSuccess,
  trigger,
  initialTab = 'info',
}: IProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(open ?? false);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  // Reset tab when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleSuccess = (data: IParameterLimitProfile) => {
    onSuccess?.(data);
    if (mode === 'create') {
      setIsOpen(false);
    }
  };

  const title = mode === 'create' ? 'Tambah Profil' : 'Ubah Profil';

  // For create mode, only show the form (no tabs)
  if (mode === 'create') {
    return (
      <CrudDialog
        mode={mode}
        open={isOpen}
        onOpenChange={handleOpenChange}
        trigger={trigger}
        title={title}
      >
        {({ onSuccess: onFormSuccess, onCancel }) => (
          <ProfileForm
            initialData={profile}
            onSuccess={data => {
              handleSuccess(data);
              onFormSuccess();
            }}
            onCancel={onCancel}
          />
        )}
      </CrudDialog>
    );
  }

  // For edit mode, show tabs
  return (
    <CrudDialog
      mode={mode}
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      title={title}
    >
      {({ onSuccess: onFormSuccess, onCancel }) => (
        <Tabs
          value={activeTab}
          onValueChange={v => setActiveTab(v as 'info' | 'limits')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Info Profil
            </TabsTrigger>
            <TabsTrigger value="limits" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Batas Parameter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <ProfileForm
              initialData={profile}
              onSuccess={data => {
                handleSuccess(data);
                onFormSuccess();
              }}
              onCancel={onCancel}
            />
          </TabsContent>

          <TabsContent value="limits" className="mt-4">
            {profile ? (
              <ProfileLimitsForm
                profile={profile}
                onSuccess={() => {
                  onSuccess?.(profile);
                }}
              />
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Pilih profil untuk mengelola batas parameter.
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </CrudDialog>
  );
}
