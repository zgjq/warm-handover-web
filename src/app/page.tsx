export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-6">🤝</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            将冰冷的离别<br />化为温暖的交接
          </h1>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            真正的温暖不是模仿死人，而是让活人好好交接。<br />
            让一个人好好告别，让另一个人好好开始。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/new"
              className="px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg"
            >
              开始交接 →
            </a>
            <a
              href="#vs"
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl font-bold text-lg hover:bg-white/30 transition-colors"
            >
              为什么比我们好？
            </a>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">同事离职，知识随之而去？</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              每次有人离开，团队就失去一部分"只有他知道"的知识。<br />
              传统的交接只是走过场——三页文档，概括三年的积累。
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: '📋', title: '没有结构化', desc: '聊天记录和文档是噪音，不是知识。最宝贵的 tacit knowledge 永远不会出现在聊天里。' },
              { emoji: '🤖', title: 'AI 替身是幻觉', desc: '把一个人变成 AI 克隆？那是对人的不尊重。ELIZA 效应不等于真正的知识传承。' },
              { emoji: '⏰', title: '交接是流程，不是工具', desc: 'T-30 到 T+90 的完整流程，不是一次性生成两个文件就结束。' },
            ].map(item => (
              <div key={item.title} className="p-6 bg-orange-50 rounded-2xl">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-12">三步完成有尊严的交接</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: '引导式访谈', desc: '按角色定制的交互式问卷，引导离职者系统地回顾和分享关键知识。不是爬数据，是真正有尊严的对话。', emoji: '🎯' },
              { step: '02', title: '结构化输出', desc: '自动生成 PROJECT、PEOPLE、LESSONS、TODO 四个交接文件。结构清晰，接手者一看就懂。', emoji: '📄' },
              { step: '03', title: '活文档持续更新', desc: '交接不是终点。接手者每遇到新问题就更新文档，让个人经验变成团队知识。', emoji: '🔄' },
            ].map(item => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-black text-orange-100 absolute -top-4 -left-2">{item.step}</div>
                <div className="relative bg-white rounded-2xl shadow-lg p-6 pt-10">
                  <div className="text-3xl mb-3">{item.emoji}</div>
                  <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VS Colleague-Skill */}
      <section id="vs" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">为什么比 Colleague-Skill 更好？</h2>
          <p className="text-gray-500 text-center mb-12">不是批评，是事实对比</p>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-gray-500 font-medium"></th>
                  <th className="px-4 py-3 text-center text-red-500 font-medium">❌ Colleague-Skill</th>
                  <th className="px-4 py-3 text-center text-green-600 font-medium">✅ Warm Handover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['数据来源', '爬聊天记录\n（被动、冰冷）', '引导式访谈\n（主动、温暖）'],
                  ['知识质量', '噪音为主\n（缺乏上下文）', '结构化知识\n（经过思考）'],
                  ['输出形式', 'AI 替身\n（ELIZA 效应）', '交接文档\n（实用、可追溯）'],
                  ['持续性', '静态快照\n（过时即废）', '活文档\n（持续更新）'],
                  ['用户体验', 'CLI only\n（门槛高）', 'Web UI + CLI\n（开箱即用）'],
                  ['交接流程', '无\n（只管生成）', 'T-30 到 T+90\n（完整时间线）'],
                  ['法律合规', '零提示\n（爬数据风险）', '完全合规\n（主动授权）'],
                  ['人的尊严', '把人变成数据\n（冰冷）', '尊重人的经验\n（温暖）'],
                ].map(([label, cold, warm], i) => (
                  <tr key={i} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{label}</td>
                    <td className="px-4 py-3 text-center text-red-600 whitespace-pre-line">{cold}</td>
                    <td className="px-4 py-3 text-center text-green-700 font-medium whitespace-pre-line">{warm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-4xl mb-6">💡</div>
          <blockquote className="text-xl text-gray-700 italic leading-relaxed mb-6">
            "colleague-skill 的核心假设是：一个人的价值 = 他的聊天记录。<br />
            这是对人最大的不尊重。<br /><br />
            一个人的价值在于他做过的决定和背后的思考过程，<br />
            在于他积累的对团队和业务的隐性理解，<br />
            在于他愿意主动分享的经验，而不是被爬出来的碎片。"
          </blockquote>
          <div className="text-sm text-gray-500">— Warm Handover 哲学</div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-amber-500 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">开始一次有尊严的交接</h2>
          <p className="text-orange-100 mb-8">不是复制一个僵尸，而是让经验活下来。</p>
          <a
            href="/new"
            className="inline-block px-10 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg"
          >
            创建交接 →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400 text-center text-sm">
        <p>Warm Handover — 让经验活下来</p>
        <p className="mt-1">
          <a href="https://github.com/zgjq/warm-handover" className="text-orange-400 hover:text-orange-300">
            GitHub
          </a>
          {' '}· 开源项目 · 欢迎 Star
        </p>
      </footer>
    </div>
  );
}
