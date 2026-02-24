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
    const chartInstanceRef = useRef<any>(null);

    // 监听窗口大小变化，确保图表响应式调整
    useEffect(() => {
        const handleResize = () => {
            // 获取 ECharts 实例并调用 resize 方法
            // 由于我们使用 ReactECharts，需要通过 ref 获取实例
            if (chartInstanceRef.current) {
                const echartsInstance = chartInstanceRef.current.getEchartsInstance();
                if (echartsInstance) {
                    echartsInstance.resize();
                }
            }
        };

        // 防抖处理，避免频繁触发 resize
        let timeoutId: NodeJS.Timeout;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 200);
        };

        window.addEventListener('resize', debouncedResize);

        // 清理事件监听器
        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(timeoutId);
        };
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
        <div
            ref={containerRef}
            className="w-full"
            role="region"
            aria-label="图表显示区域"
        >
            {renderChart()}
        </div>
    );
}
