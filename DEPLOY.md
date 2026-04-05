# 部署指南

## 快速部署到 Vercel（推荐）

1. 打开 [vercel.com](https://vercel.com)
2. 点击 **New Project**
3. 导入 `zgjq/warm-handover-web` 仓库
4. 保持默认设置，点击 **Deploy**
5. 完成！你的应用将在 `https://warm-handover-web.vercel.app` 上线

### 环境变量（可选）

在 Vercel 项目设置中添加：

| 变量 | 说明 |
|------|------|
| `FEISHU_WEBHOOK_URL` | 飞书机器人 Webhook |
| `DINGTALK_WEBHOOK_URL` | 钉钉机器人 Webhook |
| `SLACK_WEBHOOK_URL` | Slack Webhook |
| `SMTP_HOST` | SMTP 服务器 |
| `SMTP_PORT` | SMTP 端口 |
| `SMTP_USER` | SMTP 用户名 |
| `SMTP_PASS` | SMTP 密码 |

## 自托管部署

### Docker

```bash
# 构建
docker build -t warm-handover-web .

# 运行
docker run -p 3000:3000 warm-handover-web
```

### 直接运行

```bash
git clone https://github.com/zgjq/warm-handover-web.git
cd warm-handover-web
npm install
npm run build
npm start
```

### PM2 守护进程

```bash
npm install -g pm2
pm2 start npm --name "warm-handover" -- start
pm2 save
pm2 startup
```

## 定时提醒

提醒调度器在 Next.js 服务器启动时自动运行，每小时检查一次交接里程碑。

如果需要手动触发：

```bash
curl http://localhost:3000/api/reminders/check
```

## 数据库备份

SQLite 数据库位于 `data/handover.db`，定期备份：

```bash
cp data/handover.db data/handover.db.bak
# 或使用 cron
0 2 * * * cp /path/to/data/handover.db /path/to/backups/handover-$(date +\%Y\%m\%d).db
```

## 更新

```bash
git pull
npm install
npm run build
pm2 restart warm-handover
```
