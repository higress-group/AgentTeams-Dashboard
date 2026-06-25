# Requirements Document

## Introduction

TaDashboard 是一个基于 Next.js 16、React 19、TypeScript、Tailwind CSS v4 和 shadcn/ui 的 HiClaw 管理面板。当前项目已经完成一轮组件拆分和公共模块提取，但仍存在安全边界、构建边界、长列表性能、lint 规则、错误处理一致性和测试覆盖方面的治理空间。

本需求文档用于判断项目是否需要继续重构，并定义后续重构的目标、范围和验收标准。

## Refactor Necessity Assessment

### Conclusion

项目有继续重构的必要。

### Evidence

- Matrix homeserver 由用户输入驱动，服务端代理会向该地址发起请求，安全边界需要收紧。
- Matrix access token 已通过 Authorization header 传输，但仍持久化在浏览器 localStorage 中。
- Matrix formatted message 使用 `dangerouslySetInnerHTML`，当前清洗逻辑为轻量正则实现。
- `tsconfig.json` 包含 `examples/**`，导致 `npx tsc --noEmit` 被示例代码依赖阻断。
- `eslint.config.mjs` 关闭了多项核心质量规则，包括 unused vars、hooks deps、console 和 debugger。
- `chat-section.tsx`、`workers-section.tsx`、`teams-section.tsx` 等 section 仍然较大，继续维护成本偏高。
- 长消息列表和资源列表以全量 DOM 渲染为主，数据增长后会影响性能。
- 项目缺少针对关键工具函数、API 客户端和核心 UI 行为的自动化测试。

## Glossary

- **Dashboard Shell**: 顶层布局、导航、移动端侧栏、页头、页脚和活动 section 状态。
- **Section**: Dashboard 中的业务页面区域，例如 Workers、Teams、Humans、Managers、Chat、K8s。
- **Proxy Layer**: Next.js API routes 中转 HiClaw Controller 和 Matrix Homeserver 的服务端代理层。
- **Matrix Session**: Matrix 登录后产生的 homeserver、userId、deviceId、accessToken 和 syncToken 状态集合。
- **Resource Badge**: 统一展示 Worker、Team、Human、Manager 阶段状态和运行时状态的 UI 元素。
- **Refactor Governance**: 以小步验证、类型检查、lint、构建和测试为边界的持续重构流程。

## Requirements

### Requirement 1: Security Boundary Hardening

**User Story:** AS a dashboard operator, I want backend proxy requests constrained to approved upstreams, so that the dashboard reduces exposure from user-controlled URLs.

#### Acceptance Criteria

1. WHEN a Matrix homeserver is configured, the Proxy Layer SHALL validate the homeserver against an allowlist policy.
2. IF a Matrix homeserver targets a private metadata or link-local network, the Proxy Layer SHALL reject the request with a typed error response.
3. WHEN Matrix access credentials are sent from the browser, the Matrix API client SHALL send credentials through the Authorization header.
4. WHILE Matrix Session state is active, the Dashboard SHALL avoid persisting access tokens in localStorage.

### Requirement 2: Build and Type Check Stability

**User Story:** AS a maintainer, I want project validation commands to reflect supported application code, so that CI failures identify actionable issues.

#### Acceptance Criteria

1. WHEN `npx tsc --noEmit` runs, the project SHALL pass TypeScript checks for maintained application code.
2. IF example code is excluded from maintenance scope, `tsconfig.json` SHALL exclude `examples/**` from application type checks.
3. WHEN `npm run build` runs, Next.js SHALL complete production compilation without being blocked by unmanaged example dependencies.
4. WHEN validation fails, the failure output SHALL identify the owning source area.

### Requirement 3: Lint Rule Recovery

**User Story:** AS a maintainer, I want lint rules to catch common regressions, so that dead code and hook dependency issues are detected before release.

#### Acceptance Criteria

1. WHEN lint runs, ESLint SHALL flag unused variables in maintained application code.
2. WHEN React hooks use captured dependencies, ESLint SHALL evaluate dependency correctness.
3. IF console statements appear in production source, ESLint SHALL report them.
4. IF debugger statements appear in production source, ESLint SHALL report them.

### Requirement 4: Message Rendering Safety

**User Story:** AS a dashboard user, I want formatted Matrix messages rendered safely, so that message formatting does not create script execution risk.

#### Acceptance Criteria

1. WHEN formatted Matrix content is rendered, the Chat Section SHALL sanitize HTML with a parser-based sanitizer.
2. IF a formatted link uses an unsupported protocol, the sanitizer SHALL remove or neutralize the link target.
3. WHEN sanitized links are rendered, links SHALL include `rel="noopener noreferrer"` for external navigation.
4. IF sanitization fails, the Chat Section SHALL render plain text fallback content.

### Requirement 5: Performance Scalability

**User Story:** AS an operator with large clusters and busy rooms, I want the dashboard to stay responsive, so that routine operations remain usable as data grows.

#### Acceptance Criteria

1. WHEN a chat room has many messages, the Chat Section SHALL avoid rendering all historical messages into the DOM at once.
2. WHEN resource lists exceed the configured page size, resource sections SHALL render only visible page items.
3. WHILE filters or sorting change, list sections SHALL avoid repeated expensive transformations outside memoized selectors.
4. WHEN dashboard data updates, shared UI components SHALL avoid unnecessary rerenders where inputs are unchanged.

### Requirement 6: Error Handling Consistency

**User Story:** AS a dashboard user, I want consistent error messages and retry behavior, so that failures are understandable and recoverable.

#### Acceptance Criteria

1. WHEN API requests fail, clients SHALL convert failures into typed error objects.
2. WHEN mutation failures occur, toast notifications and notification store entries SHALL use a shared formatter.
3. IF a backend proxy request times out, the response SHALL use a predictable timeout error message.
4. WHEN retry is available, error states SHALL expose a retry action.

### Requirement 7: Component Modularity

**User Story:** AS a frontend maintainer, I want repeated UI behavior centralized, so that section files remain focused on business workflow.

#### Acceptance Criteria

1. WHEN multiple sections use the same deletion confirmation flow, sections SHALL use a shared confirmation component.
2. WHEN multiple sections render resource phases, sections SHALL use shared badge components.
3. WHEN multiple sections switch between card and table views, sections SHALL use a shared view mode hook.
4. WHEN a section exceeds a maintainability threshold, the section SHALL split list item, table row, dialog and form concerns into local child components.

### Requirement 8: Test Coverage

**User Story:** AS a maintainer, I want critical behavior covered by automated tests, so that future refactors can proceed with confidence.

#### Acceptance Criteria

1. WHEN shared hooks change, hook tests SHALL verify success, failure and cleanup behavior.
2. WHEN API clients change, tests SHALL verify URL generation, headers and error handling.
3. WHEN sanitizer behavior changes, tests SHALL verify allowed tags, blocked attributes and blocked protocols.
4. WHEN shared dialog components change, component tests SHALL verify labels, disabled states and confirm callbacks.
