// app/api/generate-chart/route.ts - 图表生成 API

import { NextRequest, NextResponse } from 'next/server';
import { openaiClient, MODEL_NAME } from '@/lib/openai-client';
import { buildSystemPrompt } from '@/lib/prompt-builder';
import { validateUserInput, validateChartConfig } from '@/types';
import type { GenerateChartRequest, GenerateChartResponse, APIErrorResponse } from '@/types';

// 使用 Node.js 运行时（OpenAI SDK 需要）
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // 1. 解析请求体
        const body: GenerateChartRequest = await request.json();
        const { userInput } = body;

        // 2. 验证用户输入
        const validation = validateUserInput(userInput);
        if (!validation.valid) {
            return NextResponse.json(
                {
                    error: 'VALIDATION_ERROR',
                    message: validation.error || '输入验证失败',
                } as APIErrorResponse,
                { status: 400 }
            );
        }

        // 3. 调用 OpenAI SDK（DashScope API）
        const completion = await openaiClient.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                { role: 'system', content: buildSystemPrompt() },
                {
                    role: 'user',
                    content: `请将以下描述转换为 ECharts 配置 JSON：\n\n${userInput}`
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3, // 降低随机性，确保输出一致性
        });

        // 4. 解析 AI 响应
        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error('AI 返回内容为空');
        }

        const chartConfig = JSON.parse(content);

        // 5. 验证图表配置
        const configValidation = validateChartConfig(chartConfig);
        if (!configValidation.valid) {
            return NextResponse.json(
                {
                    error: 'INVALID_CONFIG',
                    message: configValidation.error || '生成的图表配置无效',
                } as APIErrorResponse,
                { status: 500 }
            );
        }

        // 6. 添加元数据
        chartConfig.meta = {
            generatedAt: new Date().toISOString(),
            modelUsed: MODEL_NAME,
            inputId: crypto.randomUUID(),
        };

        // 7. 返回成功响应
        return NextResponse.json({
            data: chartConfig,
        } as GenerateChartResponse);

    } catch (error: any) {
        // 错误处理
        console.error('Chart generation error:', error);

        // JSON 解析错误
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    error: 'JSON_PARSE_ERROR',
                    message: 'AI 返回的数据格式错误，请重试',
                } as APIErrorResponse,
                { status: 500 }
            );
        }

        // OpenAI API 错误
        if (error.status) {
            return NextResponse.json(
                {
                    error: 'AI_API_ERROR',
                    message: `AI 服务错误: ${error.message}`,
                    code: error.status,
                } as APIErrorResponse,
                { status: error.status }
            );
        }

        // 通用错误
        return NextResponse.json(
            {
                error: 'INTERNAL_ERROR',
                message: '图表生成失败，请稍后重试',
            } as APIErrorResponse,
            { status: 500 }
        );
    }
}
