'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface IProps {
  defaultValue?: string;
}

export function TimeRangeSelector({ defaultValue = '30d' }: IProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('timeRange', value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs
      defaultValue={searchParams.get('timeRange') || defaultValue}
      onValueChange={handleRangeChange}
      className="w-fit"
    >
      <TabsList className="grid w-[240px] grid-cols-3">
        <TabsTrigger value="7d">7 Hari</TabsTrigger>
        <TabsTrigger value="30d">30 Hari</TabsTrigger>
        <TabsTrigger value="90d">90 Hari</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
