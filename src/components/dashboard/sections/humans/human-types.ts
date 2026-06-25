export type SortKey = 'name' | 'phase';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: '按名称' },
  { value: 'phase', label: '按阶段' },
];

export const PERMISSION_LEVELS = [1, 2, 3] as const;
export type PermissionLevel = (typeof PERMISSION_LEVELS)[number];

export const PERMISSION_LABELS: Record<number, string> = {
  1: '观察者',
  2: '操作者',
  3: '管理员',
};

export const PERMISSION_BADGE_CLASSES: Record<number, string> = {
  1: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  2: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  3: 'bg-red-500/10 text-red-600 dark:text-red-400',
};
