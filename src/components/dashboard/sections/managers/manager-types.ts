export type SortKey = 'name' | 'phase' | 'runtime';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: '按名称' },
  { value: 'phase', label: '按阶段' },
  { value: 'runtime', label: '按运行时' },
];
