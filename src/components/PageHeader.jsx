import React from 'react';

export default function PageHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1">
        {Icon && (
          <div className="p-2 rounded-xl bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">{title}</h1>
      </div>
      {subtitle && <p className="text-muted-foreground text-sm ml-12">{subtitle}</p>}
    </div>
  );
}