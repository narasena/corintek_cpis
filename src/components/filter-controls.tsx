'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { X, Search, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { IColumnFilterConfig } from '@/components/data-table';

interface IFilterSelectProps<TData> {
  config: IColumnFilterConfig<TData>;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  onClear: () => void;
}

export function FilterSelect<TData>({
  config,
  value,
  onChange,
  onClear,
}: IFilterSelectProps<TData>) {
  const handleValueChange = (newValue: string) => {
<<<<<<< HEAD
    //Treat the special 'all' value as undefined (clears filter)
    onChange(newValue === 'all' ? undefined : newValue);
=======
    onChange(newValue === 'all' ? undefined : newValue);
>>>>>>> refactor/global
  };

  return (
    <Select value={value ?? 'ALL'} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue
          placeholder={config.placeholder ?? config.label ?? 'Filter'}
        />
      </SelectTrigger>
      <SelectContent>
<<<<<<< HEAD
        <SelectItem value="all">Semua</SelectItem>
=======
        <SelectItem value="all">Semua</SelectItem>
>>>>>>> refactor/global
        {config.options?.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface IFilterTextProps<TData> {
  config: IColumnFilterConfig<TData>;
  value: string | undefined;
  onChange: (value: string) => void;
  onClear: () => void;
  debounceMs?: number;
}

export function FilterText<TData>({
  config,
  value = '',
  onChange,
  onClear,
  debounceMs = 300,
}: IFilterTextProps<TData>) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // TODO: Implement debouncing for onChange when needed
  // For now, pass through directly (DataTable handles client-side filtering which is fast)

  return (
    <div className="relative w-full sm:w-72">
      <Input
        placeholder={config.placeholder ?? 'Cari...'}
        value={inputValue}
        onChange={e => {
          setInputValue(e.target.value);
          onChange(e.target.value);
        }}
        className="pl-8 pr-8"
      />
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      {inputValue && (
        <button
          type="button"
          onClick={() => {
            setInputValue('');
            onClear();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear filter"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface IFilterDateProps<TData> {
  config: IColumnFilterConfig<TData>;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  onClear: () => void;
}

export function FilterDate<TData>({
  config,
  value,
  onChange,
  onClear,
}: IFilterDateProps<TData>) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  useEffect(() => {
    setSelectedDate(value ? new Date(value) : undefined);
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full sm:w-[180px] justify-start">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(new Date(value), 'dd MMM yyyy', { locale: id })
          ) : (
            <span className="text-muted-foreground">
              {config.placeholder ?? 'Pilih tanggal...'}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={date => {
            setSelectedDate(date);
            onChange(date ? format(date, 'yyyy-MM-dd') : undefined);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
