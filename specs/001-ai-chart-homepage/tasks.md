# Tasks: AI Chart Generator Homepage

**Input**: Design documents from `/specs/001-ai-chart-homepage/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-schema.md

**Tests**: Tests are NOT explicitly requested in the specification, so this task list focuses on implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js web application with the following structure:
- `app/` - Next.js App Router pages and API routes
- `components/` - React components (ui/, charts/, business components)
- `lib/` - Utility libraries and configurations
- `types/` - TypeScript type definitions
- `public/` - Static assets

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [ ] T001 Create .env.local file with DASHSCOPE_API_KEY placeholder
- [ ] T002 Install OpenAI SDK dependency: `npm install openai`
- [ ] T003 [P] Install ECharts dependencies: `npm install echarts echarts-for-react`
- [ ] T004 [P] Initialize shadcn/ui: `npx shadcn@latest init` (select TypeScript, Default style, Slate color, CSS variables)
- [ ] T005 [P] Install shadcn/ui components: `npx shadcn@latest add input button card alert toast`
- [ ] T006 [P] Add .env.local to .gitignore if not already present

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and shared utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 [P] Create types/models.ts with UserInput, DataSeries, StructuredData interfaces and validateUserInput function
- [ ] T008 [P] Create types/charts.ts with ChartType, ChartConfig interfaces and validateChartConfig function
- [ ] T009 [P] Create types/api.ts with GenerateChartRequest, GenerateChartResponse, APIErrorResponse interfaces
- [ ] T010 Create types/index.ts to export all types from models.ts, charts.ts, and api.ts
- [ ] T011 [P] Create lib/openai-client.ts to initialize OpenAI client with DashScope baseURL and API key validation
- [ ] T012 [P] Create lib/prompt-builder.ts with buildSystemPrompt function for LLM instructions
- [ ] T013 [P] Create lib/utils.ts for general utility functions (if needed beyond shadcn's default utils)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 基础图表生成 (Priority: P1) 🎯 MVP

**Goal**: Users can input natural language data descriptions and see a generated chart. This is the core MVP functionality.

**Independent Test**: Visit homepage, enter "2024年销售额：1月100万，2月120万，3月150万", click send, verify a chart displays with correct data.

### Backend Implementation for User Story 1

- [ ] T014 [US1] Create app/api/generate-chart/route.ts with POST handler skeleton (export runtime = 'nodejs', dynamic = 'force-dynamic')
- [ ] T015 [US1] Implement POST handler in app/api/generate-chart/route.ts: parse request, call OpenAI SDK with buildSystemPrompt, parse JSON response, return ChartConfig
- [ ] T016 [US1] Add error handling to app/api/generate-chart/route.ts for invalid input, API failures, and JSON parsing errors

### Frontend Components for User Story 1

- [ ] T017 [P] [US1] Create components/ui/input.tsx (should already exist from shadcn, verify it's properly configured)
- [ ] T018 [P] [US1] Create components/ui/button.tsx (should already exist from shadcn, verify it's properly configured)
- [ ] T019 [P] [US1] Create components/ui/card.tsx (should already exist from shadcn, verify it's properly configured)
- [ ] T020 [P] [US1] Create components/ui/alert.tsx (should already exist from shadcn, verify it's properly configured)
- [ ] T021 [P] [US1] Create components/charts/LineChart.tsx with ECharts line chart rendering using echarts-for-react
- [ ] T022 [P] [US1] Create components/charts/BarChart.tsx with ECharts bar chart rendering using echarts-for-react
- [ ] T023 [P] [US1] Create components/charts/PieChart.tsx with ECharts pie chart rendering using echarts-for-react
- [ ] T024 [US1] Create components/charts/ChartRenderer.tsx that selects LineChart/BarChart/PieChart based on chartType prop
- [ ] T025 [P] [US1] Create lib/api-client.ts with generateChart function to call POST /api/generate-chart

### Page Implementation for User Story 1

- [ ] T026 [US1] Update app/page.tsx to render centered input box with "发送" button in initial state
- [ ] T027 [US1] Add state management to app/page.tsx for userInput, chartConfig, loading, and error states
- [ ] T028 [US1] Implement handleSubmit function in app/page.tsx to validate input, call generateChart API, update state
- [ ] T029 [US1] Add loading indicator (spinner or skeleton) in app/page.tsx during API call
- [ ] T030 [US1] Render ChartRenderer component in app/page.tsx when chartConfig is available
- [ ] T031 [US1] Add error display using Alert component in app/page.tsx when API call fails
- [ ] T032 [US1] Add input validation in app/page.tsx using validateUserInput before API call

**Checkpoint**: At this point, User Story 1 should be fully functional - users can generate charts from natural language input

---

## Phase 4: User Story 2 - 响应式布局转换 (Priority: P2)

**Goal**: After generating first chart, layout transitions from centered input to top chart + bottom input (chat-like interface)

**Independent Test**: Generate a chart, observe input box moving to bottom and chart displaying at top; input new data in bottom box and verify new chart replaces old one.

### Implementation for User Story 2

- [ ] T033 [US2] Add layoutMode state ('initial' | 'chat') to app/page.tsx to track current layout
- [ ] T034 [US2] Update app/page.tsx layout to conditionally render centered input (initial mode) or top chart + bottom input (chat mode)
- [ ] T035 [US2] Add CSS transitions in app/globals.css for smooth layout transformation between modes
- [ ] T036 [US2] Implement layout switch logic in app/page.tsx: change layoutMode from 'initial' to 'chat' after first successful chart generation
- [ ] T037 [US2] Create components/ChatInput.tsx for bottom input box with send button (reusable chat-style input)
- [ ] T038 [US2] Create components/ChartDisplay.tsx for top chart display area with proper spacing and responsive design
- [ ] T039 [US2] Test responsive layout on mobile (375px+) and desktop (1920px) to ensure smooth transitions

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - layout transforms correctly after chart generation

---

## Phase 5: User Story 3 - 用户指定图表类型 (Priority: P3)

**Goal**: Users can explicitly specify chart type in their input (e.g., "用饼图展示...")

**Independent Test**: Input "用柱状图显示2024年各月销售额：1月100，2月120，3月150", verify system generates a bar chart (not line or pie).

### Implementation for User Story 3

- [ ] T040 [US3] Update lib/prompt-builder.ts buildSystemPrompt to emphasize detecting user-specified chart type keywords (柱状图, 折线图, 饼图)
- [ ] T041 [US3] Add examples to lib/prompt-builder.ts system prompt showing how to prioritize user-specified chart types
- [ ] T042 [US3] Update app/api/generate-chart/route.ts to validate that returned chartType matches user intent (optional validation)
- [ ] T043 [US3] Add user hint/tooltip in app/page.tsx input placeholder suggesting users can specify chart types (e.g., "输入数据或指定图表类型，如'用柱状图显示...'")

**Checkpoint**: All user stories (1, 2, 3) should now be independently functional - users can specify chart types

---

## Phase 6: User Story 4 - 图表交互和优化 (Priority: P4)

**Goal**: Charts have interactive features (hover tooltips, legend toggle, responsive resizing) and professional visual styling

**Independent Test**: Generate chart, hover over data points to see tooltips, click legend items to toggle series visibility, resize browser window to verify chart adapts.

### Implementation for User Story 4

- [ ] T044 [P] [US4] Create lib/chart-configs/themes.ts with professional color themes for ECharts
- [ ] T045 [P] [US4] Create lib/chart-configs/defaults.ts with default ECharts configurations (tooltip, legend, responsive settings)
- [ ] T046 [US4] Update components/charts/LineChart.tsx to include interactive tooltip, legend toggle, and smooth animations
- [ ] T047 [US4] Update components/charts/BarChart.tsx to include interactive tooltip, axis pointer, and hover effects
- [ ] T048 [US4] Update components/charts/PieChart.tsx to include interactive tooltip, legend, and emphasis effects
- [ ] T049 [US4] Add window resize listener to components/charts/ChartRenderer.tsx to call echarts.resize() on window resize
- [ ] T050 [US4] Update lib/prompt-builder.ts to request high-quality color schemes and proper label formatting from LLM
- [ ] T051 [US4] Add responsive chart height calculations in components/charts/ components based on viewport size
- [ ] T052 [US4] Verify WCAG AA color contrast compliance in app/globals.css and chart color themes
- [ ] T053 [US4] Add accessibility attributes (aria-labels) to chart containers in components/charts/ components

**Checkpoint**: All user stories should now be independently functional with polished interactions

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect multiple user stories and overall quality

- [ ] T054 [P] Add comprehensive error messages in app/api/generate-chart/route.ts for different failure scenarios (API timeout, invalid JSON, etc.)
- [ ] T055 [P] Create README.md documentation in specs/001-ai-chart-homepage/ with setup instructions and usage examples
- [ ] T056 [P] Add JSDoc comments to all functions in lib/ directory for better code documentation
- [ ] T057 Optimize bundle size by lazy-loading ECharts components using next/dynamic in app/page.tsx
- [ ] T058 [P] Add rate limiting or request throttling to app/api/generate-chart/route.ts (10 requests/minute per IP)
- [ ] T059 [P] Add performance monitoring logs (timing) to app/api/generate-chart/route.ts for LLM call duration
- [ ] T060 Validate against quickstart.md: ensure all steps work end-to-end
- [ ] T061 [P] Update app/layout.tsx with proper metadata (title, description) for SEO
- [ ] T062 [P] Ensure app/globals.css includes all necessary Tailwind base styles and custom utilities
- [ ] T063 Final manual testing across Chrome, Firefox, Safari, Edge (latest 2 versions)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase (Phase 2) completion
  - User stories can proceed in parallel (if staffed) since they're independently testable
  - Or sequentially in priority order: US1 (P1) → US2 (P2) → US3 (P3) → US4 (P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ MVP READY
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 but US1 works independently
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 but US1 works independently
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Enhances all charts but charts work without it

### Within Each User Story

- **User Story 1**:
  - Backend (T014-T016) can start immediately after Foundational
  - Frontend Components (T017-T025) can run in parallel - marked with [P]
  - Page Implementation (T026-T032) depends on both backend and frontend components
  
- **User Story 2**:
  - All tasks (T033-T039) must complete User Story 1 first for context, but are independent from US3/US4
  
- **User Story 3**:
  - Prompt updates (T040-T041) can run in parallel with US2
  - UI updates (T042-T043) are lightweight additions
  
- **User Story 4**:
  - Theme/config creation (T044-T045) can run in parallel - marked with [P]
  - Component enhancements (T046-T048) can run in parallel - marked with [P]
  - Accessibility (T049-T053) depends on component enhancements

### Parallel Opportunities

- **Setup Phase**: T002, T003, T004, T005, T006 can all run in parallel
- **Foundational Phase**: T007, T008, T009, T011, T012, T013 can all run in parallel (T010 depends on T007-T009)
- **User Story 1**: T021-T025 (chart components + API client) can all run in parallel
- **User Story 4**: T044-T045 (themes/configs) and T046-T048 (component updates) can run in parallel within their groups
- **Polish Phase**: Most tasks (T054, T055, T056, T058, T059, T061, T062) can run in parallel

---

## Parallel Example: User Story 1

Once Foundational Phase (Phase 2) is complete, these User Story 1 tasks can launch simultaneously:

```bash
# Backend API (1 developer):
Task T014: "Create app/api/generate-chart/route.ts with POST handler skeleton"
Task T015: "Implement POST handler in app/api/generate-chart/route.ts"
Task T016: "Add error handling to app/api/generate-chart/route.ts"

