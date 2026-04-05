export interface Question {
  key: string;
  label: string;
  text: string;
  placeholder?: string;
}

export interface Category {
  file: string;
  icon: string;
  questions: Question[];
}

export interface ExtraQuestion {
  key: string;
  label: string;
  text: string;
  category: string;
}

export interface RoleTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  extraQuestions: ExtraQuestion[];
}

export const baseCategories: Category[] = [
  {
    file: 'PROJECT.md',
    icon: '📦',
    questions: [
      {
        key: 'core_modules',
        label: '核心模块',
        text: '你负责的核心模块是什么？可以简单描述一下架构和依赖关系吗？',
        placeholder: '例如：用户服务，依赖 Redis 缓存和 PostgreSQL，通过 gRPC 与订单服务通信...',
      },
      {
        key: 'key_decisions',
        label: '关键决策',
        text: '有哪些重要的技术决策？为什么当初这么选？',
        placeholder: '例如：选了 Kafka 而不是 RabbitMQ，因为团队更熟悉且吞吐量需求高...',
      },
      {
        key: 'hidden_knowledge',
        label: '隐藏知识',
        text: '有哪些 "只有你知道" 的 hack / workaround？',
        placeholder: '例如：定时任务有个硬编码路径 /tmp/xxx，因为当时测试没改回来...',
      },
      {
        key: 'code_warnings',
        label: '代码提醒',
        text: '有哪些代码你觉得自己写得不好，想提醒接手者注意？',
        placeholder: '例如：utils/date.js 里的时区处理有问题，建议用 dayjs 重写...',
      },
      {
        key: 'incidents',
        label: '线上事故',
        text: '有哪些没写进文档的线上事故或踩坑经验？',
        placeholder: '例如：去年双十一前缓存穿透导致 DB 挂了 20 分钟，后来加了布隆过滤器...',
      },
    ],
  },
  {
    file: 'PEOPLE.md',
    icon: '👥',
    questions: [
      {
        key: 'key_contacts',
        label: '关键联系人',
        text: '遇到以下几类问题应该找谁？\n• 技术问题\n• 产品/需求\n• 运维/部署\n• 其他',
        placeholder: '例如：数据库找老王，产品需求找小李，部署找运维小张...',
      },
      {
        key: 'cross_team',
        label: '跨团队协作',
        text: '有哪些跨团队的默契或潜在摩擦需要了解？',
        placeholder: '例如：前端团队习惯用 REST 而不是 GraphQL，跟他们对接要注意...',
      },
      {
        key: 'landmines',
        label: '不能踩的雷',
        text: '有哪些 "不能踩的雷" 是新人必须知道的？',
        placeholder: '例如：不要在周五下午发版，老板最讨厌周末被打扰...',
      },
    ],
  },
  {
    file: 'LESSONS.md',
    icon: '💡',
    questions: [
      {
        key: 'redo_differently',
        label: '重来会怎么做',
        text: '如果重新做一遍这个项目，你会怎么做 differently？',
        placeholder: '例如：一开始就会用 TypeScript，不会自己写鉴权模块...',
      },
      {
        key: 'biggest_lesson',
        label: '最重要的一课',
        text: '你在这个团队学到的最重要的一件事是什么？',
        placeholder: '例如：文档比代码重要。好代码没人看也能跑，好文档能让新人三天上手...',
      },
      {
        key: 'message_to_successor',
        label: '对下一任的话',
        text: '有什么你想对下一个接手的人说的？',
        placeholder: '自由发挥，任何想说的都可以...',
      },
    ],
  },
  {
    file: 'TODO.md',
    icon: '✅',
    questions: [
      {
        key: 'wanted_to_do',
        label: '想做没做的',
        text: '有哪些想做但没时间做的事？',
        placeholder: '例如：想把监控体系从 Prometheus 迁移到 Grafana Cloud...',
      },
      {
        key: 'known_issues',
        label: '已知问题',
        text: '有哪些已知但暂未修复的问题？',
        placeholder: '例如：用户列表页有个内存泄漏，排查了两次没找到 root cause...',
      },
      {
        key: 'time_sensitive',
        label: '时间敏感事项',
        text: '有哪些即将到期的 deadline / 续约 / 维护事项？',
        placeholder: '例如：SSL 证书 5 月到期，阿里云续费记得用公司账号...',
      },
    ],
  },
];

