# Quick Start Guide: AI Chart Generator Homepage

**Feature**: 001-ai-chart-homepage  
**Date**: 2026-02-24  
**Phase**: Phase 1 - Quick Start Guide

## Overview

本指南提供了快速实现 AI 图表生成器首页功能的步骤，包括环境配置、依赖安装、核心文件创建和测试验证。预计完成时间：**2-3 小时**。

---

## Prerequisites

确保你的开发环境满足以下要求：

```bash
# Node.js 版本
node --version  # >= 18.17.0

# npm 版本
npm --version   # >= 9.0.0

# Git
git --version   # >= 2.0.0
```

**账号准备**：
- ✅ 阿里云 DashScope 账号（获取 API Key）
- ✅ 访问权限：https://dashscope.console.aliyun.com/

---

## Step 1: Environment Setup (15 分钟)

### 1.1 获取 DashScope API Key

1. 访问 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/)
2. 登录并进入"API-KEY 管理"
3. 创建新的 API Key 或复制现有 Key
4. **重要**：妥善保存 API Key（仅显示一次）

### 1.2 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# .env.local
DASHSCOPE_API_KEY=your_api_key_here
```

**验证配置**：

```bash
# 确保文件存在
ls .env.local

# 确保 .env.local 在 .gitignore 中（避免泄露）
cat .gitignore | grep .env.local
```

---

## Step 2: Install Dependencies (10 分钟)

### 2.1 安装核心依赖

```bash
# 安装 OpenAI SDK（用于调用 DashScope API）
npm install openai

# 安装 ECharts 和 React 封装
npm install echarts echarts-for-react

# 安装 shadcn/ui 组件（如果尚未初始化）
npx shadcn@latest init
```

**shadcn/ui 初始化配置**（按提示选择）：

```
√ Would you like to use TypeScript (recommended)? ... yes
√ Which style would you like to use? » Default
√ Which color would you like to use as base color? » Slate
√ Where is your global CSS file? ... app/globals.css
√ Would you like to use CSS variables for colors? ... yes
√ Where is your tailwind.config.js located? ... tailwind.config.ts
√ Configure the import alias for components: ... @/components
√ Configure the import alias for utils: ... @/lib/utils
√ Are you using React Server Components? ... yes
```

### 2.2 安装 shadcn/ui 组件

```bash
# 安装需要的基础组件
npx shadcn@latest add input
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add alert
npx shadcn@latest add toast

# 验证组件已安装
ls components/ui/
# 应该看到：input.tsx, button.tsx, card.tsx, alert.tsx, toast.tsx
```

### 2.3 安装开发依赖（可选）

```bash
# 测试框架
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom

# E2E 测试
npm install -D @playwright/test

# Zod（用于数据验证）
npm install zod
```

---

## Step 3: Create Type Definitions (15 分钟)

### 3.1 创建 `types/models.ts`

```typescript
// types/models.ts
export interface UserInput {
  id: string;
  content: string;
  submittedAt: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  errorMessage?: string;
}

export interface DataSeries {
  name: string;
  data: number[];
}

export interface StructuredData {
  series: DataSeries[];
  labels: string[];
  dataType: 'timeSeries' | 'categorical' | 'percentage';
  unit?: string;
  title?: string;
}

export function validateUserInput(input: string): { valid: boolean; error?: string } {
  if (!input.trim()) {
    return { valid: false, error: '输入内容不能为空' };
  }
  if (input.length > 2000) {
    return { valid: false, error: '输入内容不能超过 2000 字符' };
  }
  return { valid: true };
}
```

### 3.2 创建 `types/charts.ts`

```typescript
// types/charts.ts
import type { EChartsOption } from 'echarts';

export type ChartType = 'line' | 'bar' | 'pie';

export interface ChartConfig {
  chartType: ChartType;
  option: EChartsOption;
  meta?: {
    generatedAt: string;
    modelUsed: string;
    inputId: string;
  };
}

export function validateChartConfig(config: any): { valid: boolean; error?: string } {
  if (!['line', 'bar', 'pie'].includes(config?.chartType)) {
    return { valid: false, error: '不支持的图表类型' };
  }
  if (!config?.option?.series || !Array.isArray(config.option.series)) {
    return { valid: false, error: '无效的 ECharts option 结构' };
  }
  if (config.option.series.length === 0) {
    return { valid: false, error: 'series 不能为空' };
  }
  return { valid: true };
}
```

### 3.3 创建 `types/api.ts`

```typescript
// types/api.ts
import type { ChartConfig } from './charts';

export interface GenerateChartRequest {
  userInput: string;
}

export interface GenerateChartResponse {
  data: ChartConfig;
}

