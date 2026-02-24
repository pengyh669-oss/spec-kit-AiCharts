// lib/chart-configs/defaults.ts - ECharts 默认配置

import type { EChartsOption } from 'echarts';
import { getChartColors } from './themes';

/**
 * 通用 ECharts 默认配置
 * 包含响应式设计、交互功能、可访问性优化
 */
export const baseChartConfig: Partial<EChartsOption> = {
    // 响应式配置
    animation: true,
    animationDuration: 750,
    animationEasing: 'cubicOut',

    // 全局颜色主题
    color: getChartColors(),

    // 工具提示（tooltip）默认配置
    tooltip: {
        trigger: 'axis', // 默认轴触发（折线图/柱状图）
        confine: true, // 限制在图表区域内
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: 'transparent',
        borderWidth: 0,
        textStyle: {
            color: '#fff',
            fontSize: 14,
        },
        padding: [8, 12],
        extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); border-radius: 6px;',
    },

    // 图例（legend）默认配置
    legend: {
        top: 'bottom',
        left: 'center',
        padding: [10, 0],
        itemGap: 20,
        itemWidth: 25,
        itemHeight: 14,
        textStyle: {
            fontSize: 14,
            color: '#666',
        },
        // 图例交互：点击切换显示/隐藏系列
        selectedMode: true,
    },

    // 网格（grid）默认配置 - 适用于直角坐标系
    grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true, // 包含刻度标签在内
    },

    // 标题（title）默认样式
    title: {
        textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
        },
        subtextStyle: {
            fontSize: 14,
            color: '#666',
        },
        left: 'center',
        top: 10,
    },
};

/**
 * 折线图特定默认配置
 */
export const lineChartDefaults: Partial<EChartsOption> = {
    ...baseChartConfig,
    tooltip: {
        ...baseChartConfig.tooltip,
        trigger: 'axis',
        axisPointer: {
            type: 'cross', // 十字准星指示器
            label: {
                backgroundColor: '#6a7985',
            },
            crossStyle: {
                color: '#999',
                type: 'dashed',
            },
        },
    },
    xAxis: {
        type: 'category',
        boundaryGap: false, // 坐标轴两边不留白
        axisLine: {
            lineStyle: {
                color: '#ddd',
            },
        },
        axisLabel: {
            color: '#666',
            fontSize: 12,
        },
    },
    yAxis: {
        type: 'value',
        splitLine: {
            lineStyle: {
                color: '#f0f0f0',
                type: 'dashed',
            },
        },
        axisLine: {
            show: false,
        },
        axisLabel: {
            color: '#666',
            fontSize: 12,
        },
    },
};

/**
 * 柱状图特定默认配置
 */
export const barChartDefaults: Partial<EChartsOption> = {
    ...baseChartConfig,
    tooltip: {
        ...baseChartConfig.tooltip,
        trigger: 'axis',
        axisPointer: {
            type: 'shadow', // 阴影指示器
            shadowStyle: {
                color: 'rgba(150, 150, 150, 0.1)',
            },
        },
    },
    xAxis: {
        type: 'category',
        axisLine: {
            lineStyle: {
                color: '#ddd',
            },
        },
        axisLabel: {
            color: '#666',
            fontSize: 12,
        },
    },
    yAxis: {
        type: 'value',
        splitLine: {
            lineStyle: {
                color: '#f0f0f0',
                type: 'dashed',
            },
        },
        axisLine: {
            show: false,
        },
        axisLabel: {
            color: '#666',
            fontSize: 12,
        },
    },
};

/**
 * 饼图特定默认配置
 */
export const pieChartDefaults: Partial<EChartsOption> = {
    ...baseChartConfig,
    tooltip: {
        ...baseChartConfig.tooltip,
        trigger: 'item', // 饼图使用 item 触发
        formatter: '{a} <br/>{b}: {c} ({d}%)', // 格式化：系列名 分类名: 数值 (百分比)
    },
    legend: {
        ...baseChartConfig.legend,
        orient: 'vertical',
        left: 'left',
        top: 'center',
    },
};

/**
 * 合并用户配置和默认配置
 * 深度合并策略：用户配置优先级更高
 */
export function mergeChartConfig(
    userConfig: EChartsOption,
    chartType: 'line' | 'bar' | 'pie'
): EChartsOption {
    let defaults: Partial<EChartsOption>;

    switch (chartType) {
        case 'line':
            defaults = lineChartDefaults;
            break;
        case 'bar':
            defaults = barChartDefaults;
            break;
        case 'pie':
            defaults = pieChartDefaults;
            break;
        default:
            defaults = baseChartConfig;
    }

    // 深度合并（简单实现，生产环境建议使用 lodash.merge）
    return {
        ...defaults,
        ...userConfig,
        tooltip: { ...defaults.tooltip, ...userConfig.tooltip },
        legend: { ...defaults.legend, ...userConfig.legend },
        title: { ...defaults.title, ...userConfig.title },
        grid: { ...defaults.grid, ...userConfig.grid },
    };
}

/**
 * 根据视口大小动态计算图表高度
 * @param baseHeight 基础高度（默认 400px）
 * @returns 响应式高度（px）
 */
export function getResponsiveChartHeight(baseHeight = 400): number {
    if (typeof window === 'undefined') {
        return baseHeight;
    }

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // 移动端（宽度 < 768px）
    if (viewportWidth < 768) {
        return Math.min(viewportHeight * 0.4, 300); // 不超过视口的 40%，最大 300px
    }

    // 平板端（宽度 768px - 1024px）
    if (viewportWidth < 1024) {
        return Math.min(viewportHeight * 0.5, 400); // 不超过视口的 50%，最大 400px
    }

    // 桌面端（宽度 >= 1024px）
    return Math.min(viewportHeight * 0.6, baseHeight); // 不超过视口的 60%，最大为 baseHeight
}

/**
 * 创建可访问性增强配置
 * 为图表添加 ARIA 属性和语义化描述
 */
export function createAccessibilityConfig(
    chartTitle: string,
    chartDescription?: string
): Partial<EChartsOption> {
    return {
        aria: {
            enabled: true,
            decal: {
                show: true, // 启用纹理图案，帮助色盲用户区分
            },
        },
        title: {
            text: chartTitle,
            textStyle: {
                fontSize: 18,
                fontWeight: 'bold',
                color: '#333',
            },
            subtext: chartDescription,
        },
    };
}

/**
 * 响应式字体大小配置
 * 根据视口宽度动态调整字体
 */
export function getResponsiveFontSizes(): {
    title: number;
    label: number;
    legend: number;
} {
    if (typeof window === 'undefined') {
        return { title: 18, label: 12, legend: 14 };
    }

    const viewportWidth = window.innerWidth;

    // 移动端
    if (viewportWidth < 768) {
        return {
            title: 14,
            label: 10,
            legend: 12,
        };
    }

    // 平板端
    if (viewportWidth < 1024) {
        return {
            title: 16,
            label: 11,
            legend: 13,
        };
    }

    // 桌面端
    return {
        title: 18,
        label: 12,
        legend: 14,
    };
}
