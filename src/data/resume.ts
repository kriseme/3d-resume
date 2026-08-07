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
  nameEn: 'YINA CHANG',
  nameZh: '畅艺娜',
  role: '电气设计工程师',
  tagline: '专注配电网故障检测与电力设备在线监测',
  summary:
    '电气工程硕士在读，专业排名 1/30（GPA 3.82）；熟悉需求分析、方案设计、原理图/PCB 设计、样机测试到现场验证的完整研发流程；参与多项国网科技项目并驻场实习，持有实用新型专利 2 项、软件著作权 3 项。',
  contact: {
    email: '待补充',
    phone: '待补充',
    location: '中国',
    github: '待补充',
  },
  education: [
    {
      period: '2024.09 – 2026.06',
      title: '中国农业大学',
      subtitle: '电气工程 · 硕士',
      description:
        '专业排名 1/30（GPA 3.82）；研究方向：配电网电弧故障检测与电力设备在线监测。',
    },
    {
      period: '2018.09 – 2022.06',
      title: '福建师范大学',
      subtitle: '通信工程 · 学士',
      description:
        '主修电路原理、数字电路、单片机与嵌入式系统、C 语言程序设计、电力电子技术。',
    },
  ],
  projects: [
    {
      name: '配电网电弧故障在线探测装置研发',
      period: '2025.02 – 至今',
      role: '研究生课题 · 独立完成',
      description:
        '独立完成电气方案设计、原理图/PCB 设计与打样、阻抗匹配调试；基于 HFSS 优化天线增益至 2.1 dBi，开发 STM32 检测电路，误报率 < 5%。',
    },
    {
      name: '低压配电网状态精准感知与故障快速自愈技术研究及应用',
      period: '2024.09 – 至今',
      role: '国网北京电科院项目',
      description:
        '参与“云—边—端”三级感知模型建设，负责数据采集模块设计开发，并开发边缘计算节点与物联网云平台。',
    },
    {
      name: '国网平谷供电公司（科技小院）',
      period: '2025.02 – 2025.09',
      role: '电气工程实习生 · 学生团队负责人',
      description:
        '驻场对接甲方与校方，按期交付 6 份测试报告；解决现场蓝牙 Mesh 通信干扰问题，完成 3 套监控系统安装与运维培训。',
    },
  ],
  skills: [
    '电气设计',
    '原理图/PCB（Multisim）',
    '多层板与 EMC 整改',
    'AutoCAD',
    'HFSS',
    'STM32/Keil',
    'C / Python',
    '传感器采集与串口调试',
    '示波器/频谱仪调试',
    'Word/Excel/PPT/Visio',
    'CET-6',
    '计算机二级',
  ],
  honors: [
    {
      name: '全国大学生等离子体科技创新竞赛 全国二等奖（国家级 A 类）',
      year: '2025',
      issuer: '全国大学生等离子体科技创新竞赛',
    },
    { name: '硕士学业一等奖学金', year: '在读期间', issuer: '中国农业大学' },
    { name: '实用新型专利 2 项、软件著作权 3 项', year: '在读期间' },
    { name: '院学生会主席 / 硕士班班长 / 实验教学助教', year: '在读期间' },
  ],
};
