# Implementation Plan: AI Chart Generator Homepage

**Branch**: `001-ai-chart-homepage` | **Date**: 2026-02-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-ai-chart-homepage/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

构建 AI 驱动的图表生成首页，允许用户通过自然语言输入数据描述，系统自动调用 LLM 提取数据并智能选择图表类型，使用 ECharts 渲染可视化图表。技术栈：Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + ECharts + OpenAI SDK (通过阿里云 DashScope API)。

## Technical Context

**Language/Version**: TypeScript 5+  
**Primary Dependencies**: Next.js 16+ (App Router), React 19+, Tailwind CSS 4+, shadcn/ui, ECharts 5+ (echarts-for-react), OpenAI SDK (通过阿里云 DashScope)  
**Storage**: Browser localStorage (存储用户输入历史记录，可选)  
**Testing**: NEEDS CLARIFICATION (需要确认测试框架：Jest/Vitest + React Testing Library)  
**Target Platform**: Web (现代浏览器，Chrome/Firefox/Safari/Edge 最新两个版本，响应式设计支持桌面和移动端)  
**Project Type**: web-service (Next.js 全栈 Web 应用)  
**Performance Goals**: 
- 用户点击"发送"到图表完整渲染 <5s (含 API 调用)
- 图表渲染时间 <2s (1000 数据点以内)
- API Route 响应时间 <3s (LLM 调用)
- 首页加载 (FCP) <1.5s

**Constraints**: 
- 所有 API 调用通过 Next.js API Route 实现（符合 constitution）
- 所有 UI 组件使用 Tailwind CSS + shadcn/ui（符合 constitution）
- 图表库仅使用 ECharts（符合 constitution）
- TypeScript strict 模式，禁止 any 类型
- 响应式设计：支持移动端 (375px+) 和桌面端 (1920px)
- 可访问性：颜色对比度达到 WCAG AA 级别
- AI 返回格式：必须是可直接使用的 ECharts 配置 JSON

**Scale/Scope**: 
- MVP 单页应用（首页）
- 支持 3 种基础图表类型（折线图、柱状图、饼图）
- 初期不考虑用户认证和数据持久化
- 预期并发用户 <100 (初期)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 强制规则合规性检查

✅ **I. Next.js API Route Architecture**
- 所有后端接口通过 `app/api/` 下的 Route Handlers 实现
- AI 调用封装在 `/api/generate-chart` API Route 中
- 前端通过 fetch 调用后端 API，遵循前后端分离原则
- 统一响应格式：`{ data: T }` 或 `{ error: string, message: string }`

✅ **II. Tailwind CSS + shadcn/ui 组件体系**
- 所有 UI 组件使用 Tailwind CSS utility classes
- 基础组件（Input、Button、Card 等）使用 shadcn/ui
- 响应式设计使用 Tailwind 响应式前缀 (sm:, md:, lg:)
- 组件结构：`components/ui/` (shadcn/ui), `components/charts/` (图表), `components/` (业务组件)

✅ **III. ECharts 可视化标准**
- 使用 `echarts` + `echarts-for-react` 实现所有图表
- 图表组件放置在 `components/charts/` 目录
- 每种图表类型（LineChart, BarChart, PieChart）独立组件
- TypeScript 严格类型化 ECharts 配置（`EChartsOption`）
- 响应式图表：监听 resize 事件自动调整

✅ **IV. TypeScript 类型安全**
- `strict: true` 模式启用
- 禁止使用 `any` 类型
- 类型定义：`types/api.ts` (API), `types/charts.ts` (图表), `types/models.ts` (业务模型)
- API 调用使用泛型约束响应类型

✅ **V. 文件结构与项目组织**
- 遵循 constitution 定义的标准目录结构
- `app/api/` - API Routes
- `components/ui/` - shadcn/ui 组件
- `components/charts/` - ECharts 图表组件
- `lib/` - 工具库和配置
- `types/` - TypeScript 类型定义

### 门禁结论

**状态**: ✅ **通过**  
**违规项**: 0  
**说明**: 本功能完全符合项目宪法的所有强制规则，无需额外调整。技术栈选择（Next.js + Tailwind + shadcn/ui + ECharts + OpenAI SDK）与 constitution 完美契合。

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-chart-homepage/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-schema.md    # API 接口契约定义
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
aicharts-speckit/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (后端接口层)
│   │   └── generate-chart/       # AI 图表生成 API
│   │       └── route.ts          # POST /api/generate-chart
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页（主要功能页面）
│   └── globals.css               # 全局样式（Tailwind 基础配置）
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 基础组件
│   │   ├── input.tsx             # 输入框组件
│   │   ├── button.tsx            # 按钮组件
│   │   ├── card.tsx              # 卡片组件
│   │   └── alert.tsx             # 错误提示组件
│   ├── charts/                   # ECharts 图表组件
│   │   ├── ChartRenderer.tsx     # 通用图表渲染器（根据类型动态渲染）
│   │   ├── LineChart.tsx         # 折线图组件
│   │   ├── BarChart.tsx          # 柱状图组件
│   │   └── PieChart.tsx          # 饼图组件
│   ├── ChatInput.tsx             # 底部输入框组件（包含发送按钮）
│   └── ChartDisplay.tsx          # 图表显示区域组件
├── lib/                          # 工具库和配置
│   ├── api-client.ts             # API 调用封装函数
│   ├── openai-client.ts          # OpenAI SDK 封装
│   ├── prompt-builder.ts         # 系统提示词构建工具
│   ├── chart-configs/            # 图表配置模板
│   │   ├── themes.ts             # ECharts 主题配置
│   │   └── defaults.ts           # 默认图表配置
│   └── utils.ts                  # 通用工具函数
├── types/                        # TypeScript 类型定义
│   ├── api.ts                    # API 请求/响应类型
│   ├── charts.ts                 # 图表相关类型（ChartType, ChartData, EChartsOption）
│   └── models.ts                 # 业务模型类型（UserInput, StructuredData）
├── public/                       # 静态资源
├── .env.local                    # 环境变量（DASHSCOPE_API_KEY）
└── .specify/                     # 项目规范文档
    ├── memory/
    │   └── constitution.md
    └── templates/
```

**Structure Decision**: 
采用 Next.js App Router 标准结构，前后端代码在同一项目中，通过 `app/api/` 目录实现 API Routes。前端组件按功能分层（ui 基础组件、charts 图表组件、业务组件），符合 constitution 定义的文件结构标准。由于项目是 Web 应用，前后端集成在 Next.js 中，无需分离 backend/ 和 frontend/ 目录。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**无违规项** - 本功能完全符合项目宪法，无需复杂度追踪或例外说明。
