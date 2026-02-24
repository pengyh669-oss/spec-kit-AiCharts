// components/charts/LineChart.tsx - 折线图组件

'use client';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface LineChartProps {
    option: EChartsOption;
}

export function LineChart({ option }: LineChartProps) {
    return (
        <ReactECharts
            option={option}
            style={{ height: '400px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
        />
    );
}
