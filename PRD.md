# AI 图表生成器 (AI Chart Generator) - 产品需求文档 (PRD)

**文档版本**: v1.0.0
**最后更新日期**: 2026年2月25日
**项目名称**: aicharts-speckit
**所属模块**: AI Chart Homepage (001-ai-chart-homepage)

---

## 1. 项目概述与业务目标

### 1.1 核心产品价值主张 (Value Proposition)
“AI 图表生成器”旨在通过自然语言对话，将非结构化或半结构化的文本数据自动转化为专业、美观且可交互的 ECharts 图表。它极大地降低了数据可视化的门槛，用户无需掌握复杂的电子表格软件（如 Excel）或编程技能，只需“说出”他们的数据和需求，系统即可智能提取数据、匹配最佳图表类型并完成渲染。

### 1.2 目标用户画像 (User Personas) & 核心使用场景 (Use Cases)
*   **业务人员/运营专员 (Business Users)**：需要快速将周报、月报中的零散数据转化为图表用于 PPT 汇报。
    *   *场景*：“帮我把这段销售数据画个柱状图，对比一下北京和上海第一季度的业绩。”
*   **学生/研究人员 (Students/Researchers)**：需要对收集到的实验数据或问卷结果进行初步的可视化探索。
    *   *场景*：“这是 100 个样本的年龄分布数据，看看哪种图表最合适展示。”
*   **数据分析师 (Data Analysts)**：作为提效工具，快速生成基础图表代码或预览，后续再进行深度定制。
    *   *场景*：“生成一个折线图，X轴是日期，Y轴是转化率，数据如下...”

### 1.3 成功指标 (Success Metrics)
*   **核心转化率**：用户输入数据到成功渲染图表的完成率 (Task Completion Rate) > 90%。
*   **性能指标**：端到端生成时间（从点击发送到图表完全渲染）平均 < 5 秒。
*   **用户留存与活跃**：次日留存率 > 30%，平均单次会话生成图表数 > 2.5 个。
*   **错误率**：AI 解析失败或 API 超时导致的硬错误率 < 5%。

---

## 2. 核心功能需求 (Functional Requirements)

### 2.1 自然语言输入模块
本模块是用户与系统交互的唯一入口，需提供极简且高效的输入体验。

*   **UI 状态规范**：
    *   **初始/默认状态 (Default)**：输入框居中显示，带有明显的 Placeholder（如：“请输入您的数据或描述您想要的图表...”），边框为浅灰色。
    *   **聚焦状态 (Focus)**：边框高亮（使用品牌主色调，如 Tailwind 的 `ring-primary`），并带有轻微的阴影效果 (`shadow-md`)。
    *   **输入中状态 (Typing)**：右侧的“发送”按钮从置灰变为可点击的高亮状态。支持 `Enter` 键发送（若需换行则使用 `Shift + Enter`）。
    *   **加载/禁用状态 (Disabled/Loading)**：输入框变为只读 (`readonly`)，背景色微暗，发送按钮变为 Loading Spinner 动画，防止重复提交。
*   **输入限制与格式支持**：
    *   **字符限制**：最大支持 2000 个字符。超过限制时，输入框下方需出现红色警告提示：“输入内容过长，请精简至 2000 字符以内”。
    *   **格式兼容**：必须能够兼容并解析以下格式的文本：
        *   纯自然语言描述（如：“一月卖了10个，二月卖了20个”）。
        *   CSV/TSV 格式的粘贴文本（如从 Excel 复制的制表符分隔数据）。
        *   JSON 格式的字符串。
*   **快捷指令 (Quick Prompts)**：
    *   在初始状态的输入框下方，提供 3-4 个预设的“示例 Prompt”胶囊按钮（如：“📊 对比各部门 Q1 预算”、“📈 展示过去一周的用户增长趋势”）。点击后直接填充到输入框并自动触发生成。

### 2.2 AI 解析与图表推荐引擎
这是系统的“大脑”，负责将非结构化文本转化为 ECharts 可识别的配置。

*   **意图识别 (Intent Recognition)**：
    *   **显式指令**：如果用户明确指定了图表类型（如“画个饼图”），AI 必须严格遵循该指令，即使数据特征不完全匹配。
    *   **隐式推荐**：如果用户仅提供数据，AI 需根据数据特征自动推荐最佳图表类型。
