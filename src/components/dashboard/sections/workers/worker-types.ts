export type SortKey = 'name' | 'phase' | 'runtime' | 'team';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: '按名称' },
  { value: 'phase', label: '按阶段' },
  { value: 'runtime', label: '按运行时' },
  { value: 'team', label: '按团队' },
];

export const ITEMS_PER_PAGE = 12;
