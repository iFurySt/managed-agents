import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Select from "@radix-ui/react-select";
import * as Tabs from "@radix-ui/react-tabs";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "icon";
  size?: "md" | "sm";
}) {
  const variants = {
    primary: "bg-ink text-white hover:bg-black",
    secondary: "border border-line bg-canvas text-ink hover:bg-fill",
    ghost: "text-ink hover:bg-fill",
    icon: "text-ink hover:bg-fill"
  };
  const sizes = {
    md: "h-8 px-3 text-sm",
    sm: "h-7 px-2 text-xs"
  };
  return (
    <button
      data-cds="Button"
      className={`cds-focus inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-medium opacity-100 transition-shadow disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${variant === "icon" ? "h-7 w-7 px-0" : sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: "neutral" | "green" | "blue" | "red"; className?: string }) {
  const tones = {
    neutral: "bg-fill text-muted",
    green: "bg-[#cdf0ce] text-[#13751f]",
    blue: "bg-[#d7e8ff] text-[#1b5eb8]",
    red: "bg-[#ffe0dc] text-[#a33a29]"
  };
  return (
    <span data-cds="Badge" className={`inline-flex h-6 items-center rounded-md px-2 text-xs font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function TextInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      data-cds="TextInput"
      className={`cds-focus h-8 w-full rounded-control border border-line bg-white px-3 text-sm text-ink placeholder:text-muted ${className}`}
      {...props}
    />
  );
}

export function FieldSelect({
  label,
  value,
  options,
  onValueChange,
  triggerClassName = "",
  showLabel = true,
  contentClassName = "",
  itemClassName = ""
}: {
  label: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  triggerClassName?: string;
  showLabel?: boolean;
  contentClassName?: string;
  itemClassName?: string;
}) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        data-cds="Button"
        className={`cds-focus inline-flex h-8 items-center gap-2 rounded-control border border-line bg-white px-3 text-sm text-ink ${triggerClassName}`}
      >
        {showLabel ? <span className="text-muted">{label}</span> : null}
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-muted" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={`z-50 min-w-[150px] rounded-cds border border-line bg-white p-1 shadow-lg ${contentClassName}`}>
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option}
                value={option}
                className={`flex h-8 cursor-pointer items-center justify-between rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill ${itemClassName}`}
              >
                <Select.ItemText>{option}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className="h-4 w-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export function DataTable<T>({
  columns,
  rows,
  getKey,
  renderActions,
  actionsHeader,
  showSelection = true,
  showActions = true,
  actionsWidth = "48px",
  className = "",
  tableClassName = ""
}: {
  columns: { key: string; header: string; render: (row: T) => ReactNode; width?: string }[];
  rows: T[];
  getKey: (row: T) => string;
  renderActions?: (row: T) => ReactNode;
  actionsHeader?: string;
  showSelection?: boolean;
  showActions?: boolean;
  actionsWidth?: string;
  className?: string;
  tableClassName?: string;
}) {
  return (
    <div data-cds="DataTable" className={`w-full overflow-hidden ${className}`}>
      <table data-cds="Table" className={`w-full table-fixed border-collapse text-left text-sm ${tableClassName}`}>
        <thead>
          <tr className="h-8 border-b border-line text-[13px] leading-4 text-[#52514e] [font-weight:550]">
            {showSelection ? (
              <th className="w-10 py-0">
                <span className="block h-4 w-4 rounded border border-[#cfcac2]" />
              </th>
            ) : null}
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-0 [font-weight:550]" style={{ width: column.width }}>
                {column.header}
              </th>
            ))}
            {showActions ? (
              <th className="px-3 py-0 [font-weight:550]" style={{ width: actionsWidth }}>
                {actionsHeader}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getKey(row)} className="h-[45px] border-b border-[#efede8] hover:bg-[#fbfaf7]">
              {showSelection ? (
                <td className="py-2">
                  <span className="block h-4 w-4 rounded border border-[#cfcac2]" />
                </td>
              ) : null}
              {columns.map((column) => (
                <td key={column.key} className="max-w-[260px] truncate px-3 py-2 align-middle" style={{ width: column.width }}>
                  {column.render(row)}
                </td>
              ))}
              {showActions ? (
                <td className="px-3 py-2" style={{ width: actionsWidth }}>
                  {renderActions ? (
                    renderActions(row)
                  ) : (
                    <Button variant="icon" aria-label="Open row actions">
                      <span className="text-lg leading-none">⋯</span>
                    </Button>
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SidebarItem({ to, children, inset = false, badge }: { to: string; children: ReactNode; inset?: boolean; badge?: string }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex h-9 items-center gap-3 rounded-lg px-2 text-sm text-[#4e4a45] hover:bg-fill ${inset ? "pl-10" : ""} ${active ? "bg-[#eeeeeb] text-ink" : ""}`}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {badge ? <span className="rounded-md bg-[#d7e8ff] px-2 py-0.5 text-xs font-semibold text-[#1b5eb8]">{badge}</span> : null}
    </Link>
  );
}

export function ConsoleDialog({
  title,
  description,
  open,
  onOpenChange,
  children,
  contentClassName = "w-[706px]",
  titleClassName = "text-2xl font-semibold text-ink",
  headerClassName = "flex items-start justify-between px-6 pt-6",
  closeButtonClassName = "h-8 w-8 px-0",
  closeLabel = "Close dialog"
}: {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  contentClassName?: string;
  titleClassName?: string;
  headerClassName?: string;
  closeButtonClassName?: string;
  closeLabel?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]" />
        <Dialog.Content data-cds="Dialog" className={`fixed left-1/2 top-1/2 z-50 max-h-[86vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-cds border border-line bg-white shadow-xl ${contentClassName}`}>
          <div className={headerClassName}>
            <div>
              <Dialog.Title className={titleClassName}>{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" className={closeButtonClassName} aria-label={closeLabel}>
                <span aria-hidden="true" className="text-[20px] leading-none">
                  {"\u00d7"}
                </span>
              </Button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const CdsTabs = Tabs;
export const CdsDropdownMenu = DropdownMenu;
