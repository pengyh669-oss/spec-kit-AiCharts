// components/charts/LineChart.tsx - 折线图组件

'use client';

import { useRef, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { mergeChartConfig, getResponsiveChartHeight } from '@/lib/chart-configs/defaults';

interface LineChartProps {
    option: EChartsOption;
}

export function LineChart({ option }: LineChartProps) {
    const chartRef = useRef<ReactECharts>(null);
    const [chartHeight, setChartHeight] = useState(getResponsiveChartHeight(400));

    // 响应式高度调整：监听窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            setChartHeight(getResponsiveChartHeight(400));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 合并默认配置和用户配置
    const enhancedOption: EChartsOption = mergeChartConfig(
        {
            ...option,
            // 增强 series 配置：添加平滑曲线、区域填充、动画效果
            series: Array.isArray(option.series)
                ? option.series.map((s) => ({
                    ...s,
                    smooth: true, // 平滑曲线
                    smoothMonotone: 'x', // 单调平滑（避免数据失真）
                    symbol: 'circle', // 数据点符号
                    symbolSize: 6, // 数据点大小
                    lineStyle: {
                        width: 2,
                    },
                    emphasis: {
                        focus: 'series', // 高亮当前系列
                        itemStyle: {
                            borderColor: '#fff',
                            borderWidth: 2,
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.3)',
                        },
                    },
                    // 区域填充（可选，渐变效果）
                    areaStyle: {
                        opacity: 0.1,
                    },
                }))
                : [],
        },
        'line'
    );

    return (
        <div
            role="img"
            aria-label={`折线图: ${option.title && typeof option.title === 'object' && 'text' in option.title ? option.title.text : '数据可视化'}`}
        >
            <ReactECharts
                ref={chartRef}
                option={enhancedOption}
                style={{ height: `${chartHeight}px`, width: '100%' }}
                opts={{ renderer: 'canvas', locale: 'ZH' }}
                notMerge={true}
                lazyUpdate={true}
            />
        </div>
    );
}
