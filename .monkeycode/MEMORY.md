# 用户指令记忆

本文件记录了用户的指令、偏好和教导，用于在未来的交互中提供参考。

## 格式

### 用户指令条目
用户指令条目应遵循以下格式：

[用户指令摘要]
- Date: [YYYY-MM-DD]
- Context: [提及的场景或时间]
- Instructions:
  - [用户教导或指示的内容，逐行描述]

### 项目知识条目
Agent 在任务执行过程中发现的条目应遵循以下格式：

[项目知识摘要]
- Date: [YYYY-MM-DD]
- Context: Agent 在执行 [具体任务描述] 时发现
- Category: [运维部署|构建方法|测试方法|排错调试|工作流协作|环境配置]
- Instructions:
  - [具体的知识点，逐行描述]

## 去重策略
- 添加新条目前，检查是否存在相似或相同的指令
- 若发现重复，跳过新条目或与已有条目合并
- 合并时，更新上下文或日期信息
- 这有助于避免冗余条目，保持记忆文件整洁

## 条目

[用户指令摘要]
- Date: 2026-06-23
- Context: 用户要求 review 和重构项目
- Instructions:
  - 用户要求对项目进行全面的 code review
  - 用户要求提出重构建议和改进方案
  - 用户希望了解代码质量问题和最佳实践

[项目知识摘要]
- Date: 2026-06-23
- Context: Agent 在执行项目 review 和重构任务时发现
- Category: 构建方法
- Instructions:
  - 项目使用 bun 作为包管理器，运行 `bun install` 安装依赖
  - 使用 `npm run lint` 运行 ESLint 检查
  - 项目使用 Next.js 16 + React 19 + TypeScript
  - 使用 Tailwind CSS v4 + shadcn/ui 组件库
  - 使用 Prisma + SQLite 作为本地数据库
  - 项目结构：src/app (页面)、src/components (组件)、src/hooks (自定义 hooks)、src/lib (工具函数和 API 客户端)

[项目知识摘要]
- Date: 2026-06-23
- Context: Agent 在执行项目 review 和重构任务时发现
- Category: 排错调试
- Instructions:
  - 修复了 proxy-helper.ts 中的 ESLint 错误：将 `require('fs')` 改为动态 `import('fs')`
  - 将 `readAuthTokenFromFile` 和 `getAuthToken` 函数改为异步以支持动态导入
  - 更新了所有调用者以使用 `await getAuthToken()`
  - 项目存在大型组件 hi-claw-dashboard.tsx (754行)，建议拆分为更小的组件

[项目知识摘要]
- Date: 2026-06-23
- Context: Agent 在执行项目 review 和重构任务时发现
- Category: 工作流协作
- Instructions:
  - 项目使用 Git 进行版本控制
  - 使用 ESLint 进行代码质量检查
  - 建议在提交代码前运行 `npm run lint` 检查代码质量
  - 项目使用 Next.js API 路由作为代理层，所有请求通过 `/api/hiclaw/*` 和 `/api/matrix/*` 代理
  - 用户要求长迭代改进：每轮重构后联网搜索相关主题总结，再进入下一轮

[项目知识摘要]
- Date: 2026-06-23
- Context: Agent 在执行跨轮次重构任务时发现
- Category: 构建方法
- Instructions:
  - 全局共享组件存放于 `src/components/dashboard/`
  - 已提取的共享组件：`CopyButton`、`ConfirmDeleteDialog`、`PhaseBadge`、`RuntimeBadge`
  - 已提取的共享 Hook：`useCopyToClipboard`（`src/lib/use-copy-to-clipboard.ts`）、`useViewMode`（`src/lib/use-view-mode.ts`）
  - 阶段颜色和标签常量位于 `src/lib/phase-colors.ts`（WORKER/TEAM/MANAGER/HUMAN/RUNTIME）
  - workers-section.tsx 保留 `AlertDialog*` import（批量操作对话框使用）

[项目知识摘要]
- Date: 2026-06-24
- Context: Agent 在执行 dashboard-refactor-governance 改造任务时发现
- Category: 构建方法
- Instructions:
  - `tsconfig.json` 排除 `node_modules/examples/skills/vitest.config.ts/vitest.setup.ts`，应用代码 TypeScript 检查走 `npm run typecheck`
  - 验证脚本：`npm run typecheck` → `tsc --noEmit`；`npm run lint` → `eslint .`；`bun run test` → `vitest run`；`npm run build` → `next build` (Turbopack)
  - Vitest 与 Tailwind v4 冲突：`postcss.config.mjs` 已被重命名为 `postcss.config.next.mjs`，避免 vite 扫描失败
  - Vitest 启动脚本：`vitest.config.ts` 配置 `environment: 'jsdom'` + `css: false` + 路径别名 `@/* → ./src/*`
  - `globals.css` 中 `tw-animate-css` 改用 `@plugin "tw-animate-css";`（Tailwind v4 插件语法），Turbopack 才能解析
  - `reactStrictMode` 在 `next.config.ts` 已设为 `true`，构建通过