# Frontend Chart Components (3 developers in parallel):
Task T021: "Create components/charts/LineChart.tsx"
Task T022: "Create components/charts/BarChart.tsx"  
Task T023: "Create components/charts/PieChart.tsx"

# API Client (1 developer):
Task T025: "Create lib/api-client.ts with generateChart function"
```

After these complete, proceed to:

```bash
# Chart Renderer + Page (requires components from above):
Task T024: "Create components/charts/ChartRenderer.tsx"
Task T026-T032: Page implementation tasks
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - RECOMMENDED

1. **Complete Phase 1: Setup** (6 tasks, ~15 minutes)
2. **Complete Phase 2: Foundational** (7 tasks, ~30 minutes) - CRITICAL BLOCKER
3. **Complete Phase 3: User Story 1** (19 tasks, ~2-3 hours)
4. **STOP and VALIDATE**: 
   - Test: Open app, input data, verify chart renders
   - Test: Try different data types (time series, categorical, percentages)
   - Test: Verify error handling for invalid input
5. **Deploy/demo MVP** - at this point you have a working product!

**Total MVP Time Estimate**: 3-4 hours

### Incremental Delivery

1. **Foundation** (Setup + Foundational) → ~45 minutes
2. **Add User Story 1** → Test independently → Deploy/Demo (MVP!) → ~3 hours from start
3. **Add User Story 2** → Test layout transitions → Deploy/Demo → ~4.5 hours from start
4. **Add User Story 3** → Test chart type specification → Deploy/Demo → ~5 hours from start
5. **Add User Story 4** → Test interactions and polish → Deploy/Demo → ~6-7 hours from start
6. **Polish Phase** → Final cleanup and optimization → ~7-8 hours total

