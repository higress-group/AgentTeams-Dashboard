'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModernSectionHeaderProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function ModernSectionHeader({ title, eyebrow, description, actions, className }: ModernSectionHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn('flex items-end justify-between gap-3 mb-3', className)}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-semibold leading-tight text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
    </motion.header>
  );
}