[项目知识摘要]
- Date: 2026-06-24
- Context: Agent 在执行 dashboard-refactor-governance 改造任务时发现
- Category: 测试方法
- Instructions:
  - 测试目录约定：与被测代码同目录放 `*.test.ts(x)`，单测文件默认 jsdom 环境
  - 已覆盖：`src/lib/api-error.test.ts`（11）、`src/lib/use-copy-to-clipboard.test.ts`（6）、`src/lib/use-view-mode.test.ts`（4）、`src/lib/utils.test.ts`（10）
  - 钩子测试用 `@testing-library/react` 的 `renderHook` + `act`；fake timer 用 `vi.useFakeTimers()`
  - `sanitizeHtml` 现已 fallback 到 `escapeHtml` 转义后的纯文本；新增 `escapeHtml` 工具函数

[项目知识摘要]
- Date: 2026-06-24
- Context: Agent 在执行 dashboard-refactor-governance 改造任务时发现
- Category: 环境配置
- Instructions:
  - ESLint 已上线 `no-debugger`（error）与 `no-console`（仅允许 warn/error），`server-runner.mjs` 的启动日志已用 `console.warn` 输出
  - 仍未上线的 lint 规则：`no-unused-vars`、`@typescript-eslint/no-unused-vars`、`react-hooks/exhaustive-deps`，待对应清理
  - 文档参考：`.monkeycode/specs/dashboard-refactor-governance/requirements.md` + `design.md`

[项目知识摘要]
- Date: 2026-06-24
- Context: Agent 在执行 dashboard-refactor-governance 改造任务时发现
- Category: 排错调试
- Instructions:
  - Matrix homeserver allowlist 位于 `src/lib/homeserver-allowlist.ts`，使用 `MATRIX_HOMESERVER_ALLOWLIST` / `MATRIX_HOMESERVER_BLOCKED_SUFFIXES` 环境变量配置；缺省允许 `localhost / 127.0.0.1 / ::1 / matrix.org / client.matrix.org`，阻断私有 IPv4/IPv6 与 `.svc/.local` 后缀
  - 所有 Matrix proxy 路由（`src/app/api/matrix/**/route.ts`）走 `getMatrixHomeserver` 统一校验，失败抛 `HomeserverValidationError`
  - `matrix-store` 通过 zustand persist 仅保存 `homeserver / userId / deviceId / isLoggedIn / syncToken`；`accessToken` 不再持久化，重水合时若 `isLoggedIn=true` 但 token 缺失会自动登出
  - HTML 清洗已切换到 `isomorphic-dompurify`（`src/lib/utils.ts`），保留 `escapeHtml` 作为 fallback；不再依赖正则
  - `src/app/api/matrix/login/route.ts` 与 `src/app/api/matrix/rooms/[roomId]/send/route.ts` 已改用 `try/finally` 清理 `setTimeout`，避免 AbortController 泄漏
  - `src/lib/homeserver-allowlist.test.ts`（12 用例）覆盖协议、IPv4/IPv6 私网、blocked suffix、allowlist、allowPrivateNetwork 选项与 reason 字段

[项目知识摘要]
- Date: 2026-06-24
- Context: Agent 在执行 dashboard-refactor-governance 改造任务时发现
- Category: 排错调试
- Instructions:
  - chat-section 已拆分为 `src/components/dashboard/sections/chat/{format.ts,room-info.ts,matrix-login-form.tsx,room-list-item.tsx,date-separator.tsx,message-bubble.tsx,chat-composer.tsx,chat-panel.tsx,human-panel.tsx,room-topology.tsx,matrix-status-banner.tsx}`；顶层 `chat-section.tsx` 从 1119 行降至 271 行
  - `chat/format.ts` 是纯函数（getAvatarColor / formatTime / formatDate / isDifferentDay / renderFormattedContent），由 `format.test.ts` 12 用例覆盖
  - `ChatPanel` 内部分 `ChatHeader / ChatMessages / ChatComposer / MembersSidebar / ChatLoginRequired` 五个局部子组件，通过 props 注入；状态保持在 ChatPanel
  - `buildRooms` / `filterRooms` 提至顶层 `chat-section.tsx` 顶部，便于复用与单测