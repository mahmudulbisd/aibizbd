import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function TableContainer({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel">
      <Table>{children}</Table>
    </div>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return <table className="w-full text-left text-xs">{children}</table>;
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-line bg-white/[0.02] text-[11px] uppercase tracking-wider text-faint">
      {children}
    </thead>
  );
}

export function TH({ className = "", children, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-4 py-3 text-left font-semibold ${className}`} {...rest}>
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-line font-medium text-ink">{children}</tbody>;
}

export function TR({ children, onClick, className = "" }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr onClick={onClick} className={`transition hover:bg-white/[0.02] ${className}`}>
      {children}
    </tr>
  );
}

export function TD({ className = "", children, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-3.5 align-middle ${className}`} {...rest}>
      {children}
    </td>
  );
}

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-faint">
        {message}
      </td>
    </tr>
  );
}
