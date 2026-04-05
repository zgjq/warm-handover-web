# Warm Handover Web v2 — 完整功能规格

## 现有功能（v1）
- ✅ Landing page
- ✅ 引导式访谈（按角色模板）
- ✅ 生成 4 个 Markdown 文件
- ✅ ZIP 下载
- ✅ 交接时间线（T-30 到 T-0 checklist）
- ✅ LocalStorage 持久化

## 新增功能（v2）

### 1. AI 知识库（可搜索、可对话）
**问题**：生成的文档放着没人看 = 白做
**解法**：把访谈结果变成可搜索的知识库

- 对每个交接项目生成**全文索引**
- 接手人可以**搜索**（关键词匹配 + 语义搜索）
- 接手人可以**提问**（AI 基于访谈结果回答，标注来源）
- 每次回答附带**引用来源**（"这个回答来自离职人关于 XX 的回答"）
- **不是克隆人**，是索引化的知识 — 明确标注"这是基于访谈记录的检索结果"

**技术实现**：
- SQLite FTS5 全文搜索
- 简单向量搜索（可选，先用关键词 + BM25）
- 聊天式 UI，类似问答但明确标注知识来源

### 2. 自动提醒系统
**问题**：交接流程靠人记 = 一定会忘
**解法**：自动推送 + 倒计时

- 用户设置离职日期后，自动计算 T-30/T-21/T-14/T-7/T-3/T-0
- 每个节点自动发送提醒（邮件 / 飞书 webhook / 钉钉 webhook）
- 逾期未完成任务标红
- 管理者可以看到所有交接的进度看板

**技术实现**：
- 节点.js cron 定时任务
- 可配置 webhook URL
- 邮件通知（nodemailer）

### 3. 团队协作
**问题**：交接不是一个人的事，需要离职人 + 接手人 + 管理者三方协作
**解法**：多角色视图 + 评论 + @提及

- **三种角色视图**：
  - 离职人：填写访谈、查看待办
  - 接手人：阅读文档、提问、更新进展
  - 管理者：查看所有交接进度、风险预警
- **评论系统**：每个访谈回答可以评论
- **@提及**：在评论中 @ 相关人员
- **变更日志**：每次编辑自动记录谁改了什么

**技术实现**：
- SQLite 新增 comments、mentions、audit_log 表
- WebSocket 实时通知（或轮询）
- 角色权限控制

### 4. 工具集成
**问题**：团队已经在用飞书/钉钉/Jira/Confluence，不想多开一个工具
**解法**：Webhook + API 集成

- **飞书机器人**：交接提醒推送到飞书群
- **钉钉机器人**：同上
- **Confluence 导出**：一键把交接文档推送到 Confluence 空间
- **Jira 集成**：自动创建交接相关的 Jira 任务
- **Slack 集成**：Slack webhook 通知

**技术实现**：
- 通用的 webhook 发送器
- 各平台的 adapter 模式
- 管理后台配置集成

### 5. 交接完成度评分
**问题**：管理者不知道交接质量如何
**解法**：量化评分 + 风险预警

- **评分维度**：
  - 访谈完成度（% 问题已回答）
  - 时间线进度（% checklist 已完成）
  - 文档质量（回答字数、是否有实质内容）
  - 接手人反馈（接手人评分 1-5）
  - 风险标记（有未回答的关键问题 = 高风险）
- **总评分**：0-100 分
- **管理者看板**：所有交接项目的评分和状态一览
- **风险预警**：评分低于 60 标红，低于 40 自动通知管理者

## 数据库变更

```sql
-- 知识库搜索
ALTER TABLE answers ADD COLUMN answer_quality INTEGER DEFAULT 0;

-- 评论系统
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  answer_id INTEGER,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL, -- 'departing' | 'successor' | 'manager'
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (answer_id) REFERENCES answers(id)
);

-- 提醒系统
CREATE TABLE reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handover_id INTEGER NOT NULL,
  phase TEXT NOT NULL,
  sent INTEGER DEFAULT 0,
  sent_at DATETIME,
  webhook_url TEXT,
  FOREIGN KEY (handover_id) REFERENCES handovers(id)
);

-- 评分
CREATE TABLE scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handover_id INTEGER NOT NULL UNIQUE,
  interview_completion INTEGER DEFAULT 0,
  timeline_progress INTEGER DEFAULT 0,
  document_quality INTEGER DEFAULT 0,
  successor_rating INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'low', -- 'low' | 'medium' | 'high' | 'critical'
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (handover_id) REFERENCES handovers(id)
);

-- 审计日志
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handover_id INTEGER,
  user_name TEXT,
  action TEXT NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 新页面

| 路由 | 功能 |
|------|------|
| `/knowledge?id=X` | AI 知识库问答（搜索 + 对话） |
| `/dashboard` | 管理者看板（所有交接项目评分 + 进度） |
| `/settings` | 集成配置（webhook、飞书/钉钉/Slack） |
| `/handover/X` | 交接详情页（整合访谈 + 时间线 + 评论） |

## 技术栈变更

- 新增：`node-cron`（定时任务）、`nodemailer`（邮件）、`ws`（WebSocket）
- 新增 API routes（Next.js App Router API）
- SQLite FTS5 全文搜索