*   **数据提取与清洗规则 (Data Extraction & Cleansing)**：
    *   **缺失值处理**：若提取的数据序列中存在缺失值，AI 应默认将其补齐为 `0` 或 `null`（取决于图表类型，折线图推荐 `null` 以断开连线，柱状图推荐 `0`）。
    *   **异常值/非结构化文本**：自动过滤掉文本中的语气词、无关描述，精准提取 X 轴（类目/时间）和 Y 轴（数值）数据。
*   **图表类型匹配矩阵 (Chart Matching Matrix)**：
    *   **折线图 (Line Chart)**：当 X 轴被识别为连续的时间序列（如日期、月份、年份），且重点在于展示“趋势”时。
    *   **柱状图 (Bar Chart)**：当 X 轴为离散的分类数据（如城市、部门、产品名），且重点在于“对比”不同类别的大小或排名时。
    *   **饼图 (Pie Chart)**：当数据为单一维度，且数值代表整体的各个组成部分（通常总和有意义，或明确带有百分比），重点在于展示“占比”时。

### 2.3 动态 UI 布局与交互流
为了提供类似 ChatGPT 的沉浸式体验，页面布局需具备动态转换能力。

*   **初始“搜索态” (Search Layout)**：
    *   页面首次加载时，输入框垂直和水平居中，占据屏幕视觉中心。上方可展示产品 Logo 或大标题。
*   **过渡动画 (Transition Animation)**：
    *   当用户首次点击“发送”并成功获取到图表数据后，触发布局切换。
    *   输入框需平滑移动至页面底部（固定在 Bottom），原居中区域向上展开，腾出空间用于渲染图表。
    *   动画要求：使用 CSS Transform 和 Opacity，时长控制在 `300ms`，缓动函数使用 `ease-in-out`，确保无卡顿感。
*   **“对话态”与历史记录 (Chat Layout & History)**：
    *   进入对话态后，上方主区域展示生成的图表。
    *   **当前版本约束**：每次提交新的 Prompt，将**覆盖**当前图表（单轮生成模式），暂不维护多轮对话的上下文历史列表。但底部的输入框保留用户上一次的输入内容，方便用户微调（如将“柱状图”改为“折线图”后再次发送）。

### 2.4 图表渲染与高级交互
基于 ECharts 5+ 实现高质量的数据可视化。

*   **ECharts 核心配置规范 (Configuration Standards)**：
    *   **主题色板**：使用预设的现代化色板（如 Tailwind 的色系），避免使用 ECharts 默认的高饱和度原色。确保多系列数据时的颜色区分度。
    *   **坐标轴 (Axes)**：X 轴标签过长时自动倾斜（`rotate: 45`）或截断；Y 轴根据数据动态计算 `min` 和 `max`，并自动格式化大数值（如 10000 显示为 10k）。
    *   **图例 (Legend)**：默认开启，放置在图表顶部或底部居中。
*   **交互细节 (Interaction Details)**：
    *   **悬浮提示 (Tooltip)**：必须开启 `tooltip: { trigger: 'axis' }`（折线/柱状）或 `trigger: 'item'`（饼图）。Tooltip 内容需格式化，清晰展示系列名称、类目和具体数值。
    *   **图例过滤**：用户点击图例项可以动态隐藏/显示对应的数据系列。
    *   **响应式缩放 (Responsive Resize)**：必须监听容器大小变化（使用 `ResizeObserver` 或 `echarts-for-react` 的内置机制），在浏览器窗口调整或移动端旋转屏幕时，调用 `chart.resize()` 确保图表不溢出、不拉伸。
*   **导出功能 (Export)**：
    *   在图表右上角提供一个“下载”图标按钮，点击后调用 ECharts 的 `getDataURL` 方法，将当前图表导出为 PNG 图片并触发浏览器下载，文件命名规则为 `ai-chart-[timestamp].png`。

### 2.5 异常与状态处理矩阵
系统必须具备极强的鲁棒性，优雅地处理各种异常情况。

