// src/components/admin/dashboard/SalesLineChart.tsx
'use client';

import React from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer, 
    CartesianGrid,
} from 'recharts';

type SalesChartData = {
    day: string;
    sales: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-darkest p-2 border border-brand-accent rounded-md shadow-lg">
        <p className="text-sm text-brand-light-muted">{`${label}`}</p>
        <p className="text-base font-bold text-brand-accent">{`Sales: $${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const SalesLineChart = ({ salesData }: { salesData: SalesChartData[] }) => {
  return (
    <div className="mt-4 h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={salesData}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="4 2" stroke="#FFFFFF1A" />
          <XAxis 
            dataKey="day" 
            stroke="#A0A0A0" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#A0A0A0" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FFFFFF1A', strokeWidth: 2, strokeDasharray: '3 3' }} />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#f47253"
            strokeWidth={3}
            dot={{ r: 5, fill: '#f47253', stroke: '#1A1D1A', strokeWidth: 2 }}
            activeDot={{ r: 8, fill: '#f47253', stroke: '#121212', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesLineChart;