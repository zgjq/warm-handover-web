/**
 * Pre-built handover templates for common scenarios
 */

export interface Template {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  emoji: string;
  questions: { category: string; label: string; text: string; placeholder?: string }[];
}

export const templates: Template[] = [
  {
    id: 'tech-handover',
    name: '技术交接',
    nameEn: 'Technical Handover',
    description: '适用于开发、运维、DBA 等技术岗位',
    emoji: '💻',
    questions: [
      { category: 'PROJECT.md', label: '系统架构', text: '请画出或描述你负责的系统架构和依赖关系', placeholder: '服务A → 服务B → 数据库C...' },
      { category: 'PROJECT.md', label: '部署流程', text: '从代码到上线的完整步骤是什么？', placeholder: '1. 合并到 main 2. CI 自动构建 3. ...' },
      { category: 'PROJECT.md', label: '监控告警', text: '哪些指标最重要？告警阈值是多少？', placeholder: 'CPU > 80% 告警，QPS < 100 告警...' },
      { category: 'PROJECT.md', label: '已知技术债', text: '有哪些已知的技术债或待重构的代码？', placeholder: 'utils/auth.js 里的鉴权逻辑需要重写...' },
      { category: 'PEOPLE.md', label: '技术支持', text: '遇到技术问题应该找谁？', placeholder: '数据库找老王，网络找运维小张...' },
      { category: 'LESSONS.md', label: '最大教训', text: '在这个项目中学到的最重要的技术教训是什么？', placeholder: '永远不要在主线程做同步 IO...' },
      { category: 'TODO.md', label: '待办技术任务', text: '有哪些待完成的技术任务？', placeholder: '升级 Node.js 版本、迁移到 TypeScript...' },
    ],
  },
  {
    id: 'product-handover',
    name: '产品交接',
    nameEn: 'Product Handover',
    description: '适用于产品经理、项目经理',
    emoji: '📋',
    questions: [
      { category: 'PROJECT.md', label: '产品愿景', text: '这个产品的核心价值和目标用户是什么？', placeholder: '为中小企业提供一站式...' },
      { category: 'PROJECT.md', label: '优先级规则', text: '需求优先级是如何确定的？', placeholder: 'P0: 影响营收 P1: 用户体验 P2: ...' },
      { category: 'PEOPLE.md', label: '关键干系人', text: '哪些 stakeholder 需要特别关注？', placeholder: '老板关注营收、运营关注效率...' },
      { category: 'LESSONS.md', label: '产品决策反思', text: '有哪些产品决策回头看是错的？', placeholder: '当初不应该做 XX 功能，因为...' },
      { category: 'TODO.md', label: '待推进事项', text: '有哪些待推进的需求或项目？', placeholder: 'Q2 要上线 XX 功能，PRD 已写...' },
    ],
  },
  {
    id: 'design-handover',
    name: '设计交接',
    nameEn: 'Design Handover',
    description: '适用于 UI/UX 设计师',
    emoji: '🎨',
    questions: [
      { category: 'PROJECT.md', label: '设计系统', text: '设计系统的核心原则和组件库在哪里？', placeholder: 'Figma 链接：... 核心原则：...' },
      { category: 'PROJECT.md', label: '设计规范', text: '有哪些设计规范是"不说不知道"的？', placeholder: '按钮最小点击区域 44px...' },
      { category: 'PEOPLE.md', label: '协作默契', text: '与前端/产品协作的默契和摩擦点？', placeholder: '前端习惯用 Tailwind，设计稿要标注 class...' },
      { category: 'LESSONS.md', label: '设计反思', text: '有哪些设计方案回头看不理想？', placeholder: '首页改版那次应该先做用户调研...' },
      { category: 'TODO.md', label: '待完成设计', text: '有哪些待完成的设计任务？', placeholder: 'XX 页面高保真还没出...' },
    ],
  },
  {
    id: 'management-handover',
    name: '管理交接',
    nameEn: 'Management Handover',
    description: '适用于团队负责人、项目经理',
    emoji: '👔',
    questions: [
      { category: 'PROJECT.md', label: '团队现状', text: '团队当前的状态和关键问题是什么？', placeholder: '3 个后端 2 个前端 1 个测试...' },
      { category: 'PROJECT.md', label: 'OKR/目标', text: '当前季度的 OKR 或核心目标是什么？', placeholder: 'O1: 提升系统稳定性 KR1: ...' },
      { category: 'PEOPLE.md', label: '团队人员', text: '团队成员的特点和需要注意的点？', placeholder: '小王技术强但不善沟通...' },
      { category: 'PEOPLE.md', label: '跨部门关系', text: '有哪些重要的跨部门关系需要维护？', placeholder: '和市场部的月度同步不能停...' },
      { category: 'LESSONS.md', label: '管理经验', text: '在管理这个团队中学到的最重要的事？', placeholder: '不要 micromanage，给空间...' },
      { category: 'TODO.md', label: '待处理事项', text: '有哪些待处理的管理事项？', placeholder: '下月绩效评估、XX 招聘...' },
    ],
  },
];

export function getTemplate(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}
