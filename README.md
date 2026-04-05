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

### 🆚 为什么比 Colleague-Skill 更强？

| 维度 | Colleague-Skill | Warm Handover |
|------|----------------|---------------|
| 数据来源 | 爬聊天记录（被动、冰冷） | 引导式访谈（主动、温暖） |
| 知识质量 | 噪音为主，缺乏上下文 | 结构化、经过思考 |
| 输出形式 | AI 替身（ELIZA 效应） | 交接文档 + 知识库（实用、可追溯） |
| 持续性 | 静态快照，过时即废 | 活文档 + 评论 + 评分，持续更新 |
| 用户体验 | CLI only | 完整 Web 应用，开箱即用 |
| 交接流程 | 无 | T-30 到 T+90 完整时间线 |
| 团队协作 | 无 | 离职人 / 接手人 / 管理者三方协作 |
| 质量评估 | 无 | 综合评分 0-100 + 风险预警 |
| 法律合规 | 零提示 | 完全合规，主动授权 |
| 人的尊严 | 把人变成数据 | 尊重人的经验和判断 |

### 🔥 V2 核心亮点

> 不只是问答，而是完整的知识交接生态系统。

| 功能 | 解决了什么问题 |
|------|--------------|
| 🧠 **AI 知识库** | 文档放着没人看 = 白做。现在可以搜索、可以对话，每次回答标注来源 |
| 📊 **管理者看板** | 管理者不知道交接质量。现在 0-100 评分 + 风险预警一目了然 |
| 💬 **团队协作** | 交接不是一个人的事。离职人/接手人/管理者三方评论 + 变更日志 |
| ⚙️ **工具集成** | 不想多开一个工具。飞书/钉钉/Slack Webhook 直接推送提醒 |
| 📋 **统一详情页** | 功能分散不好找。Tab 式布局整合所有信息于一处 |

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

### Why Warm Handover > Colleague-Skill

| Dimension | Colleague-Skill | Warm Handover |
|-----------|----------------|---------------|
| Data Source | Scraped chat logs (passive, cold) | Guided interviews (active, warm) |
| Knowledge Quality | Noise, lacks context | Structured, thoughtful |
| Output | AI clone (ELIZA effect) | Documents + KB (practical, traceable) |
| Continuity | Static snapshot, decays | Living docs + comments + scoring |
| UX | CLI only | Full Web app, ready to use |
| Handover Process | None | T-30 to T+90 complete timeline |
| Collaboration | None | Three roles: departing / successor / manager |
| Quality Assessment | None | Score 0-100 + risk alerts |
| Legal Compliance | Zero mention | Fully compliant, opt-in |
| Human Dignity | Turns people into data | Respects experience and judgment |

### 🔥 V2 Highlights

> Not just Q&A — a complete knowledge handover ecosystem.

| Feature | Problem Solved |
|---------|---------------|
| 🧠 **AI Knowledge Base** | Documents no one reads = wasted. Now searchable + conversational with citations |
| 📊 **Manager Dashboard** | Managers can't see handover quality. Now 0-100 scoring + risk alerts at a glance |
| 💬 **Team Collaboration** | Handover isn't a one-person job. Three roles with comments + audit log |
| ⚙️ **Tool Integration** | Don't want another tool. Feishu/DingTalk/Slack webhooks push reminders directly |
| 📋 **Unified Detail Page** | Scattered features are hard to find. Tab layout brings everything together |

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
