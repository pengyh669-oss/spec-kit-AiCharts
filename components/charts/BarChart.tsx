// components/charts/BarChart.tsx - 柱状图组件

'use client';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface BarChartProps {
    option: EChartsOption;
}

export function BarChart({ option }: BarChartProps) {
    return (
        <ReactECharts
            option={option}
            style={{ height: '400px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
        />
    );
}