export const roleTemplates: RoleTemplate[] = [
  {
    id: 'backend',
    name: '后端工程师',
    nameEn: 'Backend Engineer',
    description: 'API、数据库、服务架构、部署运维',
    extraQuestions: [
      { key: 'db_schema', label: '数据库变更', text: '数据库 schema 有哪些非直观的变更历史？为什么要改？', category: 'PROJECT.md' },
      { key: 'api_versioning', label: 'API 版本管理', text: 'API 接口的版本管理策略是什么？有哪些已废弃但还没下线的？', category: 'PROJECT.md' },
      { key: 'cache_strategy', label: '缓存策略', text: '哪些数据可以缓存？哪些绝对不能？缓存失效策略是什么？', category: 'PROJECT.md' },
      { key: 'cron_jobs', label: '定时任务', text: '有哪些定时任务 / cron？各自的风险点？', category: 'PROJECT.md' },
      { key: 'deploy_flow', label: '发布流程', text: '从代码到上线的完整步骤？', category: 'PROJECT.md' },
      { key: 'monitoring', label: '监控告警', text: '哪些指标最重要？阈值是多少？', category: 'TODO.md' },
      { key: 'rollback', label: '回滚方案', text: '出问题了怎么快速回滚？', category: 'TODO.md' },
    ],
  },
  {
    id: 'frontend',
    name: '前端工程师',
    nameEn: 'Frontend Engineer',
    description: 'UI 组件、状态管理、构建部署、用户体验',
    extraQuestions: [
      { key: 'component_sharing', label: '组件复用', text: '哪些组件是团队共享的？组件库的使用规范是什么？', category: 'PROJECT.md' },
      { key: 'state_management', label: '状态管理', text: '为什么选这个状态管理方案？有哪些坑？', category: 'PROJECT.md' },
      { key: 'build_deploy', label: '构建部署', text: 'CI/CD 流程中前端相关的部分？', category: 'PROJECT.md' },
      { key: 'user_feedback', label: '用户反馈', text: '有哪些用户反馈集中但还没解决的问题？', category: 'TODO.md' },
      { key: 'design_system', label: '设计系统', text: '有哪些设计系统的约定是 "不说不知道" 的？', category: 'PEOPLE.md' },
    ],
  },
  {
    id: 'pm',
    name: '产品经理',
    nameEn: 'Product Manager',
    description: '需求管理、优先级、stakeholder 沟通、用户洞察',
    extraQuestions: [
      { key: 'prioritization', label: '需求优先级', text: '需求优先级是如何确定的？有哪些隐含规则？', category: 'PROJECT.md' },
      { key: 'boss_direction', label: '方向性指示', text: '有哪些 "老板说过但没写下来" 的方向性指示？', category: 'LESSONS.md' },
      { key: 'key_metrics', label: '核心指标', text: '用户画像和核心指标：哪些数据最值得关注？', category: 'PROJECT.md' },
      { key: 'stakeholders', label: '关键干系人', text: '哪些 stakeholder 需要特别关注？各自的关注点？', category: 'PEOPLE.md' },
      { key: 'cross_consensus', label: '跨部门共识', text: '有哪些跨部门的共识是 "大家都同意但没记录" 的？', category: 'PEOPLE.md' },
    ],
  },
  {
    id: 'designer',
    name: '设计师',
    nameEn: 'Designer',
    description: '设计系统、用户研究、设计交付、协作规范',
    extraQuestions: [
      { key: 'design_principles', label: '设计原则', text: '设计系统的核心原则和禁区是什么？', category: 'PROJECT.md' },
      { key: 'failed_attempts', label: '失败方案', text: '有哪些 "试过不行" 的方案？为什么？', category: 'LESSONS.md' },
      { key: 'user_research', label: '用户研究', text: '用户研究的发现有哪些没写进报告的？', category: 'LESSONS.md' },
      { key: 'handoff_specs', label: '交付规范', text: '设计稿的标注规范是什么？', category: 'PROJECT.md' },
      { key: 'dev_collab', label: '与开发协作', text: '与前端协作的默契和常见摩擦点？', category: 'PEOPLE.md' },
    ],
  },
  {
    id: 'devops',
    name: '运维 / SRE',
    nameEn: 'DevOps / SRE',
    description: '基础设施、监控告警、灾备、安全合规',
    extraQuestions: [
      { key: 'architecture', label: '架构关键路径', text: '架构图和关键路径是什么？单点故障在哪里？', category: 'PROJECT.md' },
      { key: 'capacity', label: '容量规划', text: '当前瓶颈在哪里？扩容方案是什么？', category: 'TODO.md' },
      { key: 'disaster_recovery', label: '灾备方案', text: '最坏情况怎么处理？RTO/RPO 是多少？', category: 'TODO.md' },
      { key: 'daily_checks', label: '日常巡检', text: '日常巡检清单是什么？', category: 'PROJECT.md' },
      { key: 'vendors', label: '供应商管理', text: '合同到期日、关键联系人有哪些？', category: 'PEOPLE.md' },
      { key: 'security_compliance', label: '安全合规', text: '有哪些必须遵守的安全和合规要求？', category: 'PROJECT.md' },
    ],
  },
];

export function getRoleTemplate(roleId: string): RoleTemplate | undefined {
  return roleTemplates.find(r => r.id === roleId);
}

export function getQuestionsForRole(roleId: string): Category[] {
  const template = getRoleTemplate(roleId);
  if (!template) return baseCategories;

  const categories = JSON.parse(JSON.stringify(baseCategories)) as Category[];

  for (const extra of template.extraQuestions) {
    const cat = categories.find(c => c.file === extra.category);
    if (cat) {
      cat.questions.push({
        key: extra.key,
        label: extra.label,
        text: extra.text,
      });
    }
  }

  return categories;
}
