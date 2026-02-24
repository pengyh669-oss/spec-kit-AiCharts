# AiCharts-SpecKit Constitution
<!-- AI驱动的图表可视化工具项目宪法 -->

## Core Principles

### I. Next.js API Route Architecture (强制)
<!-- 后端架构原则 -->
**所有后端接口必须使用 Next.js 的 API Route 实现**

- **API 路由位置**：所有 API 必须放置在 `app/api/` 目录下
- **Route Handlers 规范**：
  - 使用 `route.ts` 文件定义路由处理器
  - 支持 GET、POST、PUT、DELETE、PATCH 等标准 HTTP 方法
  - 必须返回 `NextResponse` 对象，统一 JSON 格式
- **前后端分离原则**：
  - 前端组件通过 fetch/axios 调用后端 API Route
  - 禁止在客户端组件中直接访问数据库或外部服务
  - Server Components 可直接访问数据，但复杂逻辑需封装为 API
- **统一响应格式**：
  ```typescript
  // 成功：{ data: T, message?: string }
  // 失败：{ error: string, message: string, code?: number }
  ```
- **错误处理规范**：统一捕获异常，返回标准 HTTP 状态码和错误信息

### II. Tailwind CSS + shadcn/ui 组件体系 (强制)
<!-- 前端UI架构原则 -->
**所有前端组件必须使用 Tailwind CSS 和 shadcn/ui 构建**

- **样式系统**：
  - 采用 Tailwind CSS Utility-First 方法论
  - 禁止使用传统 CSS 文件或 CSS Modules（特殊情况需文档说明）
  - 禁止内联样式（动态样式除外）
  - 复杂样式使用 Tailwind 的 `@apply` 或组合 utility 类
- **组件库标准**：
  - 基础 UI 组件优先使用 shadcn/ui
  - 通过 `npx shadcn@latest add <component>` 添加组件
  - shadcn/ui 组件存放在 `components/ui/` 目录
  - 可自定义 shadcn/ui 组件主题和样式（保持一致性）
- **组件分层**：
  - `components/ui/` - shadcn/ui 基础组件
  - `components/charts/` - 图表组件
  - `components/` - 业务组件
  - `app/` - 页面组件
- **响应式设计**：
  - 使用 Tailwind 响应式前缀：`sm:`, `md:`, `lg:`, `xl:`, `2xl:`
  - 遵循移动优先（Mobile-First）设计原则
- **主题管理**：
  - 在 `tailwind.config.ts` 中配置主题颜色、间距等
  - 使用 CSS 变量实现动态主题（支持深色模式）

### III. ECharts 可视化标准 (强制)
<!-- 图表组件原则 -->
**所有数据可视化图表必须使用 Apache ECharts 实现**

- **图表库限制**：
  - 使用 `echarts` 核心库和 `echarts-for-react` React 封装
  - 禁止使用其他图表库（Chart.js、Recharts、Victory 等）
- **组件结构规范**：
  - 所有图表组件必须放置在 `components/charts/` 目录
  - 每种图表类型创建独立可复用组件（如 `LineChart.tsx`, `BarChart.tsx`）
  - 使用 TypeScript 严格类型化 Props 和 ECharts 配置
- **配置管理**：
  - 图表配置对象必须类型化（`EChartsOption`）
  - 复杂或共享配置抽取到 `lib/chart-configs/` 目录
  - 支持主题配置和动态数据更新
- **性能优化**：
  - 使用 ECharts 按需引入（Tree Shaking）减小打包体积
  - 大数据量场景使用数据采样、虚拟滚动或 WebGL 渲染
  - 合理使用 `notMerge`、`lazyUpdate`、`silent` 等选项
- **响应式图表**：
  - 图表容器使用响应式布局（Flexbox/Grid）
  - 监听窗口 resize 事件自动调用 `chart.resize()`
  - 移动端适配触摸交互和简化配置
