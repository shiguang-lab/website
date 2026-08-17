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
    href: 'https://huiguang.shiguanglab.com',
    tone: 'huiguang',
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
    href: 'https://yingguang.shiguanglab.com',
    tone: 'yingguang',
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
    href: 'https://lingguang.shiguanglab.com',
    tone: 'lingguang',
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
    href: 'https://points.shiguanglab.com',
    tone: 'points',
    basicAccess: '拾光统一账号提供个人积分基础访问；以下角色只授予平台管理能力。',
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
