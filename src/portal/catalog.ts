import { HUIGUANG_WEB_URL, LINGGUANG_WEB_URL, POINTS_WEB_URL, YINGGUANG_WEB_URL } from '../config/productUrls.ts';

export type PortalProductId = 'huiguang' | 'yingguang' | 'lingguang' | 'points';

export interface PortalRoleDefinition {
  id: string;
  label: string;
  description: string;
  risk: 'standard' | 'elevated';
}

export interface PortalProductDefinition {
  id: PortalProductId;
  name: string;
  englishName: string;
  category: string;
  description: string;
  href: string;
  tone: PortalProductId;
  readiness: {
    stage: string;
    signal: string;
    evidence: string[];
    gaps: string[];
    gates: {
      label: string;
      status: 'verified' | 'pending' | 'blocked';
      detail: string;
    }[];
    nextMilestone: string;
  };
  roles: PortalRoleDefinition[];
  basicAccess?: string;
}

export const PORTAL_PRODUCTS: PortalProductDefinition[] = [
  {
    id: 'huiguang',
    name: '绘光',
    englishName: 'HUIGUANG',
    category: 'AI 图片创作',
    description: '图像生成、创作任务与资产管理',
    href: HUIGUANG_WEB_URL,
    tone: 'huiguang',
    readiness: {
      stage: '创作闭环预备',
      signal: '本地身份、任务恢复和资产治理已具备；新任务默认受控关闭。',
      evidence: ['Gateway 签名身份适配', 'Fake Points 与 Mock Provider', '管理员任务补偿视图'],
      gaps: ['真实 Provider 与对象存储', '多实例队列锁与灰度 allowlist', '图片生成全链路 staging'],
      gates: [
        { label: '本地 demo', status: 'verified', detail: '身份适配、Mock Provider 和补偿视图已有证据' },
        { label: '生产任务开关', status: 'blocked', detail: '暂停目录，未授权前不启动新任务开发' },
        { label: '真实产物', status: 'pending', detail: '等待 Provider、对象存储和成本门禁' },
      ],
      nextMilestone: '完成真实 Provider/存储门禁后，只向灰度创作者开放受控任务创建。',
    },
    roles: [
      { id: 'huiguang:user', label: '使用用户', description: '进入绘光并使用基础创作能力', risk: 'standard' },
      { id: 'huiguang:gray-creator', label: '灰度创作者', description: '使用受控开放的任务创建能力', risk: 'elevated' },
      { id: 'huiguang:ops-admin', label: '绘光管理员', description: '管理模型、任务补偿与资产治理', risk: 'elevated' },
    ],
  },
  {
    id: 'yingguang',
    name: '映光',
    englishName: 'YINGGUANG',
    category: 'AI 视频创作',
    description: '视频任务、成片资产与运营恢复',
    href: YINGGUANG_WEB_URL,
    tone: 'yingguang',
    readiness: {
      stage: '视频链路预备',
      signal: 'PostgreSQL worker、任务租约和受控 mock 视频文件链路已成型。',
      evidence: ['Worker claim/lease 与恢复', '结构化 staging smoke', 'Mock Provider 写入真实本地视频文件'],
      gaps: ['PG16 最终门禁', '真实 Auth/Points/Provider', '只读文件系统与 digest promotion'],
      gates: [
        { label: '任务 worker', status: 'verified', detail: 'claim/lease、恢复和 mock 视频文件链路已有证据' },
        { label: '运行时冻结', status: 'pending', detail: 'PG16、只读文件系统和镜像 digest 仍待冻结' },
        { label: '真实链路', status: 'blocked', detail: '暂停目录，未授权前不接入真实 Provider' },
      ],
      nextMilestone: '冻结运行时配置和发布候选，完成视频任务创建到资产回执的 staging smoke。',
    },
    roles: [
      { id: 'yingguang:user', label: '创作者', description: '创建视频任务并管理本人资产', risk: 'standard' },
      { id: 'yingguang:ops-admin', label: '映光管理员', description: '任务审计、补偿和资产治理', risk: 'elevated' },
    ],
  },
  {
    id: 'lingguang',
    name: '灵光',
    englishName: 'LINGGUANG',
    category: 'Skills 应用市场',
    description: '发现、安装、发布与审核 Skills',
    href: LINGGUANG_WEB_URL,
    tone: 'lingguang',
    readiness: {
      stage: '市场闭环内测',
      signal: '目录、发布、审核、治理和安装 operation/outbox/receipt 可见性已有产品化骨架；治理台可复制脱敏操作证据。',
      evidence: ['参考 HTML 路由适配', '四角色 RBAC 与租户隔离', 'installation operation/outbox migration', '安装回执与操作时间线', '安装操作脱敏证据复制'],
      gaps: ['可信绘光安装 adapter', '真实扫描/更新/回滚闭环', '真实 Gateway IAM E2E'],
      gates: [
        { label: '市场发现', status: 'verified', detail: '参考路由、目录聚合和角色导航已接入 API' },
        { label: '安装回执', status: 'verified', detail: 'operation history、outbox 状态、receipt 序号和 trace 可见' },
        { label: '脱敏证据', status: 'verified', detail: '治理台复制 operation evidence，明确排除 packageUrl、signature、token、secret 和 raw payload' },
        { label: '真实适配器', status: 'pending', detail: '仍需签名 callback、扫描隔离和真实绘光 adapter' },
      ],
      nextMilestone: '打通真实 adapter 签名 callback、版本更新/回滚和失败恢复的一条可信闭环。',
    },
    roles: [
      { id: 'lingguang:consumer', label: '使用用户', description: '浏览并在授权租户中安装 Skills', risk: 'standard' },
      { id: 'lingguang:developer', label: '开发者', description: '校验、提交并维护 Skill 版本', risk: 'standard' },
      { id: 'lingguang:reviewer', label: '审核员', description: '处理版本审核队列和审核决定', risk: 'elevated' },
      { id: 'lingguang:platform-admin', label: '灵光管理员', description: '跨租户治理、撤销与审计', risk: 'elevated' },
    ],
  },
  {
    id: 'points',
    name: '积分系统',
    englishName: 'POINTS',
    category: '积分能力中台',
    description: '个人积分、接入应用、账本与风控审计',
    href: POINTS_WEB_URL,
    tone: 'points',
    basicAccess: '拾光统一账号提供个人积分基础访问；以下角色只授予平台管理能力。',
    readiness: {
      stage: '内测可运营',
      signal: '个人账本、应用接入、活动、报表和互通治理已进入真实接口工作台；应用详情可导出脱敏联调验收单。',
      evidence: ['不可变账本与预占/结算/退款', 'Program 活动运营', '平台/应用/租户角色视图', '联调验收单脱敏 JSON', '/v1/points/consumptions 首笔扣减路径'],
      gaps: ['生产统一登录 E2E', '真实 Program/Activity 数据迁移', '跨系统对账与清算演练'],
      gates: [
        { label: '账本核心', status: 'verified', detail: '预占、结算、退款和不可变流水已有接口与 smoke 证据' },
        { label: '接入联调', status: 'verified', detail: '应用详情展示联调验收单、幂等键、业务引用、consumptions 扣减和对账路径' },
        { label: '密钥边界', status: 'verified', detail: '验收单只暴露 clientId，client secret 明确要求服务端环境变量保存' },
        { label: '生产登录', status: 'pending', detail: 'Portal/Auth/Gateway E2E 和真实数据迁移仍待收口' },
      ],
      nextMilestone: '先关闭 Portal/Auth/Gateway 登录闭环，再接一条真实活动事件到账本报表链路。',
    },
    roles: [
      { id: 'platform:points-auditor', label: '积分审计员', description: '全局只读查看账本、应用和审计', risk: 'elevated' },
      { id: 'platform:points-admin', label: '积分平台管理员', description: '积分平台全局读写与生产审批', risk: 'elevated' },
    ],
  },
];

export const MANAGEABLE_PRODUCT_ROLES = new Set(
  PORTAL_PRODUCTS.flatMap((product) => product.roles.map((role) => role.id)),
);

export function productRoles(product: PortalProductDefinition, roles: string[] | undefined) {
  const assigned = new Set(Array.isArray(roles) ? roles : []);
  return product.roles.filter((role) => assigned.has(role.id));
}

export function normalizeProductRoles(roles: string[]) {
  return [...new Set(roles.filter((role) => MANAGEABLE_PRODUCT_ROLES.has(role)))].sort();
}

export function productForRole(roleId: string) {
  return PORTAL_PRODUCTS.find((product) => product.roles.some((role) => role.id === roleId));
}