Each story adds value without breaking previous stories. Can ship after any story completion.

### Parallel Team Strategy

With 3-4 developers:

1. **Everyone together**: Complete Setup + Foundational (~45 minutes)
2. **Once Foundational is done**, split work:
   - **Developer A**: Backend API (T014-T016)
   - **Developer B**: Chart Components (T021-T023)
   - **Developer C**: API Client + UI Components verification (T025, T017-T020)
   - **Developer D**: Page implementation planning
3. After parallel work completes (~1 hour):
   - **Developer A**: Chart Renderer (T024)
   - **Developers B+C+D**: Page implementation (T026-T032) - pair/mob programming
4. **User Story 1 complete** → Test MVP together
5. **Next iteration**: Assign US2, US3, US4 to different developers (each can work independently)

---

## Task Count Summary

- **Setup**: 6 tasks
- **Foundational**: 7 tasks (CRITICAL - blocks everything)
- **User Story 1 (P1)**: 19 tasks ⭐ MVP
- **User Story 2 (P2)**: 7 tasks
- **User Story 3 (P3)**: 4 tasks
- **User Story 4 (P4)**: 10 tasks
- **Polish**: 10 tasks

**Total**: 63 tasks

**Parallel Opportunities**: 20+ tasks can run in parallel (marked with [P])

