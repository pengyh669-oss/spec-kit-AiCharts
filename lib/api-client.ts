// lib/api-client.ts - API 调用封装

import type { GenerateChartRequest, GenerateChartResponse, APIErrorResponse } from '@/types';

export async function generateChart(userInput: string): Promise<GenerateChartResponse> {
    const response = await fetch('/api/generate-chart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput } as GenerateChartRequest),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = data as APIErrorResponse;
        throw new Error(error.message || '图表生成失败');
    }

    return data as GenerateChartResponse;
}
