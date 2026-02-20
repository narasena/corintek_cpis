'use client';

import { MetricLineChart } from './metric-line-chart';

interface IMetric {
  date: string;
  condenserAmpere: number | null;
  evaporatorAmpere: number | null;
}

interface IProps {
  data: IMetric[];
}

export function AmpereChart({ data }: IProps) {
  return (
    <MetricLineChart
      data={data}
      emptyMessage="Belum ada data nilai Ampere."
      lines={[
        { dataKey: 'condenserAmpere', name: 'Condenser', stroke: '#f59e0b' },
        { dataKey: 'evaporatorAmpere', name: 'Evaporator', stroke: '#10b981' },
      ]}
    />
  );
}
