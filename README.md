# TaDashboard

> HiClaw 的管理面板（Management Dashboard）

TaDashboard 是一个基于 **Next.js** 构建的 Web 管理界面，用于可视化管理 [HiClaw](https://github.com/higress-group/hiclaw) 集群中的 Worker、Team、Human、Manager、Gateway Consumer 等资源，同时集成 Matrix 聊天能力。

---

## 技术栈

- **框架**：Next.js 16 + React 19 + TypeScript
- **样式**：Tailwind CSS v4 + shadcn/ui
- **状态管理**：Zustand + TanStack Query (React Query)
- **数据库**：SQLite + Prisma
- **运行时**：Bun / Node.js
- **部署**：Docker + k3s，Next.js standalone 输出

---

## 功能模块

| 模块 | 说明 |
|------|------|
| **Overview** | 全局概览：活跃 Worker、Team、Matrix 房间数、资源状态 |
| **Workers** | Worker 全生命周期管理：查看、唤醒、休眠、确保就绪、删除 |
| **Teams** | Team 管理：成员、关联 Worker、Human、详情弹窗 |
| **Humans** | Human 资源 CRUD：卡片/表格视图、权限级别、房间关联 |
| **Managers** | Manager 管理：模型配置、欢迎消息、协调团队/Worker |
| **K8s** | Kubernetes CRD 资源卡片展示、YAML/JSON 预览 |
| **Infrastructure** | 基础设施状态：Controller、Matrix、各组件健康度 |
| **Chat** | Matrix 聊天集成：房间列表、成员、消息收发 |
| **Security** | 权限矩阵、访问控制、安全策略展示 |
| **Skills** | Skill/MCP 资源管理 |
| **Architecture** | 架构图与组件关系说明 |
| **Runtime** | 运行时状态与日志 |
| **Quickstart** | 快速上手指引 |

---

## 项目结构

```
dashboard/app
├── src/
│   ├── app/
│   │   ├── api/hiclaw/        # HiClaw Controller 代理 API
│   │   ├── api/matrix/        # Matrix Homeserver 代理 API
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/         # 面板业务组件
│   │   │   ├── sections/      # 各功能区域组件
│   │   │   └── hi-claw-dashboard.tsx
│   │   └── ui/                # shadcn/ui 基础组件
│   ├── hooks/                 # TanStack Query + 业务 Hooks
│   ├── lib/                   # 工具函数、API 客户端、Store
│   └── app/
├── prisma/
│   └── schema.prisma          # SQLite 数据模型
├── public/                    # 静态资源
├── .zscripts/                 # 开发/构建辅助脚本
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 本地开发

### 前置要求

- [Bun](https://bun.sh/) 1.3+ 或 Node.js 20+
- SQLite（本地文件即可）

### 安装依赖

```bash
cd dashboard/app
bun install
# 或 npm install
```

### 配置环境变量

复制 `.env` 示例并修改：

```bash
# 本地 SQLite 数据库路径
DATABASE_URL="file:./db/custom.db"

# HiClaw Controller 地址（开发时可以是 localhost 或集群内 Service）
HICLAW_CONTROLLER_URL="http://localhost:8090"

# Matrix Homeserver 地址
NEXT_PUBLIC_MATRIX_API_URL="http://localhost:6167"
```

> ⚠️ 不要将包含真实凭据的 `.env` 提交到仓库。

### 初始化数据库

```bash
bun run db:push
# 或 npm run db:push
```

### 启动开发服务器

```bash
bun run dev
# 或 npm run dev
```

默认监听 `http://localhost:3000`。

---

## 构建与部署

### Docker 构建

项目根目录（`/root/dashboard`）提供 Dockerfile：

```bash
cd /root/dashboard
docker build -t hiclaw-dashboard:latest .
```

构建产物为 Next.js standalone 输出，运行时基于 `node:20-alpine`，以非 root 用户运行。

### k3s 部署

详细部署、网络、Ingress、ServiceAccount Token、存储、安全加固等说明，请参考：

📄 [`DEPLOYMENT_GUIDE.md`](../../DEPLOYMENT_GUIDE.md)

快速部署：

```bash
kubectl apply -f /root/dashboard/dashboard-deployment.yaml
```

---

## 核心设计

### 代理层

- 前端不直接访问 HiClaw Controller 或 Matrix Homeserver，所有请求通过 Next.js API Route 代理：
  - `/api/hiclaw/*` → HiClaw Controller
  - `/api/matrix/*` → Matrix Homeserver
- `proxy-helper.ts` 负责请求转发、认证头注入、超时与错误处理。

### 认证

- Dashboard 在 k3s 中通过 projected ServiceAccount Token 访问 Controller。
- Token 每次请求时重新读取，支持短时效 Token 自动轮转。
- Matrix 访问 Token 通过前端 `?accessToken=` 或 `Authorization` 头部传入。

### 数据持久化

- Dashboard 本地 SQLite 仅用于前端状态（通知、会话等）。
- Worker/Team/Human/Manager 等业务状态由 HiClaw Controller 管理。
- 生产环境通过 PVC 将 `/app/db` 持久化。

---

## 可用脚本

| 脚本 | 说明 |
|------|------|
| `bun run dev` | 启动开发服务器 |
| `bun run build` | 构建 standalone 产物 |
| `bun run start` | 启动生产服务器 |
| `bun run lint` | ESLint 检查 |
| `bun run db:push` | 推送 Prisma schema 到数据库 |
| `bun run db:generate` | 生成 Prisma Client |
| `bun run db:migrate` | 创建并应用迁移 |

---

## 安全注意事项

- 已移除全局 `Access-Control-Allow-Origin: *`，CORS 如需配置请在 Ingress/网关层处理。
- 容器以非 root 用户运行，并启用只读根文件系统。
- `.env` 与本地数据库不应提交到 Git。
- 生产环境请使用私有镜像仓库、TLS、NetworkPolicy 和最小权限 ServiceAccount。

---

## 许可证

本项目属于 higress-group，具体许可证请参考仓库根目录授权文件。

---

## 相关仓库

- [TaDashboard](https://github.com/higress-group/TaDashboard)
- [HiClaw](https://github.com/higress-group/hiclaw)（Controller）
