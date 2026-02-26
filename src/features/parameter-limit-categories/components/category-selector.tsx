'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getCategoriesForSelectAction } from '../actions';
import type { IParameterLimitCategory } from '../types';

interface ICategorySelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CategorySelector({
  value,
  onChange,
  disabled = false,
  placeholder = 'Pilih kategori limit',
}: ICategorySelectorProps) {
  const [categories, setCategories] = useState<
    Array<Pick<IParameterLimitCategory, 'id' | 'name' | 'isDefault'>>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const result = await getCategoriesForSelectAction();
        if (result.success) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error('[CPIS-ERROR] CategorySelector.fetchCategories:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const selectedCategory = categories.find(c => c.id === value);

  return (
    <Select
      value={value ?? undefined}
      onValueChange={newValue => onChange(newValue || null)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {selectedCategory && (
            <span className="flex items-center gap-2">
              {selectedCategory.name}
              {selectedCategory.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  Default
                </Badge>
              )}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {categories.map(category => (
          <SelectItem key={category.id} value={category.id}>
            <span className="flex items-center gap-2">
              {category.name}
              {category.isDefault && (
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
