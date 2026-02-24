// lib/openai-client.ts - OpenAI SDK 客户端配置

import OpenAI from 'openai';

if (!process.env.DASHSCOPE_API_KEY) {
    throw new Error('Missing DASHSCOPE_API_KEY environment variable');
}

export const openaiClient = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

export const MODEL_NAME = 'qwen-max';
