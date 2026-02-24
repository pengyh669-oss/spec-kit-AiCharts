// components/charts/PieChart.tsx - 饼图组件

'use client';

import { useRef, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { mergeChartConfig, getResponsiveChartHeight } from '@/lib/chart-configs/defaults';

interface PieChartProps {
    option: EChartsOption;
}

export function PieChart({ option }: PieChartProps) {
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
            // 增强 series 配置：添加悬停放大效果、边框、标签
            series: Array.isArray(option.series)
                ? option.series.map((s) => ({
                    ...s,
                    radius: ['40%', '70%'], // 环形饼图（内圈40%，外圈70%）
                    center: ['50%', '50%'], // 居中显示
                    avoidLabelOverlap: true, // 避免标签重叠
                    itemStyle: {
                        borderRadius: 8, // 扇形圆角
                        borderColor: '#fff',
                        borderWidth: 2,
                    },
                    label: {
                        show: true,
                        formatter: '{b}: {d}%', // 显示名称和百分比
                        fontSize: 12,
                    },
                    emphasis: {
                        // 鼠标悬停时放大效果
                        scale: true,
                        scaleSize: 10,
                        itemStyle: {
                            shadowBlur: 20,
                            shadowColor: 'rgba(0, 0, 0, 0.3)',
                        },
                        label: {
                            show: true,
                            fontSize: 14,
                            fontWeight: 'bold',
                        },
                    },
                    labelLine: {
                        show: true,
                        smooth: true, // 平滑引导线
                        length: 15,
                        length2: 10,
                    },
                }))
                : [],
        },
        'pie'
    );

    return (
        <div
            role="img"
            aria-label={`饼图: ${option.title && typeof option.title === 'object' && 'text' in option.title ? option.title.text : '数据可视化'}`}
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
