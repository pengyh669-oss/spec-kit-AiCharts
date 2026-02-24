// components/charts/BarChart.tsx - 柱状图组件

'use client';

import { useRef, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { mergeChartConfig, getResponsiveChartHeight } from '@/lib/chart-configs/defaults';

interface BarChartProps {
    option: EChartsOption;
}

export function BarChart({ option }: BarChartProps) {
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
            // 增强 series 配置：添加悬停效果、圆角、动画
            series: Array.isArray(option.series)
                ? option.series.map((s) => ({
                    ...s,
                    barMaxWidth: 60, // 柱子最大宽度
                    itemStyle: {
                        borderRadius: [4, 4, 0, 0], // 顶部圆角
                    },
                    emphasis: {
                        focus: 'series', // 高亮当前系列
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.3)',
                            borderColor: '#fff',
                            borderWidth: 1,
                        },
                    },
                    // 柱状图标签（显示数值）
                    label: {
                        show: false, // 默认不显示，悬停时显示
                        position: 'top',
                        formatter: '{c}',
                    },
                }))
                : [],
        },
        'bar'
    );

    return (
        <div
            role="img"
            aria-label={`柱状图: ${option.title && typeof option.title === 'object' && 'text' in option.title ? option.title.text : '数据可视化'}`}
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
