import { Link } from 'react-router-dom';import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-sm text-[#555555]">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1">
          {index > 0 ? <ChevronRight className="h-3.5 w-3.5" /> : null}
          {item.href ? (
            <Link to={item.href} className="hover:text-[#1A1A2E]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#1A1A2E]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {breadcrumbs ? <Breadcrumb items={breadcrumbs} /> : null}
        <h1 className="text-2xl font-bold text-[#1A1A2E]">{title}</h1>
        {description ? <p className="mt-1 text-sm text-[#555555]">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
