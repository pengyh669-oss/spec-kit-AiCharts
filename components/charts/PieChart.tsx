// components/charts/PieChart.tsx - 饼图组件

'use client';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface PieChartProps {
    option: EChartsOption;
}

export function PieChart({ option }: PieChartProps) {
    return (
        <ReactECharts
            option={option}
            style={{ height: '400px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
        />
    );
}
