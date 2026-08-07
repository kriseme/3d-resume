export interface TimelineItem {
  period: string;
  title: string;
  subtitle?: string;
  description: string;
}

export interface ProjectItem {
  name: string;
  period: string;
  role: string;
  description: string;
}

export interface HonorItem {
  name: string;
  year: string;
  issuer?: string;
}

export interface ResumeData {
  nameEn: string;
  nameZh: string;
  role: string;
  tagline: string;
  summary: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    github: string;
  };
  education: TimelineItem[];
  projects: ProjectItem[];
  skills: string[];
  honors: HonorItem[];
}

export const resume: ResumeData = {
  nameEn: 'ZHANG SAN',
  nameZh: '张三',
  role: '前端开发工程师',
  tagline: '用代码构建有温度的体验',
  summary:
    '三年以上前端开发经验，擅长 3D 可视化与交互动画，乐于把复杂数据变成直观、有温度的体验。',
  contact: {
    email: 'zhangsan@example.com',
    phone: '138-0000-0000',
    location: '中国 · 上海',
    github: 'github.com/zhangsan',
  },
  education: [
    {
      period: '2019.09 – 2023.06',
      title: '示例大学',
      subtitle: '计算机科学与技术 · 本科',
      description: '主修 Web 开发与计算机图形学，GPA 3.8 / 4.0，毕业设计获校级优秀。',
    },
  ],
  projects: [
    {
      name: '示例项目 · 3D 可视化平台',
      period: '2024.01 – 2024.06',
      role: '前端负责人',
      description: '基于 Three.js 与 React 搭建实时数据可视化大屏，负责渲染性能优化与交互动效设计。',
    },
    {
      name: '示例项目 · 简历生成器',
      period: '2023.08 – 2023.12',
      role: '独立开发',
      description: '输入数据即可生成个性化简历页面的工具，支持主题切换与一键打印。',
    },
  ],
  skills: [
    'TypeScript',
    'React',
    'Three.js',
    'WebGL',
    'Node.js',
    'Vite',
    'GSAP',
    'UI/UX 设计',
  ],
  honors: [
    { name: '校级一等奖学金', year: '2023', issuer: '示例大学' },
    { name: '前端开发优秀新人奖', year: '2024', issuer: '示例公司' },
  ],
};
