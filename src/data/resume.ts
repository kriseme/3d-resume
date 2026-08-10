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
  internships: TimelineItem[];
  activities: TimelineItem[];
  skills: string[];
  honors: HonorItem[];
}

export const resume: ResumeData = {
  nameEn: 'YINA CHANG',
  nameZh: '畅艺娜',
  role: '电气工程硕士 · 配电网电弧故障检测',
  tagline: '专注配电网故障检测与电力设备在线监测',
  summary:
    '电气工程硕士，专业排名 1/30（GPA 3.82）；熟悉需求分析、方案设计、原理图/PCB 设计、样机测试到现场验证的完整研发流程；参与多项国网科技项目并驻地实践，现于广东电网梅州供电局见习；持有实用型专利 1 项、软件著作权 3 项。',
  contact: {
    email: '1427501562@qq.com',
    phone: '17850860261',
    location: '山西临汾',
    github: '',
  },
  education: [
    {
      period: '2024.09 — 2026.06',
      title: '中国农业大学',
      subtitle: '电气工程 · 硕士',
      description:
        '专业排名 1/30（GPA 3.82）；研究方向：配电网电弧故障检测与电力设备在线监测。主修课程：应用数理统计（92）、高等电路与电网络分析（90）、电力系统市场化运营（89）、现代电力系统分析（88）。',
    },
    {
      period: '2018.09 — 2022.06',
      title: '福建师范大学',
      subtitle: '通信工程 · 学士',
      description:
        '主修课程：电路原理、数字电路与逻辑设计、单片机原理与应用、嵌入式系统、C 语言程序设计、电力电子技术等。',
    },
  ],
  projects: [
    {
      name: '低压配电网状态精准感知与故障快速自愈技术研究及应用',
      period: '2024.09 — 2026.06',
      role: '国网北京电科院项目',
      description:
        '研究低压配网智能化改造中的边缘计算与数据感知技术，构建"云-边-端"三级感知模型，提升台区自愈能力；负责数据采集模块设计和开发、数据分析及处理。',
    },
    {
      name: '农业中关村园区综合能源与多能互补技术研究与示范',
      period: '2024.09 — 2026.06',
      role: '国网北京电力公司项目',
      description:
        '研究基于"设施—分布电源—储能—电网"四维架构的数据采集、数据查询与运行子系统及协同运行实时分析的农业能源管控系统；负责开发功能区协同运行的监测控制模块。',
    },
    {
      name: '配电网电弧故障在线探测装置研发',
      period: '2025.02 — 2026.06',
      role: '研究生课题 · 独立完成',
      description:
        '独立设计双层五阶 Hilbert 分形天线，使用 HFSS 完成建模与仿真，优化天线增益至 2.1dBi，并完成 PCB 打样与阻抗匹配调试；主导设计基于多级比较器和 STM32 的故障信号检测电路，独立完成原理图设计、PCB layout 及调试，实现电弧强度 4 级指示与计数功能，经模拟测试误报率低于 5%。',
    },
  ],
  internships: [
    {
      period: '2025.02 — 2025.09',
      title: '国网平谷供电公司（科技小院）',
      subtitle: '科技小院院长',
      description:
        '作为学生团队负责人，对接甲方（国网）与校方，按期交付 6 份测试报告，发现并解决现场蓝牙 Mesh 通信干扰问题；参与农业电气化方案推广，协助完成 20 套温湿度远程监控系统的现场安装与运维培训。',
    },
    {
      period: '2026.07 — 至今',
      title: '广东电网有限责任公司梅州供电局',
      subtitle: '见习生',
      description: '参与供电局日常业务学习与现场实践。',
    },
  ],
  activities: [
    {
      period: '2025.02 — 2025.06',
      title: '中国农业大学信息与电气工程学院',
      subtitle: '实验教学助教',
      description: '优化教学方案并进行实验指导。',
    },
    {
      period: '2019.09 — 2020.09',
      title: '福建师范大学院学生会',
      subtitle: '主席',
      description: '负责学生会整体运行与部门协作。',
    },
    {
      period: '2018.09 — 2019.09',
      title: '福建师范大学通信工程 2 班',
      subtitle: '团支书',
      description: '负责团支部工作，策划团日活动。',
    },
  ],
  skills: [
    '嘉立创 EDA（原理图 / PCB / 多层板）',
    'Multisim 电路仿真',
    'HFSS 天线仿真',
    'STM32 / Keil / PyCharm',
    'C / Python',
    '传感器、比较器与串口调试',
    'CET-6',
    '全国计算机二级',
    'Office',
    'SolidWorks 基础',
  ],
  honors: [
    {
      name: '第五届全国大学生等离子体科技创新竞赛 全国二等奖（国家级 A 类赛事）',
      year: '2025',
      issuer: '全国大学生等离子体科技创新竞赛',
    },
    { name: '华北赛区二等奖', year: '2025' },
    { name: '硕士学业一等奖学金', year: '2025-2026', issuer: '中国农业大学' },
    {
      name: '福建师范大学第十届大学生创意竞赛一等奖、"优秀学生干部"、学业二等奖学金',
      year: '2020-2021',
    },
    { name: '实用型新兴专利 1 项、软件著作权 3 项', year: '2025' },
  ],
};
