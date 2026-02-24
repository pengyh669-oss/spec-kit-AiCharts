// types/api.ts - API 请求和响应类型定义

import type { ChartConfig } from './charts';

export interface GenerateChartRequest {
    /** 用户输入的自然语言文本 */
    userInput: string;
}

export interface GenerateChartResponse {
    /** 生成的图表配置 */
    data: ChartConfig;
}

export interface APIErrorResponse {
    /** 错误类型 */
    error: string;

    /** 错误消息 */
    message: string;

    /** 错误码（可选） */
    code?: number;
}
