'use client';

import { MetricLineChart } from './metric-line-chart';

interface IMetric {
  date: string;
  condenserApproach: number | null;
  evaporatorApproach: number | null;
}

interface IProps {
  data: IMetric[];
}

export function ApproachChart({ data }: IProps) {
  return (
    <MetricLineChart
      data={data}
      emptyMessage="Belum ada data nilai Approach."
      lines={[
        { dataKey: 'condenserApproach', name: 'Condenser', stroke: '#ef4444' },
        {
          dataKey: 'evaporatorApproach',
          name: 'Evaporator',
          stroke: '#3b82f6',
        },
      ]}
    />
  );
}
