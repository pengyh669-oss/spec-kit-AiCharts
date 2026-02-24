# Research: AI Chart Generator Homepage

**Feature**: 001-ai-chart-homepage  
**Date**: 2026-02-24  
**Phase**: Phase 0 - Technical Research

## Research Overview

本文档记录了 AI 图表生成器首页功能的技术选型研究和决策过程，解决 Technical Context 中标记的 NEEDS CLARIFICATION 项，并为关键技术栈提供最佳实践指导。

---

## 1. 测试框架选择

### 决策：Vitest + React Testing Library + Playwright

**研究背景**：  
Technical Context 中测试框架标记为 NEEDS CLARIFICATION，需要为 Next.js 16+ TypeScript 项目选择合适的测试方案。

**候选方案**：
1. **Jest + React Testing Library**
   - 优点：生态成熟，Next.js 官方支持，社区资源丰富
   - 缺点：配置复杂（需要 Babel/SWC），启动速度慢，ESM 支持不完善
   
2. **Vitest + React Testing Library**
   - 优点：原生 ESM 支持，启动速度快（10x），与 Vite 生态一致，配置简单
   - 缺点：相对新（但已成熟），Next.js 官方文档主要示例用 Jest
   
3. **Playwright Component Testing**
   - 优点：真实浏览器环境，跨浏览器测试
   - 缺点：性能开销大，适合 E2E 而非单元测试

**决策理由**：
- **单元测试和组件测试**：选择 **Vitest + React Testing Library**
  - Next.js 16+ 已支持 Vitest（通过 `next.config.ts` 配置）
  - Vitest 启动速度快，适合 TDD 工作流
  - 与 TypeScript 和 ESM 完美集成
  - React Testing Library 是行业标准，专注用户行为测试
  
- **E2E 测试**：选择 **Playwright**
  - 用于测试完整的用户流程（输入 → AI 调用 → 图表渲染）
  - 支持多浏览器测试（Chrome, Firefox, Safari）
  - 可以录制测试脚本，提高效率

**替代方案被拒绝原因**：
- Jest：虽然成熟，但在 Next.js 16+ 中配置复杂，启动速度慢，不如 Vitest 现代化
- 纯 Playwright：单元测试和组件测试用 Playwright 性能开销过大，不适合快速反馈循环

**实施计划**：
```bash
# 安装依赖
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test

# 配置文件
# vitest.config.ts - 单元测试配置
# playwright.config.ts - E2E 测试配置
```

---

## 2. OpenAI SDK 通过 DashScope 的最佳实践

### 决策：封装 OpenAI SDK + 结构化输出 + 错误重试机制

**研究背景**：  
用户要求使用 OpenAI SDK 调用阿里云 DashScope API (`qwen3-max-preview` 模型)，需要确保返回的是标准 ECharts 配置 JSON。

**最佳实践**：

1. **API 客户端封装** (`lib/openai-client.ts`)：
   ```typescript
   import OpenAI from "openai";
   
   export const openaiClient = new OpenAI({
     apiKey: process.env.DASHSCOPE_API_KEY!,
     baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
   });
   
   // 配置验证
   if (!process.env.DASHSCOPE_API_KEY) {
     throw new Error("Missing DASHSCOPE_API_KEY environment variable");
   }
   ```

2. **结构化输出策略**：
   - 设置 `response_format: { type: "json_object" }`
   - 在 System Message 中明确要求输出 JSON 格式
   - 在 User Message 中重申格式要求
   
3. **系统提示词设计** (`lib/prompt-builder.ts`)：
   ```typescript
   export function buildSystemPrompt(): string {
     return `你是一个专业的数据可视化助手，负责将用户的自然语言描述转换为 ECharts 配置 JSON。
   
   **输出要求**：
   - 必须返回严格符合 ECharts option 规范的 JSON 对象
   - JSON 必须包含以下结构：
     {
       "chartType": "line" | "bar" | "pie",
       "option": { /* 完整的 ECharts option 对象 */ }
     }
   - option 对象必须包含：title, tooltip, legend（如适用）, xAxis（如适用）, yAxis（如适用）, series
   - series 中的 data 必须是提取自用户输入的实际数据
   - 颜色主题使用现代化配色（如 #5470C6, #91CC75, #FAC858）
   - 确保 JSON 格式正确，可直接被 JSON.parse 解析
   
   **图表类型选择规则**：
   - 时间序列数据 → line（折线图）
   - 分类对比数据 → bar（柱状图）
   - 占比/百分比数据 → pie（饼图）
   - 用户明确指定图表类型时优先使用用户指定
   
   请按照 JSON 格式输出，不要包含任何其他解释文字。`;
   }
   ```

