'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { IParameter, IParameterGroup } from '@/types/parameter.type';
import { ParameterTransferGrid } from './parameter-transfer-grid';
import { ParameterTransferControls } from './parameter-transfer-controls';
import { toast } from 'sonner';
import apiInstance from '@/utils/apiInstance';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';

interface ParametersPickerModalProps {
  group: IParameterGroup;
}

export function ParametersPickerModal({ group }: ParametersPickerModalProps) {
  const [allParameters, setAllParameters] = useState<IParameter[]>([]);
  const [currentMembers, setCurrentMembers] = useState<IParameter[]>([]);
  const [availableParameters, setAvailableParameters] = useState<IParameter[]>(
    []
  );
  const [selectedCurrent, setSelectedCurrent] = useState<string[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const parametersRes = await apiInstance.get('/parameters');
      const membersRes = await apiInstance.get(
        `/parameters/groups/${group.id}/members`
      );

      const allParams = parametersRes.data.parameters || [];
      const currentParams =
        membersRes.data.members?.map(
          (m: { parameter: IParameter }) => m.parameter
        ) || [];

      setAllParameters(allParams);
      setCurrentMembers(currentParams);
      setAvailableParameters(
        allParams.filter(
          (p: IParameter) =>
            !currentParams.find((c: IParameter) => c.id === p.id)
        )
      );
    } catch (error) {
      errorMessageResponse(error);
    }
  };

  useEffect(() => {
    if (group.id) {
      fetchData();
    }
  }, [group.id]);

  const handleAddToGroup = () => {
    const paramsToAdd = allParameters.filter(p =>
      selectedAvailable.includes(p.id as string)
    );
    setCurrentMembers(prev => [...prev, ...paramsToAdd]);
    setAvailableParameters(prev =>
      prev.filter(p => !selectedAvailable.includes(p.id as string))
    );
    setSelectedAvailable([]);
  };

  const handleRemoveFromGroup = () => {
    const paramsToRemove = currentMembers.filter(p =>
      selectedCurrent.includes(p.id as string)
    );
    setAvailableParameters(prev => [...prev, ...paramsToRemove]);
    setCurrentMembers(prev =>
      prev.filter(p => !selectedCurrent.includes(p.id as string))
    );
    setSelectedCurrent([]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const originalMemberIds =
        (
          await apiInstance.get(`/parameters/groups/${group.id}/members`)
        ).data.members?.map((m: IParameter) => m.id) || [];

      const currentMemberIds = currentMembers.map(p => p.id);
      const toAdd = currentMemberIds.filter(
        id => !originalMemberIds.includes(id)
      );
      const toRemove = originalMemberIds.filter(
        (id: string) => !currentMemberIds.includes(id)
      );

      const updates = [];
      if (toAdd.length > 0) {
        updates.push(
          apiInstance.post(`/parameters/groups/${group.id}/members`, {
            parameterIds: toAdd,
          })
        );
      }
      if (toRemove.length > 0) {
        updates.push(
          apiInstance.put(`/parameters/groups/${group.id}/members`, {
            parameterIds: toRemove,
          })
        );
      }
      toast.success('Parameter grup berhasil diperbarui');
    } catch (error) {
      errorMessageResponse(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        <div className="flex-1">
          <ParameterTransferGrid
            title="Parameter dalam Grup"
            parameters={currentMembers}
            selectedIds={selectedCurrent}
            onSelectionChange={setSelectedCurrent}
          />
        </div>

        <div className="w-fit flex items-center">
          <ParameterTransferControls
            onAddToGroup={handleAddToGroup}
            onRemoveFromGroup={handleRemoveFromGroup}
            selectedCurrentCount={selectedCurrent.length}
            selectedAvailableCount={selectedAvailable.length}
          />
        </div>

        <div className="flex-1">
          <ParameterTransferGrid
            title="Parameter Tersedia"
            parameters={availableParameters}
            selectedIds={selectedAvailable}
            onSelectionChange={setSelectedAvailable}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={fetchData}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </div>
  );
}