**Independent Test Criteria**:
- ✅ **US1**: Input data → see chart (core value)
- ✅ **US2**: Layout transforms after first chart (UX improvement)
- ✅ **US3**: Specify chart type → get that type (user control)
- ✅ **US4**: Hover/interact with chart (professional polish)

---

## Suggested MVP Scope

**Minimum Viable Product** = Setup + Foundational + User Story 1

This gives you:
- ✅ Working chart generation from natural language
- ✅ Support for 3 chart types (line, bar, pie)
- ✅ Error handling and validation
- ✅ Responsive design
- ✅ Professional UI with shadcn/ui

**Time to MVP**: 3-4 hours (one focused work session)

**Recommended First Release**: MVP + User Story 2 (adds chat-like layout)

**Full Feature Complete**: All user stories + Polish (~7-8 hours total)

---

## Notes

- ✅ All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- ✅ Tasks organized by user story for independent implementation and testing
- ✅ Each user story has clear goal and independent test criteria
- ✅ Foundational phase clearly marked as CRITICAL BLOCKER
- ✅ MVP path clearly identified (Setup + Foundational + US1)
- ✅ Parallel opportunities marked with [P] for efficient execution
- ✅ File paths use Next.js App Router conventions (app/, components/, lib/, types/)
- ✅ Tests NOT included (not requested in specification)
- ✅ Dependencies clearly documented in execution order section
- ⚠️ Ensure DASHSCOPE_API_KEY is set before running API routes
- ⚠️ Commit after completing each user story or logical task group
- ⚠️ Stop at any checkpoint to validate story independently before proceeding
