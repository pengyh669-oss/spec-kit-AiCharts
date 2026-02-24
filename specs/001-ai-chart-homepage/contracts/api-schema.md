# API Contracts: AI Chart Generator Homepage

**Feature**: 001-ai-chart-homepage  
**Date**: 2026-02-24  
**Phase**: Phase 1 - Interface Contracts

## Overview

本文档定义了 AI 图表生成器首页功能的 API 接口契约，包括请求/响应格式、错误处理、示例和测试用例。所有 API 遵循 RESTful 设计原则和项目 constitution 规范。

---

## API Endpoints

### POST /api/generate-chart

**描述**：接收用户的自然语言输入，调用 LLM 提取数据并生成 ECharts 图表配置。

**运行时**：Node.js（需要 OpenAI SDK 支持）

**速率限制**：
- 每个 IP 地址：10 次/分钟（初期配置）
- 超过限制返回 429 Too Many Requests

---

## Request Specification

### HTTP Method
```
POST
```

### Headers
```http
Content-Type: application/json
```

### Request Body

**TypeScript Interface**：

```typescript
interface GenerateChartRequest {
  /** 用户输入的自然语言文本 */
  userInput: string;
}
```

**JSON Schema**：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "userInput": {
      "type": "string",
      "minLength": 1,
      "maxLength": 2000,
      "description": "用户输入的包含数据的自然语言描述"
    }
  },
  "required": ["userInput"],
  "additionalProperties": false
}
```

**验证规则**：

| 字段      | 类型   | 必需 | 验证规则                                                |
| --------- | ------ | ---- | ------------------------------------------------------- |
| userInput | string | ✅    | 长度: 1-2000 字符<br/>不能为纯空格<br/>建议包含数值数据 |

**示例请求**：

```http
POST /api/generate-chart HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "userInput": "帮我比较一下今年一到六月，北京和上海的月度销售额：北京是 120、130、150、170、180、200；上海是 100、140、160、150、190、210"
}
```

---

## Response Specification

### Success Response (200 OK)

**TypeScript Interface**：

```typescript
interface GenerateChartResponse {
  data: ChartConfig;
}

interface ChartConfig {
  chartType: 'line' | 'bar' | 'pie';
  option: EChartsOption; // ECharts 5.x option 对象
  meta?: {
    generatedAt: string; // ISO 8601 timestamp
    modelUsed: string;   // 例如："qwen3-max-preview"
    inputId: string;     // UUID
  };
}
```

**JSON Schema**：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "data": {
      "type": "object",
      "properties": {
        "chartType": {
          "type": "string",
          "enum": ["line", "bar", "pie"]
        },
        "option": {
          "type": "object",
          "properties": {
            "title": { "type": "object" },
            "tooltip": { "type": "object" },
            "legend": { "type": "object" },
            "xAxis": { "type": "object" },
            "yAxis": { "type": "object" },
            "series": {
              "type": "array",
              "minItems": 1
            }
          },
          "required": ["series"]
        }
      },
      "required": ["chartType", "option"]
    }
  },
  "required": ["data"]
}
```

**示例响应（折线图）**：