4. **API 调用封装** (`app/api/generate-chart/route.ts`)：
   ```typescript
   export async function POST(request: NextRequest) {
     try {
       const { userInput } = await request.json();
       
       const completion = await openaiClient.chat.completions.create({
         model: "qwen3-max-preview",
         messages: [
           { role: "system", content: buildSystemPrompt() },
           { role: "user", content: `请将以下描述转换为 ECharts 配置 JSON：\n\n${userInput}` }
         ],
         response_format: { type: "json_object" },
         temperature: 0.3, // 降低随机性，确保输出一致性
       });
       
       const content = completion.choices[0].message.content;
       const chartConfig = JSON.parse(content!);
       
       // 验证 chartConfig 结构
       if (!chartConfig.chartType || !chartConfig.option) {
         throw new Error("Invalid chart configuration structure");
       }
       
       return NextResponse.json({ data: chartConfig });
     } catch (error) {
       return NextResponse.json(
         { error: "Chart generation failed", message: error.message },
         { status: 500 }
       );
     }
   }
   ```

5. **错误处理和重试**：
   - API 超时设置（30s）
   - 重试机制（最多 2 次）
   - 降级策略：如果 AI 解析失败，返回友好错误提示

**替代方案被拒绝原因**：
- 使用纯文本输出 + 手动解析：不可靠，容易出现格式错误
- 使用 Function Calling：DashScope API 可能不完全支持，结构化输出更稳定

---

## 3. ECharts 与 React 的集成最佳实践

### 决策：echarts-for-react + 按需引入 + 响应式处理

**研究背景**：  
需要在 React 19 + Next.js 16 中集成 ECharts 5+，确保性能、类型安全和响应式支持。

**最佳实践**：

1. **库选择**：
   - 使用 `echarts-for-react` 作为 React 封装层
   - 使用 `echarts` 核心库（而非 `echarts-for-react` 内置的旧版本）
   
2. **按需引入优化** (`components/charts/ChartRenderer.tsx`)：
   ```typescript
   'use client';
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
   ```

