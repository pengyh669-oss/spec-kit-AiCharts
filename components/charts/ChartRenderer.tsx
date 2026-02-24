// components/charts/ChartRenderer.tsx - 通用图表渲染器

'use client';

import { useEffect, useRef } from 'react';
import type { ChartConfig } from '@/types';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';

interface ChartRendererProps {
    config: ChartConfig;
}

export function ChartRenderer({ config }: ChartRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // 监听窗口大小变化，确保图表响应式
    useEffect(() => {
        const handleResize = () => {
            // ECharts 会自动处理 resize，这里预留扩展空间
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 根据图表类型选择对应的组件
    const renderChart = () => {
        switch (config.chartType) {
            case 'line':
                return <LineChart option={config.option} />;
            case 'bar':
                return <BarChart option={config.option} />;
            case 'pie':
                return <PieChart option={config.option} />;
            default:
                return (
                    <div className="flex items-center justify-center h-[400px] text-gray-500">
                        不支持的图表类型: {config.chartType}
                    </div>
                );
        }
    };

    return (
        <div ref={containerRef} className="w-full">
            {renderChart()}
        </div>
    );
}