- **示例结构**：
  ```typescript
  import ReactECharts from 'echarts-for-react';
  import type { EChartsOption } from 'echarts';
  
  export function LineChart({ data, labels }: Props) {
    const option: EChartsOption = { /* ... */ };
    return <ReactECharts option={option} />;
  }
  ```

### IV. TypeScript 类型安全 (强制)
<!-- 类型系统原则 -->
**严格的 TypeScript 类型系统和类型安全保障**

- **编译器配置**：
  - 必须启用 `strict: true` 模式
  - 禁止使用 `any` 类型（特殊情况需明确注释说明原因）
  - 启用 `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes` 等
- **类型定义规范**：
  - 使用 `interface` 定义对象结构和契约
  - 使用 `type` 定义联合类型、交叉类型、工具类型
  - API 请求/响应类型统一定义在 `types/api.ts`
  - 图表相关类型定义在 `types/charts.ts`
  - 业务模型类型定义在 `types/models.ts`
- **类型导入优化**：
  - 使用 `import type` 导入纯类型（避免运行时开销）
- **泛型应用**：
  - API 封装函数使用泛型约束响应类型
  - 可复用组件使用泛型提高灵活性

### V. 文件结构与项目组织
<!-- 项目结构标准 -->
**标准化的目录结构和文件组织规范**

```
aicharts-speckit/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (后端接口层)
│   │   ├── charts/               # 图表相关 API
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── data/                 # 数据处理 API
│   │       └── route.ts
│   ├── (dashboard)/              # 页面路由组
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页
│   └── globals.css               # 全局样式
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 基础组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── charts/                   # ECharts 图表组件
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   └── PieChart.tsx
│   └── ...                       # 业务组件
├── lib/                          # 工具库和配置
│   ├── api.ts                    # API 调用封装
│   ├── utils.ts                  # 工具函数
│   └── chart-configs/            # 图表配置模板
│       └── themes.ts
├── types/                        # TypeScript 类型定义
│   ├── api.ts                    # API 类型
│   ├── charts.ts                 # 图表类型
│   └── models.ts                 # 业务模型
├── public/                       # 静态资源
└── .specify/                     # 项目规范文档
    ├── memory/
    └── templates/
```

## 技术栈约束
<!-- 强制技术选型 -->

### 核心依赖

**必须使用的技术栈**：
- **框架**：Next.js 16+ (App Router 模式)
- **UI 库**：React 19+
- **类型系统**：TypeScript 5+
- **样式方案**：Tailwind CSS 4+
- **组件库**：shadcn/ui (最新版本)
- **图表库**：Apache ECharts 5+ 和 echarts-for-react
- **HTTP 客户端**：fetch API 或 axios

### 依赖管理原则

- **最小化原则**：优先使用核心技术栈已有功能，避免冗余依赖
- **评估标准**：新增依赖需评估维护状态、打包体积、性能影响
- **文档要求**：重要依赖需记录引入原因和使用场景
- **安全审计**：定期运行 `npm audit` 检查安全漏洞

### 代码质量标准

1. **ESLint 规范**：
   - 所有代码必须通过 `npm run lint` 检查
   - 使用 `eslint-config-next` 官方配置
   - 提交前必须修复所有 lint 错误和警告

2. **命名规范**：
   - 组件文件：PascalCase（如 `LineChart.tsx`）
   - 工具函数文件：kebab-case（如 `api-client.ts`）
   - 组件名：PascalCase
   - 函数/变量名：camelCase
   - 常量：UPPER_SNAKE_CASE
   - 类型/接口：PascalCase（Interface 前缀可选）

3. **格式化**：
   - 建议使用 Prettier 保持代码风格一致
   - 统一使用 2 空格缩进
   - 使用分号结尾（TypeScript 推荐）

## 开发工作流
<!-- 开发流程规范 -->

### 功能开发流程

1. **需求分析**：明确功能需求、数据流和 API 接口设计
2. **类型定义**：在 `types/` 目录中定义相关 TypeScript 类型
3. **API 开发**：在 `app/api/` 中实现 Route Handler
4. **组件开发**：使用 shadcn/ui 和 Tailwind CSS 构建 UI
5. **图表集成**：使用 ECharts 实现数据可视化
6. **本地测试**：验证功能完整性和响应式设计
7. **代码审查**：确保符合本宪法所有规范

