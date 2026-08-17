'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  category,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
      <div>
        {category && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
            {category}
          </p>
        )}
        <h1 className="text-lg font-bold text-slate-100 font-sans tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center space-x-3">{actions}</div>}
    </div>
  );
};
