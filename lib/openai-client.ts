// lib/openai-client.ts - OpenAI SDK 客户端配置

import OpenAI from 'openai';

if (!process.env.DASHSCOPE_API_KEY) {
    throw new Error('Missing DASHSCOPE_API_KEY environment variable');
}

export const openaiClient = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    timeout: 50000, // 50秒超时
});

// 使用 qwen-plus 模型（Qwen3.5-Plus - 平衡性能和质量）
// 其他选项: 'qwen-turbo' (更快) 或 'qwen-max' (最高质量)
export const MODEL_NAME = 'qwen-plus';