```json
{
  "data": {
    "chartType": "line",
    "option": {
      "title": {
        "text": "2024年北京和上海月度销售额对比",
        "left": "center"
      },
      "tooltip": {
        "trigger": "axis",
        "axisPointer": {
          "type": "line"
        }
      },
      "legend": {
        "data": ["北京", "上海"],
        "top": "30px"
      },
      "xAxis": {
        "type": "category",
        "data": ["1月", "2月", "3月", "4月", "5月", "6月"],
        "boundaryGap": false
      },
      "yAxis": {
        "type": "value",
        "name": "销售额（单位）"
      },
      "series": [
        {
          "name": "北京",
          "type": "line",
          "data": [120, 130, 150, 170, 180, 200],
          "smooth": true,
          "itemStyle": {
            "color": "#5470C6"
          }
        },
        {
          "name": "上海",
          "type": "line",
          "data": [100, 140, 160, 150, 190, 210],
          "smooth": true,
          "itemStyle": {
            "color": "#91CC75"
          }
        }
      ]
    },
    "meta": {
      "generatedAt": "2026-02-24T10:30:00Z",
      "modelUsed": "qwen3-max-preview",
      "inputId": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

**示例响应（柱状图）**：

```json
{
  "data": {
    "chartType": "bar",
    "option": {
      "title": {
        "text": "各部门预算对比",
        "left": "center"
      },
      "tooltip": {
        "trigger": "axis",
        "axisPointer": {
          "type": "shadow"
        }
      },
      "xAxis": {
        "type": "category",
        "data": ["研发部", "市场部", "销售部", "运营部"]
      },
      "yAxis": {
        "type": "value",
        "name": "预算（万元）"
      },
      "series": [
        {
          "name": "预算",
          "type": "bar",
          "data": [500, 300, 400, 200],
          "itemStyle": {
            "color": "#5470C6"
          }
        }
      ]
    }
  }
}
```

**示例响应（饼图）**：

```json
{
  "data": {
    "chartType": "pie",
    "option": {
      "title": {
        "text": "市场份额分布",
        "left": "center"
      },
      "tooltip": {
        "trigger": "item",
        "formatter": "{a} <br/>{b}: {c} ({d}%)"
      },
      "legend": {
        "orient": "vertical",
        "left": "left",
        "data": ["产品A", "产品B", "产品C", "产品D"]
      },
      "series": [
        {
          "name": "市场份额",
          "type": "pie",
          "radius": "50%",
          "data": [
            { "value": 40, "name": "产品A" },
            { "value": 35, "name": "产品B" },
            { "value": 15, "name": "产品C" },
            { "value": 10, "name": "产品D" }
          ],
          "emphasis": {
            "itemStyle": {
              "shadowBlur": 10,
              "shadowOffsetX": 0,
              "shadowColor": "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ]
    }
  }
}
```

---

## Error Responses

### Error Response Format

**TypeScript Interface**：

```typescript
interface APIErrorResponse {
  error: string;        // 错误类型（machine-readable）
  message: string;      // 错误描述（human-readable）
  code?: number;        // 可选的错误代码
  details?: any;        // 可选的详细信息
}
```

**JSON Schema**：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "error": {
      "type": "string",
      "description": "错误类型标识符"
    },
    "message": {
      "type": "string",
      "description": "用户友好的错误描述"
    },
    "code": {
      "type": "number",
      "description": "可选的错误代码"
    },
    "details": {
      "description": "可选的详细错误信息"
    }
  },
  "required": ["error", "message"]
}
```

---

### 400 Bad Request

**触发条件**：
- 请求体缺少 `userInput` 字段
- `userInput` 为空字符串或纯空格
- `userInput` 超过 2000 字符
- JSON 格式错误

**示例响应**：

```json
{
  "error": "invalid_request",
  "message": "输入内容不能为空",
  "code": 4001
}
```

```json
{
  "error": "invalid_request",
  "message": "输入内容不能超过 2000 字符",
  "code": 4002
}
```

```json
{
  "error": "invalid_json",
  "message": "请求体必须是有效的 JSON 格式",
  "code": 4003
}
```

---

### 422 Unprocessable Entity

**触发条件**：
- LLM 无法从输入中提取有效数据
- LLM 返回的 JSON 格式不符合 ChartConfig 结构
- 数据验证失败（如 series 为空、数据长度不一致）

**示例响应**：

```json
{
  "error": "extraction_failed",
  "message": "无法从输入中识别数据，请尝试更清晰的描述，例如："2024年1-3月销售额：1月100万，2月120万，3月150万"",
  "code": 4221
}
```

```json
{
  "error": "validation_failed",
  "message": "AI 返回的图表配置格式不正确，请重试",
  "code": 4222,
  "details": {
    "reason": "series 数组为空"
  }
}
```

---

### 429 Too Many Requests

**触发条件**：
- 超过速率限制（每分钟 10 次请求）

**Headers**：
```http
Retry-After: 60
```

**示例响应**：

```json
{
  "error": "rate_limit_exceeded",
  "message": "请求过于频繁，请稍后再试",
  "code": 4291
}
```

---

### 500 Internal Server Error

**触发条件**：
- OpenAI SDK 调用失败（API 错误、网络错误）
- DashScope API 返回错误
- 未捕获的服务器异常

**示例响应**：

```json
{
  "error": "llm_api_error",
  "message": "AI 服务暂时不可用，请稍后重试",
  "code": 5001
}
```

```json
{
  "error": "internal_error",
  "message": "服务器内部错误，请稍后重试",
  "code": 5000
}
```

---

### 504 Gateway Timeout

**触发条件**：
- LLM 调用超时（>30 秒）

**示例响应**：

```json
{
  "error": "timeout",
  "message": "请求超时，请检查网络连接后重试",
  "code": 5041
}
```

---

## Error Code Reference

| 错误代码 | 错误类型            | HTTP Status | 描述                 |
| -------- | ------------------- | ----------- | -------------------- |
| 4001     | invalid_request     | 400         | 输入内容为空         |
| 4002     | invalid_request     | 400         | 输入内容超过长度限制 |
| 4003     | invalid_json        | 400         | 请求 JSON 格式错误   |
| 4221     | extraction_failed   | 422         | 无法提取数据         |
| 4222     | validation_failed   | 422         | 配置验证失败         |
| 4291     | rate_limit_exceeded | 429         | 超过速率限制         |
| 5000     | internal_error      | 500         | 服务器内部错误       |
| 5001     | llm_api_error       | 500         | LLM API 调用失败     |
| 5041     | timeout             | 504         | 请求超时             |

---

## API Implementation Example

### Route Handler (`app/api/generate-chart/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/openai-client';
import { buildSystemPrompt } from '@/lib/prompt-builder';
import type { GenerateChartRequest, GenerateChartResponse, APIErrorResponse } from '@/types/api';
import { validateChartConfig } from '@/types/charts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. 解析请求体
    const body = await request.json() as GenerateChartRequest;
    const { userInput } = body;

    // 2. 验证输入
    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json<APIErrorResponse>(
        { error: 'invalid_request', message: '缺少 userInput 字段', code: 4001 },
        { status: 400 }
      );
    }

    const trimmedInput = userInput.trim();
    if (trimmedInput.length === 0) {
      return NextResponse.json<APIErrorResponse>(
        { error: 'invalid_request', message: '输入内容不能为空', code: 4001 },
        { status: 400 }
      );
    }

    if (trimmedInput.length > 2000) {
      return NextResponse.json<APIErrorResponse>(
        { error: 'invalid_request', message: '输入内容不能超过 2000 字符', code: 4002 },
        { status: 400 }
      );
    }

    // 3. 调用 LLM
    const completion = await openaiClient.chat.completions.create({
      model: 'qwen3-max-preview',
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: `请将以下描述转换为 ECharts 配置 JSON：\n\n${trimmedInput}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000,
    });

    // 4. 解析响应
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('LLM 返回空内容');
    }

    const chartConfig = JSON.parse(content);

    // 5. 验证配置
    const validation = validateChartConfig(chartConfig);
    if (!validation.valid) {
      return NextResponse.json<APIErrorResponse>(
        {
          error: 'validation_failed',
          message: '无法从输入中识别数据，请尝试更清晰的描述',
          code: 4221,
          details: { reason: validation.error },
        },
        { status: 422 }
      );
    }

    // 6. 添加元数据
    chartConfig.meta = {
      generatedAt: new Date().toISOString(),
      modelUsed: 'qwen3-max-preview',
      inputId: crypto.randomUUID(),
    };

    // 7. 返回成功响应
    return NextResponse.json<GenerateChartResponse>({ data: chartConfig });

  } catch (error: any) {
    // 错误处理
    console.error('Generate chart error:', error);

    // JSON 解析错误
    if (error instanceof SyntaxError) {
      return NextResponse.json<APIErrorResponse>(
        { error: 'extraction_failed', message: 'AI 返回格式错误，请重试', code: 4222 },
        { status: 422 }
      );
    }

    // OpenAI SDK 错误
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return NextResponse.json<APIErrorResponse>(
        { error: 'timeout', message: '请求超时，请检查网络连接后重试', code: 5041 },
        { status: 504 }
      );
    }

    // 默认错误
    return NextResponse.json<APIErrorResponse>(
      { error: 'internal_error', message: 'AI 服务暂时不可用，请稍后重试', code: 5001 },
      { status: 500 }
    );
  }
}
```

---

## Client Usage Example

### TypeScript Client (`lib/api-client.ts`)

```typescript
import type { ChartConfig } from '@/types/charts';
import type { APIErrorResponse } from '@/types/api';

export class ChartAPIError extends Error {
  code?: number;
  type: string;

  constructor(response: APIErrorResponse) {
    super(response.message);
    this.name = 'ChartAPIError';
    this.type = response.error;
    this.code = response.code;
  }
}

export async function generateChart(userInput: string): Promise<ChartConfig> {
  const response = await fetch('/api/generate-chart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userInput }),
  });

  if (!response.ok) {
    const errorData: APIErrorResponse = await response.json();
    throw new ChartAPIError(errorData);
  }

  const { data } = await response.json();
  return data;
}
```

### React Component Usage

```typescript
'use client';
import { useState } from 'react';
import { generateChart, ChartAPIError } from '@/lib/api-client';
import type { ChartConfig } from '@/types/charts';

export function ChartGenerator() {
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (input: string) => {
    setLoading(true);
    setError(null);

    try {
      const config = await generateChart(input);
      setChartConfig(config);
    } catch (err) {
      if (err instanceof ChartAPIError) {
        setError(err.message);
      } else {
        setError('网络错误，请检查连接后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* UI components */}
    </div>
  );
}
```

---

## Testing Guidelines

### Unit Tests (API Route)

```typescript
// __tests__/api/generate-chart.test.ts
import { POST } from '@/app/api/generate-chart/route';
import { NextRequest } from 'next/server';

describe('POST /api/generate-chart', () => {
  it('should return 400 when userInput is empty', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-chart', {
      method: 'POST',
      body: JSON.stringify({ userInput: '' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('invalid_request');
    expect(data.code).toBe(4001);
  });

  it('should return 400 when userInput exceeds max length', async () => {
    const longInput = 'a'.repeat(2001);
    const request = new NextRequest('http://localhost:3000/api/generate-chart', {
      method: 'POST',
      body: JSON.stringify({ userInput: longInput }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe(4002);
  });

  it('should return 200 with valid chart config', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-chart', {
      method: 'POST',
      body: JSON.stringify({
        userInput: '2024年销售额：1月100万，2月120万，3月150万'
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveProperty('chartType');
    expect(data.data).toHaveProperty('option');
    expect(['line', 'bar', 'pie']).toContain(data.data.chartType);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/chart-generation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chart Generation', () => {
  test('should generate chart from user input', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 输入数据
    const input = page.locator('input[placeholder*="输入包含数据的描述"]');
    await input.fill('2024年1-3月销售额：1月100万，2月120万，3月150万');

    // 点击发送
    await page.click('button:has-text("发送")');

    // 等待图表渲染
    await page.waitForSelector('div[_echarts_instance_]', { timeout: 10000 });

    // 验证图表存在
    const chart = page.locator('div[_echarts_instance_]');
    await expect(chart).toBeVisible();
  });

  test('should show error for empty input', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const button = page.locator('button:has-text("发送")');
    await expect(button).toBeDisabled();
  });
});
```

---

## Performance Benchmarks

| 指标                | 目标值   | 测量方法             |
| ------------------- | -------- | -------------------- |
| API 响应时间（P50） | <3s      | LLM 调用 + JSON 解析 |
| API 响应时间（P95） | <5s      | 包含网络延迟         |
| 请求体大小          | <10KB    | 典型用户输入         |
| 响应体大小          | <100KB   | ChartConfig JSON     |
| 并发处理能力        | 10 req/s | 初期目标             |

---

## Security Considerations

1. **输入验证**：
   - 严格验证 `userInput` 长度（防止滥用）
   - 检查 JSON 格式（防止注入攻击）

2. **速率限制**：
   - 每 IP 每分钟 10 次请求
   - 使用 `next-rate-limit` 或 Upstash Redis

3. **API Key 安全**：
   - `DASHSCOPE_API_KEY` 存储在 `.env.local`
   - 不在客户端暴露 API Key
   - 生产环境使用环境变量

4. **错误信息**：
   - 不在错误响应中暴露敏感信息（如 API Key、堆栈跟踪）
   - 生产环境使用友好错误信息

5. **CORS 设置**：
   - 仅允许同源请求（初期）
   - 如需跨域，配置白名单

---

## Changelog

| 版本  | 日期       | 变更内容                                     |
| ----- | ---------- | -------------------------------------------- |
| 1.0.0 | 2026-02-24 | 初始版本：定义 POST /api/generate-chart 接口 |

---

## Next Steps

Phase 1 继续：
1. ✅ **data-model.md** - 已完成
2. ✅ **contracts/api-schema.md** - 本文档（已完成）
3. ⏭️ **quickstart.md** - 快速开始指南

---

**Document Status**: ✅ Complete  
**Last Updated**: 2026-02-24  
**Next**: quickstart.md