export interface APIErrorResponse {
  error: string;
  message: string;
  code?: number;
}
```

### 3.4 创建 `types/index.ts`（统一导出）

```typescript
// types/index.ts
export type { UserInput, StructuredData, DataSeries } from './models';
export type { ChartConfig, ChartType } from './charts';
export type { GenerateChartRequest, GenerateChartResponse, APIErrorResponse } from './api';
export { validateUserInput } from './models';
export { validateChartConfig } from './charts';
```

---

## Step 4: Implement Backend API (30 分钟)

### 4.1 创建 `lib/openai-client.ts`

```typescript
// lib/openai-client.ts
import OpenAI from 'openai';

if (!process.env.DASHSCOPE_API_KEY) {
  throw new Error('Missing DASHSCOPE_API_KEY environment variable');
}

export const openaiClient = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});
```

### 4.2 创建 `lib/prompt-builder.ts`

```typescript
// lib/prompt-builder.ts
export function buildSystemPrompt(): string {
  return `你是一个专业的数据可视化助手，负责将用户的自然语言描述转换为 ECharts 配置 JSON。

**输出要求**（严格遵守）：
1. 必须返回 JSON 对象，包含 chartType 和 option 两个字段
2. chartType 只能是：'line', 'bar', 'pie' 之一
3. option 必须是完整的 ECharts option 对象，包含：
   - title: { text: string } (图表标题)
   - tooltip: { trigger: 'axis' | 'item' } (提示框)
   - legend: { data: string[] } (图例，多系列时必需)
   - xAxis: { type: 'category' | 'value', data?: string[] } (X轴，折线图/柱状图)
   - yAxis: { type: 'value' } (Y轴，折线图/柱状图)
   - series: Array<{ name: string, type: string, data: number[] | object[] }> (数据系列)

**数据提取规则**：
- 识别并提取所有数值（支持"100万"、"1M"、"120k"等格式，转换为数字）
- 识别时间/日期（"1月"、"2024年Q1"等）作为 X 轴标签
- 识别分类名称（"北京"、"产品A"等）作为系列名或标签

**图表类型选择规则**：
- 时间序列数据（按月、按年等） → line（折线图）
- 分类对比数据（城市对比、产品对比） → bar（柱状图）
- 占比数据（市场份额、百分比） → pie（饼图）
- 用户明确指定图表类型（"用柱状图显示"）→ 优先使用指定类型

**示例输出**：
{
  "chartType": "line",
  "option": {
    "title": { "text": "2024年销售额趋势" },
    "tooltip": { "trigger": "axis" },
    "xAxis": { "type": "category", "data": ["1月", "2月", "3月"] },
    "yAxis": { "type": "value", "name": "销售额（万元）" },
    "series": [{
      "name": "销售额",
      "type": "line",
      "data": [100, 120, 150],
      "smooth": true
    }]
  }
}

请严格按照上述 JSON 格式输出，不要包含任何其他解释文字或 Markdown 格式。`;
}
```

### 4.3 创建 `app/api/generate-chart/route.ts`

```typescript
// app/api/generate-chart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/openai-client';
import { buildSystemPrompt } from '@/lib/prompt-builder';
import { validateChartConfig } from '@/types/charts';
import type { GenerateChartRequest, GenerateChartResponse, APIErrorResponse } from '@/types/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateChartRequest = await request.json();
    const { userInput } = body;

    // 验证输入
    if (!userInput?.trim()) {
      return NextResponse.json<APIErrorResponse>(
        { error: 'invalid_request', message: '输入内容不能为空', code: 4001 },
        { status: 400 }
      );
    }

    if (userInput.length > 2000) {
      return NextResponse.json<APIErrorResponse>(
        { error: 'invalid_request', message: '输入内容不能超过 2000 字符', code: 4002 },
        { status: 400 }
      );
    }

    // 调用 LLM
    const completion = await openaiClient.chat.completions.create({
      model: 'qwen3-max-preview',
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: `请将以下描述转换为 ECharts 配置 JSON：\n\n${userInput}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('LLM 返回空内容');
    }

    const chartConfig = JSON.parse(content);

    // 验证配置
    const validation = validateChartConfig(chartConfig);
    if (!validation.valid) {
      return NextResponse.json<APIErrorResponse>(
        {
          error: 'validation_failed',
          message: '无法从输入中识别数据，请尝试更清晰的描述',
          code: 4221,
        },
        { status: 422 }
      );
    }

    // 添加元数据
    chartConfig.meta = {
      generatedAt: new Date().toISOString(),
      modelUsed: 'qwen3-max-preview',
      inputId: crypto.randomUUID(),
    };

    return NextResponse.json<GenerateChartResponse>({ data: chartConfig });

  } catch (error: any) {
    console.error('Generate chart error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json<APIErrorResponse>(
        { error: 'extraction_failed', message: 'AI 返回格式错误，请重试', code: 4222 },
        { status: 422 }
      );
    }

    return NextResponse.json<APIErrorResponse>(
      { error: 'internal_error', message: 'AI 服务暂时不可用，请稍后重试', code: 5001 },
      { status: 500 }
    );
  }
}
```

---

## Step 5: Implement Frontend Components (45 分钟)

### 5.1 创建 API 客户端 `lib/api-client.ts`

```typescript
// lib/api-client.ts
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
    headers: { 'Content-Type': 'application/json' },
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

### 5.2 创建图表渲染组件 `components/charts/ChartRenderer.tsx`

```typescript
// components/charts/ChartRenderer.tsx
'use client';
import { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

// 注册必需的组件
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

interface ChartRendererProps {
  option: EChartsOption;
}

export function ChartRenderer({ option }: ChartRendererProps) {
  const chartRef = useRef<ReactECharts>(null);

  useEffect(() => {
    const handleResize = () => {
      chartRef.current?.getEchartsInstance().resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ReactECharts
      ref={chartRef}
      option={option}
      style={{ height: '400px', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
```

### 5.3 创建输入组件 `components/ChatInput.tsx`

```typescript
// components/ChatInput.tsx
'use client';
import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSubmit: (input: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      await onSubmit(input);
      setInput(''); // 清空输入
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-3xl">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入包含数据的描述，例如：2024年1-6月销售额..."
        className="flex-1"
        disabled={loading || disabled}
      />
      <Button type="submit" disabled={!input.trim() || loading || disabled}>
        {loading ? '生成中...' : '发送'}
      </Button>
    </form>
  );
}
```

### 5.4 创建主页面 `app/page.tsx`

```typescript
// app/page.tsx
'use client';
import { useState } from 'react';
import { ChartRenderer } from '@/components/charts/ChartRenderer';
import { ChatInput } from '@/components/ChatInput';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateChart, ChartAPIError } from '@/lib/api-client';
import type { ChartConfig } from '@/types/charts';

export default function HomePage() {
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasChart, setHasChart] = useState(false);

  const handleSubmit = async (input: string) => {
    setError(null);
    try {
      const config = await generateChart(input);
      setChartConfig(config);
      setHasChart(true);
    } catch (err) {
      if (err instanceof ChartAPIError) {
        setError(err.message);
      } else {
        setError('网络错误，请检查连接后重试');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 图表区域 */}
      <div
        className={`
          transition-all duration-500 ease-in-out
          ${hasChart ? 'flex-1 opacity-100 p-6' : 'h-0 opacity-0 overflow-hidden'}
        `}
      >
        {chartConfig && (
          <Card className="max-w-5xl mx-auto p-6">
            <ChartRenderer option={chartConfig.option} />
          </Card>
        )}
      </div>

      {/* 输入框区域 */}
      <div
        className={`
          transition-all duration-500 ease-in-out p-6
          ${hasChart ? '' : 'flex-1 flex items-center justify-center'}
        `}
      >
        <div className="w-full max-w-3xl mx-auto space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <ChatInput onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
```

---

## Step 6: Test the Application (20 分钟)

### 6.1 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:3000

### 6.2 手动测试

**测试用例 1：基础折线图**

输入：
```
2024年销售额：1月100万，2月120万，3月150万
```

预期结果：
- ✅ 显示折线图
- ✅ X 轴显示月份（1月、2月、3月）
- ✅ Y 轴显示数值（100、120、150）
- ✅ 布局从中央转换到底部

---

**测试用例 2：多系列对比（柱状图/折线图）**

输入：
```
帮我比较一下今年一到六月，北京和上海的月度销售额：北京是 120、130、150、170、180、200；上海是 100、140、160、150、190、210
```

预期结果：
- ✅ 显示柱状图或折线图
- ✅ 两条数据系列（北京、上海）
- ✅ 图例区分不同系列
- ✅ 颜色清晰可辨

---

**测试用例 3：饼图**

输入：
```
用饼图展示市场份额：产品A 40%，产品B 35%，产品C 25%
```

预期结果：
- ✅ 显示饼图
- ✅ 三个扇形区域（产品 A、B、C）
- ✅ 百分比正确显示

---

**测试用例 4：错误处理（空输入）**

操作：
- 不输入任何内容，点击"发送"

预期结果：
- ✅ 发送按钮禁用状态

---

**测试用例 5：错误处理（无效数据）**

输入：
```
今天天气真好
```

预期结果：
- ✅ 显示错误提示："无法从输入中识别数据，请尝试更清晰的描述"
- ✅ 输入框仍可用，可重试

---

### 6.3 响应式测试

1. **桌面端**（1920×1080）：
   - ✅ 图表占据合理宽度（不超过 1200px）
   - ✅ 输入框居中显示
   - ✅ 布局转换流畅

2. **移动端**（375×667，使用浏览器开发者工具）：
   - ✅ 图表适配小屏幕
   - ✅ 输入框占满宽度
   - ✅ 按钮大小适合触摸

---

## Step 7: Optional Enhancements (30 分钟)

### 7.1 添加 Toast 通知

```bash
# 安装 toast hook
npx shadcn@latest add toast
```

更新 `app/page.tsx`：

```typescript
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const { toast } = useToast();
  // ...

  const handleSubmit = async (input: string) => {
    try {
      const config = await generateChart(input);
      setChartConfig(config);
      setHasChart(true);
      toast({
        title: '生成成功',
        description: '图表已生成，可继续输入新数据',
      });
    } catch (err) {
      toast({
        title: '生成失败',
        description: err.message,
        variant: 'destructive',
      });
    }
  };
}
```

### 7.2 添加加载骨架屏

```bash
npx shadcn@latest add skeleton
```

```typescript
import { Skeleton } from '@/components/ui/skeleton';

// 在加载状态时显示
{loading && <Skeleton className="h-96 w-full" />}
```

### 7.3 添加输入历史记录（localStorage）

```typescript
const [inputHistory, setInputHistory] = useState<string[]>(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('inputHistory');
    return saved ? JSON.parse(saved) : [];
  }
  return [];
});

useEffect(() => {
  localStorage.setItem('inputHistory', JSON.stringify(inputHistory));
}, [inputHistory]);
```

---

## Troubleshooting（故障排查）

### 问题 1：API Key 未生效

**症状**：API 返回 401 或 403 错误

**解决方案**：
```bash
# 检查环境变量
cat .env.local | grep DASHSCOPE_API_KEY

# 重启开发服务器
npm run dev
```

---

### 问题 2：LLM 返回格式错误

**症状**：API 返回 422 错误

**解决方案**：
- 检查 System Prompt 是否正确（`lib/prompt-builder.ts`）
- 在 API Route 中添加日志：`console.log('LLM Response:', content)`
- 降低 `temperature` 参数（当前 0.3，可尝试 0.1）

---

### 问题 3：图表不显示

**症状**：页面空白，控制台无错误

**解决方案**：
```bash
# 检查 ECharts 是否正确引入
npm list echarts echarts-for-react

# 检查浏览器控制台是否有 ECharts 初始化错误
# 确保 ChartRenderer 组件正确注册了必需的 ECharts 组件
```

---

### 问题 4：布局转换不流畅

**症状**：输入框移动时有卡顿

**解决方案**：
- 检查是否使用了 `transition-all` 类（Tailwind CSS）
- 确保 `duration-500` 和 `ease-in-out` 已应用
- 在 Chrome DevTools 中启用"Rendering"→"Paint flashing"检查重绘

---

## Next Steps

完成快速启动后，你可以：

1. **阅读完整文档**：
   - [data-model.md](data-model.md) - 数据模型详解
   - [contracts/api-schema.md](contracts/api-schema.md) - API 契约
   - [research.md](research.md) - 技术选型研究

2. **编写测试**：
   - 单元测试：`__tests__/api/generate-chart.test.ts`
   - E2E 测试：`tests/e2e/chart-generation.spec.ts`

3. **功能增强**：
   - 支持更多图表类型（散点图、雷达图）
   - 添加图表导出功能（PNG、SVG）
   - 实现用户输入历史记录
   - 添加图表样式定制功能

4. **性能优化**：
   - 添加请求缓存（Redis/Vercel KV）
   - 实现流式响应（Streaming）
   - 优化 ECharts 打包体积（按需引入）

5. **部署**：
   - 部署到 Vercel（推荐）
   - 配置环境变量（DASHSCOPE_API_KEY）
   - 设置速率限制和监控

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [ECharts Documentation](https://echarts.apache.org/en/index.html)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [阿里云 DashScope API](https://help.aliyun.com/zh/dashscope/)
- [OpenAI SDK](https://github.com/openai/openai-node)

---

## Summary Checklist

- [ ] **环境配置**：.env.local 文件已创建，API Key 已配置
- [ ] **依赖安装**：所有核心依赖和 shadcn/ui 组件已安装
- [ ] **类型定义**：types/ 目录已创建，所有类型已定义
- [ ] **后端 API**：app/api/generate-chart/route.ts 已实现
- [ ] **前端组件**：ChartRenderer、ChatInput、page.tsx 已创建
- [ ] **功能测试**：至少完成 5 个手动测试用例
- [ ] **响应式验证**：在桌面端和移动端测试布局
- [ ] **错误处理**：验证空输入、无效数据、API 错误等场景
- [ ] **代码提交**：遵循 Conventional Commits 规范提交代码

---

**Quick Start Completed**: ✅  
**Ready for Development**: 2026-02-24  
**Next**: 开始 Phase 2 - Task Breakdown (`/speckit.tasks`)