3. **响应式处理**：
   ```typescript
   export function ChartRenderer({ option }: { option: EChartsOption }) {
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

4. **类型安全**：
   - 使用 `EChartsOption` 类型约束所有图表配置
   - 自定义类型定义 (`types/charts.ts`)：
     ```typescript
     import type { EChartsOption } from 'echarts';
     
     export type ChartType = 'line' | 'bar' | 'pie';
     
     export interface ChartConfig {
       chartType: ChartType;
       option: EChartsOption;
     }
     
     export interface ChartData {
       labels: string[];
       series: Array<{
         name: string;
         data: number[];
       }>;
     }
     ```

5. **性能优化**：
   - 使用 `notMerge: true` 避免配置合并开销
   - 大数据量（>1000 点）启用数据采样
   - 使用 `next/dynamic` 延迟加载图表组件

**替代方案被拒绝原因**：
- 直接使用 echarts DOM API：React 中需要手动管理 DOM 生命周期，复杂且易错
- 使用其他图表库（Recharts, Chart.js）：违反 constitution

---

## 4. Next.js API Route 性能优化

### 决策：边缘运行时 + 流式响应 + 缓存策略

**研究背景**：  
API Route 需要调用 LLM（延迟 2-3s），需要优化响应速度和用户体验。

**最佳实践**：

1. **运行时选择**：
   ```typescript
   // app/api/generate-chart/route.ts
   export const runtime = 'nodejs'; // OpenAI SDK 需要 Node.js 运行时
   export const dynamic = 'force-dynamic'; // 禁用静态优化
   ```

2. **流式响应**（可选，适用于长文本生成）：
   ```typescript
   // 如果 LLM 支持 streaming，可以逐步返回数据
   const stream = await openaiClient.chat.completions.create({
     model: "qwen3-max-preview",
     messages: [...],
     stream: true, // 启用流式输出
   });
   
   return new Response(
     new ReadableStream({
       async start(controller) {
         for await (const chunk of stream) {
           controller.enqueue(JSON.stringify(chunk));
         }
         controller.close();
       },
     }),
     { headers: { 'Content-Type': 'application/json' } }
   );
   ```

3. **缓存策略**（可选）：
   - 对于相同的用户输入，缓存 AI 响应（使用 Redis 或 Vercel KV）
   - 设置合理的 TTL（如 1 小时）
   - 初期 MVP 可跳过缓存

4. **请求验证和限流**：
   ```typescript
   // 验证输入长度
   if (userInput.length > 2000) {
     return NextResponse.json(
       { error: 'Input too long', message: '输入文本不能超过 2000 字符' },
       { status: 400 }
     );
   }
   
   // TODO: 添加 rate limiting（如 next-rate-limit）
   ```

5. **错误处理**：
   - 捕获 OpenAI SDK 错误（超时、API 错误、配额不足）
   - 返回用户友好的错误信息
   - 记录错误日志（使用 console.error 或 Sentry）

**替代方案被拒绝原因**：
- Edge Runtime：OpenAI SDK 依赖 Node.js API，无法在 Edge 运行时使用

---

## 5. 系统提示词工程（Prompt Engineering）

### 决策：结构化提示词 + Few-Shot Examples + 输出格式约束

**研究背景**：  
需要确保 LLM 返回的是标准 ECharts 配置 JSON，而非自然语言描述或错误格式。

**最佳实践**：

1. **提示词结构**：
   ```typescript
   export function buildSystemPrompt(): string {
     return `你是一个专业的数据可视化助手，负责将用户的自然语言描述转换为 ECharts 配置 JSON。
   
   **角色定义**：
   - 数据提取专家：准确识别用户输入中的数值、标签、时间等数据
   - 图表类型推荐专家：根据数据特征自动选择最合适的图表类型
   - ECharts 配置专家：生成符合 ECharts 5.x 规范的配置对象
   
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
   - 自动处理数据单位（万、千、%等）
   
   **图表类型选择规则**：
   - 时间序列数据（按月、按年等） → line（折线图）
   - 分类对比数据（城市对比、产品对比） → bar（柱状图）
   - 占比数据（市场份额、百分比） → pie（饼图）
   - 用户明确指定图表类型（"用柱状图显示"）→ 优先使用指定类型
   
   **示例输出**：
   输入："2024年销售额：1月100万，2月120万，3月150万"
   输出：
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

2. **Few-Shot Examples**（可选）：
   - 在 System Message 中包含 2-3 个示例
   - 涵盖不同图表类型和数据格式

3. **用户输入增强**：
   ```typescript
   export function buildUserPrompt(userInput: string): string {
     return `请将以下用户描述转换为 ECharts 配置 JSON：
   
   用户输入：
   ${userInput}
   
   请按照 JSON 格式输出，确保返回的对象包含 chartType 和 option 字段。`;
   }
   ```

4. **输出验证**：
   ```typescript
   // 验证 AI 返回的 JSON 结构
   function validateChartConfig(config: any): config is ChartConfig {
     return (
       config &&
       typeof config === 'object' &&
       ['line', 'bar', 'pie'].includes(config.chartType) &&
       config.option &&
       typeof config.option === 'object' &&
       Array.isArray(config.option.series)
     );
   }
   ```

**替代方案被拒绝原因**：
- 简单提示词：容易导致 LLM 返回不一致的格式或包含多余内容
- 分步调用（先提取数据，再生成配置）：增加 API 调用次数和延迟

---

## 6. shadcn/ui 组件定制化

### 决策：使用 shadcn/ui CLI 安装 + CSS Variables 主题定制

**研究背景**：  
需要快速构建现代化 UI，同时保持品牌一致性和可定制性。

**最佳实践**：

1. **组件安装**：
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add input
   npx shadcn@latest add button
   npx shadcn@latest add card
   npx shadcn@latest add alert
   ```

2. **主题定制** (`app/globals.css`)：
   ```css
   @layer base {
     :root {
       --background: 0 0% 100%;
       --foreground: 222.2 84% 4.9%;
       --primary: 221.2 83.2% 53.3%; /* 自定义主色调 */
       --primary-foreground: 210 40% 98%;
       --secondary: 210 40% 96.1%;
       --accent: 210 40% 96.1%;
       --muted: 210 40% 96.1%;
       --border: 214.3 31.8% 91.4%;
       --radius: 0.5rem; /* 圆角大小 */
     }
   }
   ```

3. **响应式组件**：
   - 输入框组件：支持移动端触摸优化
   - 按钮组件：支持加载状态和禁用状态
   - 卡片组件：响应式布局适配

4. **组件组合** (`components/ChatInput.tsx`)：
   ```typescript
   'use client';
   import { Input } from '@/components/ui/input';
   import { Button } from '@/components/ui/button';
   import { useState } from 'react';
   
   export function ChatInput({ onSubmit }: { onSubmit: (input: string) => void }) {
     const [input, setInput] = useState('');
     const [loading, setLoading] = useState(false);
     
     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       if (!input.trim()) return;
       
       setLoading(true);
       await onSubmit(input);
       setLoading(false);
     };
     
     return (
       <form onSubmit={handleSubmit} className="flex gap-2">
         <Input
           value={input}
           onChange={(e) => setInput(e.target.value)}
           placeholder="输入包含数据的描述，例如：2024年1-6月销售额..."
           className="flex-1"
           disabled={loading}
         />
         <Button type="submit" disabled={!input.trim() || loading}>
           {loading ? '生成中...' : '发送'}
         </Button>
       </form>
     );
   }
   ```

**替代方案被拒绝原因**：
- 从零开始写组件：重复造轮子，耗时且可能遗漏可访问性特性
- 使用其他组件库（Ant Design, MUI）：违反 constitution

---

## 7. 响应式布局转换动画实现

### 决策：Framer Motion + Tailwind CSS Transitions

**研究背景**：  
用户输入后，需要实现布局转换：输入框从中央移动到底部，图表显示区域出现在上方。

**最佳实践**：

1. **轻量方案（Tailwind CSS Transitions）**：
   ```typescript
   'use client';
   import { useState } from 'react';
   
   export default function HomePage() {
     const [hasChart, setHasChart] = useState(false);
     
     return (
       <div className="min-h-screen flex flex-col">
         {/* 图表区域 */}
         <div className={`
           transition-all duration-500 ease-in-out
           ${hasChart ? 'flex-1 opacity-100' : 'h-0 opacity-0 overflow-hidden'}
         `}>
           {/* ChartDisplay component */}
         </div>
         
         {/* 输入框区域 */}
         <div className={`
           transition-all duration-500 ease-in-out p-4
           ${hasChart ? '' : 'flex-1 flex items-center justify-center'}
         `}>
           {/* ChatInput component */}
         </div>
       </div>
     );
   }
   ```

2. **高级方案（Framer Motion）**（可选，适用于复杂动画）：
   ```bash
   npm install framer-motion
   ```
   
   ```typescript
   import { motion, AnimatePresence } from 'framer-motion';
   
   export default function HomePage() {
     const [hasChart, setHasChart] = useState(false);
     
     return (
       <div className="min-h-screen flex flex-col">
         <AnimatePresence>
           {hasChart && (
             <motion.div
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               transition={{ duration: 0.5, ease: 'easeInOut' }}
             >
               {/* ChartDisplay */}
             </motion.div>
           )}
         </AnimatePresence>
         
         <motion.div
           layout
           transition={{ duration: 0.5, ease: 'easeInOut' }}
           className={hasChart ? '' : 'flex-1 flex items-center justify-center'}
         >
           {/* ChatInput */}
         </motion.div>
       </div>
     );
   }
   ```

3. **性能优化**：
   - 使用 `will-change` CSS 属性提示浏览器优化
   - 避免布局抖动（layout shift）
   - 使用 `transform` 而非 `top/left` 提高性能

**决策理由**：
- **初期 MVP**：使用 Tailwind CSS Transitions（轻量，无额外依赖）
- **后续优化**：如果需要更复杂的动画序列，引入 Framer Motion

**替代方案被拒绝原因**：
- CSS 动画 (@keyframes)：代码冗长，不如 Tailwind utilities 简洁
- jQuery 动画：不符合现代 React 开发实践

---

## 8. 错误处理和用户反馈策略

### 决策：分层错误处理 + Toast 通知 + 友好错误页面

**研究背景**：  
需要处理多种错误场景：空输入、AI 解析失败、API 超时、网络错误等。

**最佳实践**：

1. **错误分类**：
   - **客户端验证错误**：空输入、输入过长 → 即时反馈（禁用按钮/Alert 提示）
   - **API 错误**：LLM 调用失败、超时 → Toast 通知 + 重试选项
   - **解析错误**：AI 返回无效 JSON → 友好提示 + 示例引导
   - **网络错误**：断网、服务不可用 → 错误页面 + 重试按钮

2. **Toast 通知**（使用 shadcn/ui toast）：
   ```bash
   npx shadcn@latest add toast
   ```
   
   ```typescript
   import { useToast } from '@/hooks/use-toast';
   
   export function ChartGenerator() {
     const { toast } = useToast();
     
     const handleGenerate = async (input: string) => {
       try {
         const response = await fetch('/api/generate-chart', {
           method: 'POST',
           body: JSON.stringify({ userInput: input }),
         });
         
         if (!response.ok) {
           const { message } = await response.json();
           throw new Error(message);
         }
         
         const { data } = await response.json();
         setChartConfig(data);
       } catch (error) {
         toast({
           title: '生成失败',
           description: error.message || '无法生成图表，请重试',
           variant: 'destructive',
         });
       }
     };
   }
   ```

3. **友好错误提示**：
   ```typescript
   // 针对常见错误提供解决方案
   const ERROR_MESSAGES = {
     'Invalid chart configuration': '无法识别数据格式，请尝试更清晰的描述，例如："2024年1-3月销售额：1月100万，2月120万，3月150万"',
     'timeout': '请求超时，请检查网络连接后重试',
     'rate_limit': '请求过于频繁，请稍后再试',
   };
   ```

4. **加载状态反馈**：
   ```typescript
   // 加载动画（使用 shadcn/ui skeleton）
   npx shadcn@latest add skeleton
   
   {loading && <Skeleton className="h-96 w-full" />}
   ```

5. **错误边界**（React Error Boundary）：
   ```typescript
   // components/ErrorBoundary.tsx
   'use client';
   import { Component, ReactNode } from 'react';
   
   export class ErrorBoundary extends Component<
     { children: ReactNode },
     { hasError: boolean }
   > {
     state = { hasError: false };
     
     static getDerivedStateFromError() {
       return { hasError: true };
     }
     
     render() {
       if (this.state.hasError) {
         return (
           <div className="flex flex-col items-center justify-center min-h-screen">
             <h2 className="text-2xl font-bold mb-4">出错了</h2>
             <button onClick={() => window.location.reload()}>
               重新加载
             </button>
           </div>
         );
       }
       
       return this.props.children;
     }
   }
   ```

**替代方案被拒绝原因**：
- 全局错误处理（window.onerror）：粒度太粗，无法提供针对性反馈
- 静默失败：用户体验差，无法定位问题

---

## Research Summary

### 已解决的不确定性

1. ✅ **测试框架**：Vitest + React Testing Library（单元测试） + Playwright（E2E测试）
2. ✅ **OpenAI SDK 集成**：封装客户端 + 结构化输出 + 系统提示词工程
3. ✅ **ECharts 集成**：echarts-for-react + 按需引入 + 响应式处理
4. ✅ **API 性能优化**：Node.js 运行时 + 请求验证 + 错误处理
5. ✅ **提示词工程**：结构化提示词 + 输出格式约束 + 数据提取规则
6. ✅ **shadcn/ui 定制**：CLI 安装 + CSS Variables 主题定制
7. ✅ **布局动画**：Tailwind CSS Transitions（初期）/ Framer Motion（可选）
8. ✅ **错误处理**：分层错误处理 + Toast 通知 + 友好提示

### 技术栈最终确认

| 分类     | 技术                           | 版本 |
| -------- | ------------------------------ | ---- |
| 框架     | Next.js                        | 16+  |
| UI 库    | React                          | 19+  |
| 语言     | TypeScript                     | 5+   |
| 样式     | Tailwind CSS                   | 4+   |
| 组件库   | shadcn/ui                      | 最新 |
| 图表     | ECharts + echarts-for-react    | 5+   |
| LLM      | OpenAI SDK (DashScope)         | 最新 |
| 测试     | Vitest + React Testing Library | 最新 |
| E2E 测试 | Playwright                     | 最新 |

### 下一步：Phase 1

进入 Phase 1 设计阶段，生成以下文档：
- **data-model.md**：实体模型和数据流
- **contracts/api-schema.md**：API 接口契约
- **quickstart.md**：快速开始指南

---

**Research Completed**: 2026-02-24  
**Status**: ✅ Ready for Phase 1 Design
