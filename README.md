# Warm Handover Web 🤝

> 将冰冷的离别化为温暖的交接。让一个人好好告别，让另一个人好好开始。

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[中文](#中文) · [English](#english)

---

## 中文

### 这是什么？

一个完整的 Web 应用，帮助团队在同事离职时做**有尊严、有结构的知识交接**。

[Colleague-Skill](https://github.com/titanwings/colleague-skill) 说"将冰冷的离别化为温暖的 Skill"——然后爬聊天记录生成 AI 僵尸。

**Warm Handover 走另一条路**：引导式访谈 → 结构化文档 → 活知识库。不是模仿死人，是让活人好好交接。

### ✨ 功能

| 模块 | 路由 | 说明 |
|------|------|------|
| 🏠 Landing Page | `/` | 项目理念、流程说明 |
| ➕ 创建交接 | `/new` | 填写人员信息，选择角色模板 |
| 🎙️ 引导式访谈 | `/interview` | 按角色定制的分步问答 |
| 📄 文档生成 | `/output` | 自动生成 4 个 Markdown 文件 |
| 📅 交接时间线 | `/timeline` | T-30 到 T-0 的完整清单 |
| 📋 交接列表 | `/list` | 查看和管理所有交接 |
| 📖 统一详情页 | `/handover/[id]` | 整合访谈 + 时间线 + 评论 |
| 🧠 AI 知识库 | `/knowledge` | 可搜索、可对话的知识库 |
| 📊 管理者看板 | `/dashboard` | 所有交接的评分 + 进度 |
| ⚙️ 设置 | `/settings` | 集成配置（webhook、飞书、钉钉） |

#### 引导式访谈
- **按角色定制**：后端 / 前端 / 产品 / 设计 / 运维，各有专属问题
- **交互式问卷**：一步一步引导，带进度条
- **自动保存**：LocalStorage 持久化，随时继续

#### 结构化输出
自动生成四个交接文档：

| 文件 | 内容 |
|------|------|
| `PROJECT.md` | 项目全景、架构、关键决策、隐藏知识 |
| `PEOPLE.md` | 人脉地图、跨团队协作、雷区 |
| `LESSONS.md` | 经验教训、重来会怎么做、给下一任的话 |
| `TODO.md` | 待办清单、已知问题、时间敏感事项 |

#### AI 知识库（v2 新增）
- 把访谈结果变成**可搜索、可对话**的知识库
- 接手人可以直接提问，AI 基于访谈记录回答
- 每次回答附带**引用来源**

#### 管理者看板（v2 新增）
- 所有交接项目的评分 + 进度一览
- 访谈完成度、时间线进度、文档质量
- 风险预警：低于 60 分标红

#### 团队协作（v2 新增）
- 三种角色视图：离职人 / 接手人 / 管理者
- 每个回答可以评论
- 变更日志自动记录

### 🚀 快速开始

```bash
git clone https://github.com/zgjq/warm-handover-web.git
cd warm-handover-web
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 🛠 技术栈

- **Next.js 16** — App Router
- **TypeScript 5** — 类型安全
- **TailwindCSS 3** — 温暖的橙/琥珀色设计
- **SQLite** — 知识库、评论、评分、审计日志
- **JSZip** — ZIP 文件生成
- **node-cron** — 定时提醒任务
- **nodemailer** — 邮件通知
- **WebSocket** — 实时通知

### 📂 项目结构

```
warm-handover-web/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── new/page.tsx             # 创建交接
│   │   ├── interview/page.tsx       # 引导式访谈
│   │   ├── output/page.tsx          # 文档生成与下载
│   │   ├── timeline/page.tsx        # 交接时间线
│   │   ├── list/page.tsx            # 交接列表
│   │   ├── handover/[id]/page.tsx   # 统一详情页（访谈+评论+评分）
│   │   ├── knowledge/page.tsx       # AI 知识库问答
│   │   ├── dashboard/page.tsx       # 管理者看板
│   │   └── settings/page.tsx        # 集成配置
│   ├── lib/
│   │   ├── db.ts                    # SQLite 数据库层
│   │   ├── export.ts                # 文档导出
│   │   └── questions.ts             # 角色模板
│   └── app/
│       ├── layout.tsx               # 根布局
│       └── globals.css              # 全局样式
├── V2-SPEC.md                       # v2 完整功能规格
├── package.json
└── next.config.ts
```

### 🤝 相关项目

- **[Warm Handover Skill](https://github.com/zgjq/warm-handover)** — OpenClaw Skill + CLI 版本
- **[Anti Colleague-Skill](https://github.com/zgjq/anti-colleague-skill)** — 拆解 colleague-skill 概念缺陷

### 💡 哲学

> colleague-skill 的核心假设是：一个人的价值 = 他的聊天记录。这是对人最大的不尊重。

Warm Handover 不制造 AI 替身。它帮助一个人**好好告别**，帮助另一个人**好好开始**。

这才是真正的"赛博永生"——不是复制一个僵尸，而是让经验活下来。

---

## English

### What Is This?

A complete web application for conducting dignified, structured knowledge handovers when team members leave.

While [colleague-skill](https://github.com/titanwings/colleague-skill) scrapes chat logs to create AI clones, **Warm Handover takes the human approach**: guided interviews → structured documents → living knowledge base.

### Features

| Module | Route | Description |
|--------|-------|-------------|
| 🏠 Landing | `/` | Philosophy, workflow overview |
| ➕ Create | `/new` | Enter names, choose role template |
| 🎙️ Interview | `/interview` | Role-based guided Q&A |
| 📄 Export | `/output` | Auto-generate 4 Markdown files |
| 📅 Timeline | `/timeline` | T-30 to T-0 checklist |
| 📋 List | `/list` | View all handovers |
| 📖 Detail | `/handover/[id]` | Unified view (interview + comments + scores) |
| 🧠 Knowledge | `/knowledge` | Searchable, conversational AI knowledge base |
| 📊 Dashboard | `/dashboard` | Manager overview (scores + progress) |
| ⚙️ Settings | `/settings` | Integration config (webhooks, Feishu, DingTalk) |

### Quick Start

```bash
git clone https://github.com/zgjq/warm-handover-web.git
cd warm-handover-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Tech Stack

- **Next.js 16** — App Router
- **TypeScript 5** — Type safety
- **TailwindCSS 3** — Warm orange/amber design
- **SQLite** — Knowledge base, comments, scores, audit log
- **node-cron** — Scheduled reminders
- **nodemailer** — Email notifications
- **WebSocket** — Real-time notifications

### Why Not Colleague-Skill?

colleague-skill's core assumption is that a person's value equals their chat logs. This is fundamentally flawed:

1. **Chat logs are not knowledge** — The most valuable tacit knowledge is never written down
2. **AI clones are an illusion** — The ELIZA effect mimics surface patterns, not actual understanding
3. **Legal risks** — Scraping colleague messages without consent may violate privacy laws

Warm Handover offers a better path: structured, voluntary, and respectful knowledge transfer.

### Philosophy

> A person's value lies in the decisions they made, the thinking behind them, and the tacit understanding they built — not in scraped chat fragments.

Warm Handover doesn't create AI clones. It helps one person **say goodbye well**, and helps another **start well**.

## License

MIT