| 场景 / 错误类型              | HTTP 状态码               | 前端 UI 表现 (User Feedback)                                                                                        | 降级/恢复策略                  |
| :--------------------------- | :------------------------ | :------------------------------------------------------------------------------------------------------------------ | :----------------------------- |
| **加载中 (Loading)**         | N/A                       | 输入框禁用，图表区域显示脉冲动画的骨架屏 (Skeleton) 或 Lottie 动画，提示“AI 正在努力解析数据并绘制图表...”          | N/A                            |
| **输入为空/纯空格**          | 前端拦截                  | 输入框抖动动画，Toast 提示：“请输入有效的数据或描述”。                                                              | 阻止请求发出                   |
| **输入内容违规/超长**        | 400 Bad Request           | Toast 提示：“输入内容不符合要求，请检查后重试”。                                                                    | 允许用户修改后重新提交         |
| **AI 解析失败/无法提取数据** | 422 Unprocessable Entity  | 图表区域显示 Empty State 插画，下方文字提示：“抱歉，未能从您的输入中提取到有效数据，请尝试提供更清晰的数字和类别。” | 提供标准数据格式示例供用户参考 |
| **API 请求超时**             | 504 Gateway Timeout       | Toast 提示：“请求超时，AI 思考得有点久，请稍后再试”。                                                               | 恢复输入框状态，允许重试       |
| **大模型服务限流**           | 429 Too Many Requests     | Toast 提示：“当前访问人数过多，请休息一下再试”。                                                                    | 禁用发送按钮 5 秒              |
| **未知系统错误**             | 500 Internal Server Error | Toast 提示：“系统开小差了，请稍后重试”。                                                                            | 记录前端错误日志 (Sentry)      |

---

## 3. 非功能性需求 (Non-Functional Requirements)

### 3.1 性能指标 (Performance)
*   **首屏绘制 (FCP - First Contentful Paint)**：< 1.5 秒。要求首页静态资源（HTML/CSS）极速加载，核心 JS 采用代码分割 (Code Splitting)。
*   **可交互时间 (TTI - Time to Interactive)**：< 2.0 秒。
*   **API 响应时间**：`/api/generate-chart` 接口的 P95 响应时间必须 < 3.0 秒（依赖于大模型流式输出或快速响应模型）。
*   **端到端生成时间 (End-to-End)**：从用户点击发送到图表完全渲染完毕，整体耗时 < 5.0 秒。
*   **渲染性能**：图表组件需支持最大 1000 个数据点的流畅渲染，拖拽或缩放时帧率 (FPS) 保持在 30 以上。

### 3.2 技术栈与架构约束 (Tech Stack & Architecture)
*   **核心框架**：Next.js 16+ (必须使用 App Router 架构 `app/`)。
*   **视图层**：React 19+ (使用 Server Components 优化首屏，交互组件使用 `'use client'`)。
*   **样式与 UI**：Tailwind CSS 4+ 结合 shadcn/ui 组件库。严禁写内联样式，所有颜色必须使用 CSS 变量以支持暗黑模式。
*   **图表库**：ECharts 5+ (推荐使用 `echarts-for-react` 封装)。
*   **语言规范**：TypeScript 5+。必须开启 Strict Mode，严禁在业务代码中使用 `any` 类型。
*   **架构约束 (前后端分离)**：
    *   前端严禁直接引入 OpenAI SDK 或暴露 API Key。
    *   所有 AI 调用必须通过 Next.js 的后端路由 `app/api/generate-chart/route.ts` 进行代理。
    *   大模型服务统一路由至阿里云 DashScope API (兼容 OpenAI 格式)。

### 3.3 体验与兼容性 (UX & Compatibility)
*   **浏览器兼容性**：支持 Chrome, Edge, Safari, Firefox 的最新 2 个大版本。不支持 IE11。
*   **响应式断点 (Responsive Breakpoints)**：
    *   **Mobile (< 768px)**：图表高度固定（如 300px），图例默认放置在底部，输入框吸底。
    *   **Tablet (768px - 1024px)**：图表高度适中（如 400px），左右留白。
    *   **Desktop (> 1024px)**：图表占据主要视觉区域（高度 500px+），支持更复杂的交互。
*   **无障碍访问 (Accessibility - A11y)**：
    *   所有交互元素（按钮、输入框）必须支持 `Tab` 键键盘导航。
    *   输入框需配置 `aria-label="数据输入框"`，图表容器需配置 `aria-label="生成的图表展示区"`。
    *   文本与背景的色彩对比度必须满足 **WCAG AA** 标准（对比度至少 4.5:1）。

---

## 4. 数据模型与 API 契约 (Data Models & API Contracts)

### 4.1 API 接口定义
**生成图表配置接口**
*   **Path**: `POST /api/generate-chart`
*   **Content-Type**: `application/json`

