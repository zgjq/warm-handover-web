'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { useTheme } from '@/context/ThemeContext';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { theme, toggle } = useTheme();

  const [handover, setHandover] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    DataService.get(Number(id))
      .then(data => setHandover(data))
      .catch(() => {});
    fetch(`/api/integrations?handoverId=${id}`)
      .then(r => r.json())
      .then(data => setIntegrations(data || {}))
      .catch(() => {});
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handoverId: Number(id), ...integrations }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      console.error('[Settings] Save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const testWebhook = async (url: string, name: string) => {
    if (!url) return;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msg_type: 'text',
          content: { text: `🤝 Warm Handover 测试通知\n项目: ${handover?.projectName}\n状态: 集成测试成功` },
        }),
      });
      alert(`${name} 测试消息已发送`);
    } catch {
      alert(`${name} 测试失败，请检查 URL`);
    }
  };

  if (!handover) return <div className="min-h-screen flex items-center justify-center dark:bg-stone-950 dark:text-stone-300">加载中...</div>;

  const fields = [
    { key: 'feishu_webhook', label: '飞书 Webhook', icon: '🟢', placeholder: 'https://open.feishu.cn/open-apis/bot/v2/hook/...' },
    { key: 'dingtalk_webhook', label: '钉钉 Webhook', icon: '🔵', placeholder: 'https://oapi.dingtalk.com/robot/send?access_token=...' },
    { key: 'slack_webhook', label: 'Slack Webhook', icon: '🟣', placeholder: 'https://hooks.slack.com/services/...' },
    { key: 'email_to', label: '通知邮箱', icon: '📧', placeholder: 'manager@company.com' },
    { key: 'confluence_url', label: 'Confluence 空间 URL', icon: '📝', placeholder: 'https://company.atlassian.net/wiki/spaces/...' },
    { key: 'jira_url', label: 'Jira 项目 URL', icon: '🎯', placeholder: 'https://company.atlassian.net/browse/...' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-stone-100 mb-2">⚙️ 集成设置</h1>
            <p className="text-gray-500 dark:text-stone-400">{handover.personName} → {handover.successorName} · {handover.projectName}</p>
          </div>
          <button
            onClick={toggle}
            className="p-2.5 bg-white dark:bg-stone-800 rounded-xl shadow-md border border-gray-200 dark:border-stone-700 hover:scale-110 transition-all"
            aria-label="切换主题"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-8 space-y-6">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">
                {f.icon} {f.label}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={integrations[f.key] || ''}
                  onChange={e => setIntegrations({ ...integrations, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
                />
                {(f.key.includes('webhook') && integrations[f.key]) && (
                  <button
                    onClick={() => testWebhook(integrations[f.key], f.label)}
                    className="px-4 py-3 bg-gray-100 dark:bg-stone-800 text-gray-600 dark:text-stone-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-stone-700 transition-colors whitespace-nowrap"
                  >
                    测试
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : saved ? '✅ 已保存' : '保存设置'}
            </button>
            <button
              onClick={() => router.push(`/handover/${id}`)}
              className="px-6 py-3 bg-gray-100 dark:bg-stone-800 text-gray-700 dark:text-stone-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-stone-700 transition-colors"
            >
              返回
            </button>
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 text-sm text-orange-800 dark:text-orange-300">
          <h3 className="font-semibold mb-2">💡 如何获取 Webhook URL？</h3>
          <ul className="space-y-1 text-orange-700 dark:text-orange-400">
            <li><strong>飞书</strong>：群设置 → 群机器人 → 自定义机器人 → 复制 Webhook 地址</li>
            <li><strong>钉钉</strong>：群设置 → 智能群助手 → 添加机器人 → 自定义 → 复制 Webhook 地址</li>
            <li><strong>Slack</strong>：App 设置 → Incoming Webhooks → 添加 → 复制 Webhook URL</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