### API 设计规范

1. **RESTful 原则**：
   - 使用语义化的 URL 路径（名词复数形式）
   - 正确使用 HTTP 方法（GET 查询、POST 创建、PUT 更新、DELETE 删除）
   - 返回合适的 HTTP 状态码（200, 201, 400, 404, 500 等）

2. **统一响应格式**：
   ```typescript
   // 成功响应
   { data: T, message?: string }
   
   // 错误响应
   { error: string, message: string, code?: number }
   ```

3. **请求验证**：
   - 使用 Zod 或 yup 验证请求参数
   - 返回清晰的验证错误信息
   - 防止 SQL 注入、XSS 等安全漏洞

### Git 提交规范

- 使用 Conventional Commits 规范
- 格式：`<type>(<scope>): <subject>`
- 类型：`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`
- 示例：
  - `feat(charts): add interactive line chart component`
  - `fix(api): correct data validation in POST /api/charts`
  - `docs(constitution): update API design guidelines`

### 分支策略

- `main` - 生产环境分支（受保护）
- `dev` - 开发集成分支
- `feature/*` - 功能开发分支
- `fix/*` - Bug 修复分支
- `hotfix/*` - 紧急修复分支

### 性能优化要求

1. **组件优化**：
   - 合理区分 Server Components 和 Client Components
   - 仅交互组件标记 `'use client'`
   - 使用 `React.memo`、`useMemo`、`useCallback` 优化重渲染

2. **代码分割**：
   - 使用 `next/dynamic` 动态导入延迟加载
   - 图表组件按需加载减少首屏时间

3. **资源优化**：
   - 使用 `next/image` 优化图片加载
   - 按需引入 ECharts 模块（Tree Shaking）

## Governance
<!-- 治理规则 -->

### 宪法权威性

- 本宪法优先级高于所有其他开发实践和个人偏好
- 所有代码提交和 Pull Request 必须验证是否符合宪法规范
- 违反宪法的代码不得合并到主分支

### 修正案流程

1. **提议阶段**：提出修改建议并说明充分理由
2. **讨论阶段**：团队讨论修改的必要性和影响范围
3. **批准阶段**：达成共识后更新宪法文档
4. **执行阶段**：更新版本号、修订日期，通知全体成员
5. **迁移阶段**：如需代码调整，制定迁移计划

### 例外处理

- 特殊情况偏离宪法需在代码中明确注释说明原因
- 技术债务需记录在项目看板并计划修复时间
- 例外必须经过团队 Code Review 批准

### 合规性检查

- Code Review 必须检查是否符合宪法规范
- 使用 ESLint、TypeScript 编译器等工具自动化检查
- 定期审计代码库，识别并修复不合规代码

## 快速参考
<!-- 常用命令和示例 -->

### 添加 shadcn/ui 组件
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add table
```

### 创建 API Route 示例
```typescript
// app/api/charts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const data = [/* 图表数据 */];
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
```

### 创建 ECharts 组件示例
```typescript
// components/charts/LineChart.tsx
'use client';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface LineChartProps {
  data: number[];
  labels: string[];
}

export function LineChart({ data, labels }: LineChartProps) {
  const option: EChartsOption = {
    xAxis: { type: 'category', data: labels },
    yAxis: { type: 'value' },
    series: [{ data, type: 'line', smooth: true }]
  };
  
  return <ReactECharts option={option} style={{ height: '400px' }} />;
}
```

### 前端调用 API 示例
```typescript
// lib/api.ts
export async function getCharts() {
  const response = await fetch('/api/charts');
  if (!response.ok) throw new Error('Failed to fetch charts');
  const { data } = await response.json();
  return data;
}
```

---

**Version**: 1.0.0 | **Ratified**: 2026-02-24 | **Last Amended**: 2026-02-24
<!-- 本宪法自批准之日起生效，约束所有项目开发活动 -->
