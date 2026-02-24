// lib/api-client.ts - API 调用封装

import type { GenerateChartRequest, GenerateChartResponse, APIErrorResponse } from '@/types';

export async function generateChart(userInput: string): Promise<GenerateChartResponse> {
    // 创建超时控制器（60秒超时，AI 生成较复杂图表可能需要更长时间）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
        const response = await fetch('/api/generate-chart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput } as GenerateChartRequest),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            const error = data as APIErrorResponse;
            throw new Error(error.message || '图表生成失败');
        }

        return data as GenerateChartResponse;
    } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('请求超时，请稍后重试');
        }
        throw error;
    }
}
