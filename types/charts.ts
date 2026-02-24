// types/charts.ts - 图表相关类型定义

import type { EChartsOption } from 'echarts';

export type ChartType = 'line' | 'bar' | 'pie';

export interface ChartConfig {
    /** 图表类型 */
    chartType: ChartType;

    /** 完整的 ECharts option 对象 */
    option: EChartsOption;

    /** 元数据（用于调试或追踪） */
    meta?: {
        generatedAt: string;
        modelUsed: string;
        inputId: string;
    };
}

export function validateChartConfig(config: any): { valid: boolean; error?: string } {
    // 1. 图表类型验证
    if (!['line', 'bar', 'pie'].includes(config?.chartType)) {
        return { valid: false, error: '不支持的图表类型' };
    }

    // 2. option 结构验证
    if (!config?.option || !config.option.series || !Array.isArray(config.option.series)) {
        return { valid: false, error: '无效的 ECharts option 结构' };
    }

    // 3. 系列非空
    if (config.option.series.length === 0) {
        return { valid: false, error: 'series 不能为空' };
    }

    return { valid: true };
}
