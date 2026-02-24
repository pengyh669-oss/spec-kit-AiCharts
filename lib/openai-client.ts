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

// 使用 qwen-turbo 模型（更快，适合简单任务）
// 如果需要更高质量可改为 'qwen-max' 或 'qwen-plus'
export const MODEL_NAME = 'qwen-turbo';
