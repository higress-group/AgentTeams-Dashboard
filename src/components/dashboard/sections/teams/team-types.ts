export type SortKey = 'name' | 'phase' | 'readiness';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: '按名称' },
  { value: 'phase', label: '按阶段' },
  { value: 'readiness', label: '按就绪度' },
];

export const ITEMS_PER_PAGE = 12;
