import React from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface LazyBarChartProps {
  data: { name: string; value: number }[];
}

export const LazyBarChart: React.FC<LazyBarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'var(--chart-tick)', fontSize: 10 }} 
        />
        <Tooltip 
          cursor={{ fill: 'var(--color-overlay-subtle)' }}
          contentStyle={{ background: 'var(--chart-tooltip)', border: 'none', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text)' }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="var(--chart-bar)" />
      </BarChart>
    </ResponsiveContainer>
  );
};