**Request Body:**
```json
{
  "userInput": "对比一下北京和上海第一季度的销售额，北京分别是10,20,30，上海是15,25,35"
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "chartType": "bar",
    "title": "北京与上海第一季度销售额对比",
    "option": {
      // 完整的 ECharts Option JSON 对象
      "tooltip": { "trigger": "axis" },
      "legend": { "data": ["北京", "上海"] },
      "xAxis": { "type": "category", "data": ["一月", "二月", "三月"] },
      "yAxis": { "type": "value" },
      "series": [
        { "name": "北京", "type": "bar", "data": [10, 20, 30] },
        { "name": "上海", "type": "bar", "data": [15, 25, 35] }
      ]
    },
    "metadata": {
      "generatedAt": "2026-02-25T10:00:00Z",
      "modelUsed": "qwen-max"
    }
  }
}
```

**Error Response (4xx/5xx):**
```json
{
  "error": "Unprocessable Entity",
  "message": "未能从输入中提取到有效的数据序列",
  "code": 422
}
```

### 4.2 核心 TypeScript 接口定义 (位于 `types/` 目录)

```typescript
// types/api.ts
export interface GenerateChartRequest {
  userInput: string;
}

export interface GenerateChartResponse {
  data?: ChartConfig;
  error?: string;
  message?: string;
  code?: number;
}

// types/charts.ts
export type ChartType = 'line' | 'bar' | 'pie';

export interface ChartConfig {
  chartType: ChartType;
  title: string;
  option: any; // ECharts.EChartsOption
  metadata: {
    generatedAt: string;
    modelUsed: string;
    inputId?: string;
  };
}

// types/models.ts
export interface UserInput {
  id: string;
  content: string;
  timestamp: number;
  status: 'pending' | 'success' | 'error';
}

export interface AIResponse {
  extractedData: {
    categories?: string[]; // X轴标签
    series: Array<{
      name: string;
      data: number[];
    }>;
  };
  recommendedType: ChartType;
  confidenceScore: number; // 0-1
}
```

---

## 5. 验收标准与测试用例 (Acceptance Criteria & Test Cases)

### 5.1 核心流程验收标准 (BDD 风格)

**Scenario 1: 首次成功生成图表并触发布局切换**
*   **Given (假设)** 用户处于首页初始“搜索态”，输入框居中。
*   **When (当)** 用户在输入框中输入“2023年各季度营收：Q1 100万，Q2 150万，Q3 200万，Q4 250万”并点击发送。
*   **Then (那么)** 输入框应变为禁用状态并显示 Loading。
*   **And (并且)** API 返回成功后，输入框应在 300ms 内平滑移动至页面底部。
*   **And (并且)** 页面上方应渲染出一个包含 4 个数据点的折线图或柱状图，标题包含“2023年各季度营收”。

**Scenario 2: 明确指定图表类型**
*   **Given (假设)** 用户处于对话态。
*   **When (当)** 用户输入“把上面的数据改成饼图展示”并发送。
*   **Then (那么)** 系统应保留原有数据，但将图表类型强制渲染为饼图 (Pie Chart)。

### 5.2 关键边界测试用例 (Edge Cases)

| 用例编号 | 测试场景           | 输入数据示例                             | 预期结果                                                                       |
| :------- | :----------------- | :--------------------------------------- | :----------------------------------------------------------------------------- |
| TC-001   | **超长文本输入**   | 粘贴超过 2000 字符的无意义文本           | 前端拦截，输入框标红，提示“输入内容过长”。发送按钮不可点击。                   |
| TC-002   | **无数据纯闲聊**   | “你好，今天天气真不错”                   | API 返回 422，前端展示 Empty State，提示“未能提取到有效数据”。                 |
| TC-003   | **数据维度不匹配** | “X轴是A,B,C，Y轴是10,20” (Y轴少一个数据) | AI 应自动将 Y 轴第三个数据补齐为 0 或 null，图表正常渲染，不应白屏崩溃。       |
| TC-004   | **网络异常中断**   | 在点击发送后，立即断开本地网络           | 经过设定的超时时间后，Loading 结束，Toast 提示网络错误，输入框恢复可编辑状态。 |
| TC-005   | **X轴标签极长**    | “第一季度非常非常长的描述文本...”        | 图表正常渲染，X 轴标签自动倾斜 45 度或使用省略号截断，图表容器不被撑破。       |
| TC-006   | **暗黑模式切换**   | 操作系统或系统设置切换为 Dark Mode       | 图表背景变为深色，坐标轴文字、图例文字自动反色为浅色，保证清晰可见。           |

---
*文档结束*
