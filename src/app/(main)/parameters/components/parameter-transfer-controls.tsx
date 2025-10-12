'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface ParameterTransferControlsProps {
  onAddToGroup: () => void;
  onRemoveFromGroup: () => void;
  selectedCurrentCount: number;
  selectedAvailableCount: number;
}

export function ParameterTransferControls({
  onAddToGroup,
  onRemoveFromGroup,
  selectedCurrentCount,
  selectedAvailableCount,
}: ParameterTransferControlsProps) {
  return (
    <div className="flex flex-col justify-center items-center space-y-2 p-2">
      <Button
        size="icon"
        onClick={onAddToGroup}
        disabled={selectedAvailableCount === 0}
        variant="outline"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        onClick={onRemoveFromGroup}
        disabled={selectedCurrentCount === 0}
        variant="outline"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
