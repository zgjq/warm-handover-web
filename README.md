# Warm Handover Web 🤝

> 将冰冷的离别化为温暖的交接。让一个人好好告别，让另一个人好好开始。

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**中文** | [English](#english)

## 这是什么？

一个完整的 **Web 应用**，帮助团队在同事离职时做**有尊严、有结构的知识交接**。

[colleague-skill](https://github.com/titanwings/colleague-skill) 说"将冰冷的离别化为温暖的 Skill"——然后爬聊天记录生成 AI 僵尸。

**Warm Handover 走另一条路**：引导式访谈 → 结构化文档 → 活知识库。不是模仿死人，是让活人好好交接。

## ✨ 功能

### 🎯 引导式访谈

- **按角色定制**：后端/前端/产品/设计/运维，每种角色有专属问题
- **交互式问卷**：一步一步引导，带进度条和完成度追踪
- **自动保存**：随时可以继续，不会丢失进度
- **跳过机制**：不想回答的问题可以直接跳过

### 📄 结构化输出

自动生成四个交接文档：

| 文件 | 内容 |
|------|------|
| `PROJECT.md` | 项目全景、架构、关键决策、隐藏知识、线上事故 |
| `PEOPLE.md` | 人脉地图、跨团队协作、不能踩的雷 |
| `LESSONS.md` | 经验教训、重来会怎么做、对下一任的话 |
| `TODO.md` | 待办清单、已知问题、时间敏感事项 |

- **预览**：生成后可直接预览
- **下载**：支持 ZIP 打包下载 + 单文件下载

### 📅 交接时间线

- 从 **T-30 天到 T-0 天**的完整交接清单
- 可视化进度追踪
- 可勾选的 checklist
- 每个阶段的关键任务一目了然

### 🏠 Landing Page

- 项目理念阐述
- 与 colleague-skill 的**正面功能对比表**
- 三步流程说明
- 哲学声明

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/zgjq/warm-handover-web.git
cd warm-handover-web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 开始使用。

## 📋 使用流程

### 1. 创建交接

- 填写离职人姓名、接手人姓名、项目名称
- 选择角色模板（后端/前端/产品/设计/运维）

### 2. 完成访谈

- 按引导一步步回答
- 可以跳过、可以回退、可以随时继续
- 进度条实时显示完成度

### 3. 生成文档

- 自动生成四个结构化 Markdown 文件
- 预览内容
- 下载 ZIP 或单文件

### 4. 跟踪交接

- 查看交接时间线
- 勾选已完成的任务
- 评估交接进度

## 🛠 技术栈

- **Next.js 16** — App Router, 静态生成
- **TypeScript** — 类型安全
- **TailwindCSS** — 温暖的橙/琥珀色设计语言
- **JSZip** — ZIP 文件生成
- **LocalStorage** — 客户端数据持久化

## 📂 项目结构

```
warm-handover-web/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── new/
│   │   │   └── page.tsx          # 创建交接
│   │   ├── interview/
│   │   │   └── page.tsx          # 引导式访谈
│   │   ├── output/
│   │   │   └── page.tsx          # 文档生成与下载
│   │   ├── timeline/
│   │   │   └── page.tsx          # 交接时间线
│   │   └── list/
│   │       └── page.tsx          # 交接列表
│   ├── lib/
│   │   ├── questions.ts          # 角色模板和访谈问题
│   │   ├── db.ts                 # 数据库层
│   │   └── export.ts             # 文档导出逻辑
│   └── app/
│       ├── layout.tsx            # 根布局
│       └── globals.css           # 全局样式
├── package.json
└── next.config.ts
```

## 🎨 设计理念

### 温暖的视觉语言

- **橙/琥珀色渐变** — 温暖、有人情味
- **圆角卡片** — 柔和、不冰冷
- **柔和阴影** — 层次感但不压迫
- **自定义滚动条和选区颜色** — 细节处处体现温度

### 与 Colleague-Skill 的对比

| 维度 | Colleague-Skill | Warm Handover Web |
|------|----------------|-------------------|
| 数据来源 | 爬聊天记录（被动、冰冷） | 引导式访谈（主动、温暖） |
| 知识质量 | 噪音为主，缺乏上下文 | 结构化、经过思考 |
| 输出 | AI 替身（ELIZA 效应） | 交接文档（实用、可追溯） |
| 持续性 | 静态快照，过时即废 | 活文档，持续更新 |
| 用户体验 | CLI only | Web UI（开箱即用） |
| 交接流程 | 无 | T-30 到 T+90 完整时间线 |
| 法律合规 | 零提示 | 完全合规 |
| 人的尊严 | 把人变成数据 | 尊重人的经验和判断 |

## 🤝 相关项目

三件套完整生态：

- **[Warm Handover Skill](https://github.com/zgjq/warm-handover)** — OpenClaw Skill + CLI 版本
- **[Anti Colleague-Skill](https://github.com/zgjq/anti-colleague-skill)** — 拆解 colleague-skill 概念缺陷的 Skill

## 💡 哲学

> colleague-skill 的核心假设是：一个人的价值 = 他的聊天记录。
> 这是对人最大的不尊重。

Warm Handover 不制造 AI 替身。它帮助一个人**好好告别**，帮助另一个人**好好开始**。

这才是真正的"赛博永生"——不是复制一个僵尸，而是让经验活下来。

## License

MIT

---

## English

### What Is This?

A complete **web application** for conducting dignified, structured knowledge handovers when team members leave.

While [colleague-skill](https://github.com/titanwings/colleague-skill) scrapes chat logs to create AI clones, **Warm Handover takes the human approach**: guided interviews → structured documents → living knowledge base.

### Quick Start

```bash
git clone https://github.com/zgjq/warm-handover-web.git
cd warm-handover-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

### Features

- **Role-based interview templates** — Backend, Frontend, PM, Designer, DevOps
- **Interactive step-by-step questionnaire** — with progress tracking
- **Auto-generated handover documents** — PROJECT.md, PEOPLE.md, LESSONS.md, TODO.md
- **ZIP download** — Bundle all documents for easy sharing
- **Handover timeline** — T-30 to T-0 day checklist with progress tracking
- **Warm, human design** — Orange/amber color palette, rounded corners, soft shadows

### Why Not Colleague-Skill?

colleague-skill's core assumption is that a person's value equals their chat logs. This is fundamentally flawed:

1. **Chat logs are not knowledge** — The most valuable tacit knowledge is never written down
2. **AI clones are an illusion** — The ELIZA effect mimics surface patterns, not actual understanding
3. **Legal risks** — Scraping colleague messages without consent may violate privacy laws

Warm Handover offers a better path: structured, voluntary, and respectful knowledge transfer.

### Philosophy

> A person's value lies in the decisions they made, the thinking behind them, and the tacit understanding they built — not in scraped chat fragments.

Warm Handover doesn't create AI clones. It helps one person **say goodbye well**, and helps another **start well**.
