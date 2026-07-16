import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Select from "@radix-ui/react-select";
import * as Tabs from "@radix-ui/react-tabs";
import * as Tooltip from "@radix-ui/react-tooltip";
import { forwardRef, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function isRadixFloatingPortalTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("[data-cds='ComboboxPopover'], [data-cds='SelectContent'], [data-cds='Menu'], [data-radix-popper-content-wrapper], [role='listbox'], [role='menu']"));
}

function CdsIconGlyph({ glyph, className = "h-5 w-5 text-current text-[20px] [font-weight:433.3]" }: { glyph: string; className?: string }) {
  return (
    <span data-cds="Icon" aria-hidden="true" className={`flex shrink-0 select-none items-center justify-center leading-none [font-family:var(--font-anthropicons,Anthropicons-Variable)] ${className}`}>
      {glyph}
    </span>
  );
}

function TableSelectionBox({
  label = "Select row",
  checked = false,
  mixed = false,
  onToggle
}: {
  label?: string;
  checked?: boolean;
  mixed?: boolean;
  onToggle?: () => void;
}) {
  const state = mixed ? "mixed" : checked ? "true" : "false";
  const glyph = mixed ? "" : "";

  function handleMouseDown(event: MouseEvent<HTMLSpanElement>) {
    event.preventDefault();
    event.stopPropagation();
    onToggle?.();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      onToggle?.();
    }
  }

  return (
    <span
      data-cds="Checkbox"
      data-checked={checked && !mixed ? "" : undefined}
      data-indeterminate={mixed ? "" : undefined}
      data-unchecked={!checked && !mixed ? "" : undefined}
      role="checkbox"
      tabIndex={0}
      aria-checked={state}
      aria-label={label}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-left outline-none"
    >
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] ${checked || mixed ? "border-0 bg-[#2a78d6]" : "border border-[rgba(11,11,11,0.2)] bg-transparent"}`}>
        <CdsIconGlyph glyph={glyph} className={`h-4 w-4 text-white text-[16px] [font-weight:700] ${checked || mixed ? "opacity-100" : "opacity-0"}`} />
      </span>
    </span>
  );
}

export const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "icon";
  size?: "md" | "sm";
}>(function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}, ref) {
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
      ref={ref}
      data-cds="Button"
      type={type}
      className={`cds-focus inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-control [font-weight:550] opacity-100 transition-shadow disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${variant === "icon" ? "h-7 w-7 px-0" : sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export function useCopyFeedback(value: string, resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  function copy(event?: { stopPropagation?: () => void }) {
    event?.stopPropagation?.();
    void navigator.clipboard?.writeText(value);
    setCopied(true);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), resetMs);
  }

  return { copied, copy };
}

function CopyTooltip({
  copied,
  hovered,
  onHoveredChange,
  children
}: {
  copied: boolean;
  hovered: boolean;
  onHoveredChange: (hovered: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root open={hovered || copied} onOpenChange={onHoveredChange}>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            sideOffset={4}
            className="z-50 rounded-[6px] bg-[#0b0b0b] px-2 py-[3px] text-[13px] leading-[18px] text-white shadow-sm"
          >
            {copied ? "Copied" : "Copy"}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

/** Small icon-only copy button: fades in on `group-hover/cid` (list ID cells). */
export function CopyIdButton({ value, className = "" }: { value: string; className?: string }) {
  const { copied, copy } = useCopyFeedback(value);
  const [hovered, setHovered] = useState(false);

  return (
    <CopyTooltip copied={copied} hovered={hovered} onHoveredChange={setHovered}>
      <Button
        variant="ghost"
        size="sm"
        className={`relative z-10 -my-1 h-[22px] w-[22px] !rounded-[8px] !px-0 !text-[#898781] !opacity-0 transition-colors hover:!bg-fill hover:!text-[#52514e] focus-visible:!opacity-100 group-hover/cid:!opacity-100 ${copied ? "!opacity-100" : ""} ${className}`}
        aria-label={`Copy ${value}`}
        onClick={copy}
      >
        <CdsIconGlyph glyph={copied ? "" : ""} className="h-3.5 w-3.5 text-current text-[14px] [font-weight:628.5]" />
      </Button>
    </CopyTooltip>
  );
}

/** Generic icon-only copy button (always visible, or made hover-reveal via `className`). */
export function CopyIconButton({
  value,
  ariaLabel,
  className = "",
  iconClassName = "h-3.5 w-3.5 text-current text-[14px] [font-weight:628.5]"
}: {
  value: string;
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
}) {
  const { copied, copy } = useCopyFeedback(value);
  const [hovered, setHovered] = useState(false);

  return (
    <CopyTooltip copied={copied} hovered={hovered} onHoveredChange={setHovered}>
      <Button
        variant="ghost"
        size="sm"
        className={className}
        aria-label={ariaLabel ?? `Copy ${value}`}
        onClick={copy}
      >
        <CdsIconGlyph glyph={copied ? "" : ""} className={iconClassName} />
      </Button>
    </CopyTooltip>
  );
}

/** Click-to-copy plain text (detail-page header IDs): no separate icon, text itself is the control. */
export function CopyableIdText({
  value,
  display,
  className = "relative -mx-1 -my-0.5 w-fit max-w-full cursor-pointer rounded-md px-1 py-0.5 text-xs text-muted transition-colors hover:bg-fill [font-weight:430]",
  textClassName = "relative inline-block max-w-full truncate align-bottom font-mono text-xs text-muted [font-weight:430]"
}: {
  value: string;
  display?: ReactNode;
  className?: string;
  textClassName?: string;
}) {
  const { copied, copy } = useCopyFeedback(value);
  const [hovered, setHovered] = useState(false);

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      copy();
    }
  }

  return (
    <CopyTooltip copied={copied} hovered={hovered} onHoveredChange={setHovered}>
      <span
        role="button"
        tabIndex={0}
        aria-label={`Copy ${value}`}
        className={className}
        onClick={() => copy()}
        onKeyDown={handleKeyDown}
      >
        <span className={textClassName}>
          {display ?? value}
          <span className="pointer-events-none absolute left-0 top-0 select-none whitespace-nowrap text-transparent">{value}</span>
        </span>
      </span>
    </CopyTooltip>
  );
}

export function Badge({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: "neutral" | "green" | "blue" | "red" | "warning"; className?: string }) {
  const tones = {
    neutral: "bg-[rgba(11,11,11,0.05)] text-[#52514e]",
    green: "bg-[#caeac7] text-[#006300]",
    blue: "bg-[#d7e8ff] text-[#1b5eb8]",
    red: "bg-[#ffe0dc] text-[#a33a29]",
    warning: "bg-[#f9dca4] text-[#734500]"
  };
  return (
    <span data-cds="Badge" className={`inline-flex h-5 items-center rounded-[5px] px-2 text-xs leading-[15px] [font-weight:550] ${tones[tone]} ${className}`}>
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
  triggerShellClassName = "",
  showLabel = true,
  ariaLabel,
  contentClassName = "",
  itemClassName = "",
  contentPosition = "popper",
  contentSideOffset = 4,
  placeholder
}: {
  label: ReactNode;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  triggerClassName?: string;
  triggerShellClassName?: string;
  showLabel?: boolean;
  ariaLabel?: string;
  contentClassName?: string;
  itemClassName?: string;
  contentPosition?: "item-aligned" | "popper";
  contentSideOffset?: number;
  placeholder?: ReactNode;
}) {
  const trigger = (
    <Select.Trigger
      data-cds="Button"
      aria-label={ariaLabel}
      className={`cds-focus inline-flex h-8 items-center gap-2 rounded-control border border-line bg-white px-3 text-sm text-ink ${triggerShellClassName ? "min-w-0 flex-1 self-stretch !gap-1.5 !rounded-none !border-0 !bg-transparent !p-0 !pl-2 !pr-0 !shadow-none" : ""} ${triggerClassName}`}
    >
      <span className={`flex min-w-0 flex-1 items-baseline gap-1.5 whitespace-nowrap ${!value && placeholder ? "text-muted" : ""}`}>
        {showLabel ? <span className="shrink-0 text-muted">{label}</span> : null}
        <Select.Value className="min-w-0 truncate" placeholder={placeholder} />
      </span>
      <Select.Icon className="shrink-0">
        <CdsIconGlyph glyph="" className="mr-0.5 h-4 w-4 text-[#898781] text-[16px] [font-weight:533.25]" />
      </Select.Icon>
    </Select.Trigger>
  );

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      {triggerShellClassName ? <div data-cds="FieldSelect" className={triggerShellClassName}>{trigger}</div> : trigger}
      <Select.Portal>
        <Select.Content
          data-cds="SelectContent"
          position={contentPosition}
          align="start"
          sideOffset={contentSideOffset}
          className={`z-50 min-w-[192px] rounded-[12px] bg-white p-1.5 shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_16px_rgba(0,0,0,0.08)] ${contentClassName}`}
        >
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option}
                value={option}
                className={`flex h-8 cursor-pointer items-center justify-between gap-3 rounded-[8px] px-3 text-sm outline-none data-[highlighted]:bg-fill ${itemClassName}`}
              >
                <Select.ItemText>{option}</Select.ItemText>
                <Select.ItemIndicator>
                  <CdsIconGlyph glyph="" className="h-4 w-4 shrink-0 text-[#184F95] text-[16px] [font-weight:533.25]" />
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
  getRowHref,
  renderActions,
  actionsHeader,
  showSelection = true,
  showActions = true,
  actionsWidth = "48px",
  actionsHeaderAlign = "left",
  loading = false,
  loadingRows = 12,
  className = "",
  tableClassName = "",
  headerTextClassName,
  emptyRowClassName = "h-[365px]",
  emptyState,
  renderBulkActions
}: {
  columns: { key: string; header: string; render: (row: T) => ReactNode; width?: string; align?: "left" | "right" }[];
  rows: T[];
  getKey: (row: T) => string;
  getRowHref?: (row: T) => string;
  renderActions?: (row: T) => ReactNode;
  actionsHeader?: string;
  showSelection?: boolean;
  showActions?: boolean;
  actionsWidth?: string;
  actionsHeaderAlign?: "left" | "right";
  loading?: boolean;
  loadingRows?: number;
  className?: string;
  tableClassName?: string;
  headerTextClassName?: string;
  emptyRowClassName?: string;
  emptyState?: ReactNode;
  renderBulkActions?: (selection: { count: number; rows: T[]; clearSelection: () => void }) => ReactNode;
}) {
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
  const rowKeys = useMemo(() => rows.map((row) => getKey(row)), [rows, getKey]);
  const selectedVisibleCount = rowKeys.filter((key) => selectedKeys.has(key)).length;
  const allVisibleSelected = rowKeys.length > 0 && selectedVisibleCount === rowKeys.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;
  const resolvedHeaderTextClassName = headerTextClassName ?? (showSelection ? "text-[13px]" : "text-xs");

  function toggleAllVisible() {
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        rowKeys.forEach((key) => next.delete(key));
      } else {
        rowKeys.forEach((key) => next.add(key));
      }
      return next;
    });
  }

  function toggleRow(key: string) {
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const selectedRows = useMemo(() => rows.filter((row) => selectedKeys.has(getKey(row))), [rows, selectedKeys, getKey]);
  const clearSelection = () => setSelectedKeys(new Set());

  function shouldIgnoreRowClick(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest("a,button,input,select,textarea,[role='button'],[role='checkbox'],[data-cds-row-ignore-click='true']"));
  }

  return (
    <>
    <div data-cds="DataTable" className={`min-w-0 overflow-x-auto overflow-y-hidden ${className || "w-full"}`}>
      <table data-cds="Table" className={`w-full table-fixed text-left text-sm ${tableClassName}`}>
        <colgroup>
          {showSelection ? <col style={{ width: "40px" }} /> : null}
          {columns.map((column) => (
            <col key={column.key} style={{ width: column.width }} />
          ))}
          {showActions ? <col style={{ width: actionsWidth }} /> : null}
        </colgroup>
        <thead>
          <tr className={`h-8 border-b border-[rgba(11,11,11,0.1)] ${resolvedHeaderTextClassName} leading-4 text-[#52514e] [font-weight:550]`}>
            {showSelection ? (
              <th className="relative w-10 border-b border-[rgba(11,11,11,0.1)] p-0 [font-weight:550]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <TableSelectionBox label="Select all rows" checked={allVisibleSelected} mixed={someVisibleSelected} onToggle={toggleAllVisible} />
                </div>
              </th>
            ) : null}
            {columns.map((column) => {
              const alignClassName = column.align === "right" ? "text-right [&>.flex]:justify-end" : "";
              return (
                <th key={column.key} className={`border-b border-[rgba(11,11,11,0.1)] px-3 py-0 [font-weight:550] ${alignClassName}`} style={{ width: column.width }}>
                  {column.header}
                </th>
              );
            })}
            {showActions ? (
              <th className={`border-b border-[rgba(11,11,11,0.1)] px-3 py-0 [font-weight:550] ${actionsHeaderAlign === "right" ? "text-right [&>.flex]:justify-end" : ""}`} style={{ width: actionsWidth }}>
                {actionsHeader}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {loading ? Array.from({ length: loadingRows }, (_, rowIndex) => (
            <tr key={`loading-${rowIndex}`} className="h-[46px]">
              {showSelection ? (
                <td className="border-b border-[rgba(11,11,11,0.05)] px-3 py-2 align-middle">
                  <span className="block h-4 w-4 rounded-[4px] bg-fill text-transparent">Loading</span>
                </td>
              ) : null}
              {columns.map((column, columnIndex) => {
                const alignClassName = column.align === "right" ? "text-right [&>.flex]:justify-end" : "";
                return (
                  <td key={column.key} className={`border-b border-[rgba(11,11,11,0.05)] px-3 py-2 align-middle ${alignClassName}`} style={{ width: column.width }}>
                    <span className={`block h-4 rounded-md bg-fill text-transparent ${columnIndex === 0 ? "w-[72px]" : columnIndex === 1 ? "w-[160px]" : "w-[96px]"}`}>
                      Loading
                    </span>
                  </td>
                );
              })}
              {showActions ? (
                <td className="border-b border-[rgba(11,11,11,0.05)] px-3 py-2 align-middle" style={{ width: actionsWidth }}>
                  <span className="block h-4 w-6 rounded-md bg-fill text-transparent">Loading</span>
                </td>
              ) : null}
            </tr>
          )) : rows.length === 0 && emptyState ? (
            <tr data-empty-state="true" className={emptyRowClassName}>
              <td
                className="border-b border-[rgba(11,11,11,0.05)] px-3 py-2 align-middle"
                colSpan={(showSelection ? 1 : 0) + columns.length + (showActions ? 1 : 0)}
              >
                {emptyState}
              </td>
            </tr>
          ) : rows.map((row) => {
            const key = getKey(row);
            const selected = selectedKeys.has(key);
            const rowHref = getRowHref?.(row);

            return (
              <tr
                key={key}
                data-selected={selected ? "true" : undefined}
                className={`group/cdsrow h-[43px] first:h-11 relative [transform:translate(0,0)] hover:bg-[rgba(11,11,11,0.05)] ${rowHref ? "cursor-pointer" : ""}`}
                onClick={(event) => {
                  if (!rowHref || shouldIgnoreRowClick(event.target)) return;
                  navigate(rowHref);
                }}
              >
                {showSelection ? (
                  <td className="relative border-b border-[rgba(11,11,11,0.05)] p-0 group-data-[selected=true]/cdsrow:border-transparent group-data-[selected=true]/cdsrow:bg-[rgba(11,11,11,0.05)] group-data-[selected=true]/cdsrow:first:rounded-l-[8px]">
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                      <TableSelectionBox checked={selected} onToggle={() => toggleRow(key)} />
                    </div>
                  </td>
                ) : null}
                {columns.map((column, columnIndex) => {
                  const alignClassName = column.align === "right" ? "text-right [&>.flex]:justify-end" : "";
                  return (
                    <td key={column.key} className={`max-w-[260px] truncate border-b border-[rgba(11,11,11,0.05)] px-3 py-2 align-middle group-data-[selected=true]/cdsrow:border-transparent group-data-[selected=true]/cdsrow:bg-[rgba(11,11,11,0.05)] ${alignClassName}`} style={{ width: column.width }}>
                      {column.render(row)}
                    </td>
                  );
                })}
                {showActions ? (
                  <td className="border-b border-[rgba(11,11,11,0.05)] px-3 py-2 group-data-[selected=true]/cdsrow:border-transparent group-data-[selected=true]/cdsrow:bg-[rgba(11,11,11,0.05)] group-data-[selected=true]/cdsrow:last:rounded-r-[8px]" style={{ width: actionsWidth }}>
                    <span className="relative z-10 inline-flex max-w-full align-middle">
                      {renderActions ? (
                        renderActions(row)
                      ) : (
                        <Button variant="icon" aria-label="Open row actions">
                          <CdsIconGlyph glyph="" />
                        </Button>
                      )}
                    </span>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    {renderBulkActions && selectedRows.length > 0 ? (
      <div className="sticky bottom-6 z-40 flex pt-3">
        {renderBulkActions({ count: selectedRows.length, rows: selectedRows, clearSelection })}
      </div>
    ) : null}
    </>
  );
}

export function SidebarItem({ to, children, inset = false, badge, testId }: { to: string; children: ReactNode; inset?: boolean; badge?: string; testId?: string }) {
  const location = useLocation();
  const activeTo = normalizeSidebarPath(to);
  const active = location.pathname === to || location.pathname.startsWith(`${to}/`) || location.pathname === activeTo || location.pathname.startsWith(`${activeTo}/`);
  return (
    <Link
      to={to}
      data-testid={testId}
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center ${badge ? "gap-2" : "gap-3"} rounded-lg px-2 text-sm leading-[21px] text-[#52514e] hover:bg-fill ${inset ? "pl-10" : ""} ${active ? "bg-[rgba(11,11,11,0.05)] text-ink" : ""}`}
      style={{ height: 36 }}
    >
      <span className={`min-w-0 truncate ${badge ? "flex-none" : "flex-1"}`}>{children}</span>
      {badge ? <span className="rounded-md bg-[#d7e8ff] px-2 py-0.5 text-xs font-semibold text-[#1b5eb8]">{badge}</span> : null}
    </Link>
  );
}

function normalizeSidebarPath(path: string) {
  const workspacePrefix = "/workspaces/default/";
  if (!path.startsWith(workspacePrefix)) return path;
  return `/${path.slice(workspacePrefix.length)}`;
}

export function ConsoleDialog({
  title,
  description,
  open,
  onOpenChange,
  children,
  contentClassName = "w-[706px]",
  titleClassName = "text-2xl font-semibold text-ink",
  descriptionClassName = "mt-1 text-sm text-muted",
  headerClassName = "flex items-start justify-between px-6 pt-6",
  closeButtonClassName = "h-8 w-8 px-0",
  closeLabel = "Close dialog",
  overlayClassName = "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
}: {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  headerClassName?: string;
  closeButtonClassName?: string;
  closeLabel?: string;
  overlayClassName?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={overlayClassName} />
        <Dialog.Content
          data-cds="Dialog"
          className={`fixed left-1/2 top-1/2 z-50 max-h-[86vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-cds border border-line bg-white text-sm leading-5 text-ink shadow-xl ${contentClassName}`}
          onInteractOutside={(event) => {
            if (isRadixFloatingPortalTarget(event.target)) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            if (isRadixFloatingPortalTarget(event.target)) {
              event.preventDefault();
            }
          }}
          onFocusOutside={(event) => {
            if (isRadixFloatingPortalTarget(event.target)) {
              event.preventDefault();
            }
          }}
        >
          <div className={headerClassName}>
            <div className="mr-2 flex min-w-0 flex-1 flex-col">
              <Dialog.Title className={titleClassName}>{title}</Dialog.Title>
              {description ? <Dialog.Description className={descriptionClassName}>{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" className={closeButtonClassName} aria-label={closeLabel}>
                <CdsIconGlyph glyph="" />
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

type ToastItem = { id: number; message: string };
let toastItems: ToastItem[] = [];
let toastListeners: ((items: ToastItem[]) => void)[] = [];
let toastIdSeq = 0;

function emitToasts() {
  toastListeners.forEach((listener) => listener(toastItems));
}

/** Fire-and-forget top-right success toast (e.g. "Agent archived."). Auto-dismisses. */
export function showToast(message: string) {
  const id = ++toastIdSeq;
  toastItems = [...toastItems, { id, message }];
  emitToasts();
  window.setTimeout(() => {
    toastItems = toastItems.filter((item) => item.id !== id);
    emitToasts();
  }, 4000);
}

/** Mount once near the app root. Renders any toast fired via `showToast`. */
export function ToastViewport() {
  const [items, setItems] = useState<ToastItem[]>(toastItems);

  useEffect(() => {
    toastListeners.push(setItems);
    return () => {
      toastListeners = toastListeners.filter((listener) => listener !== setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          data-cds="Toast"
          role="status"
          aria-live="polite"
          className="pointer-events-auto overflow-hidden rounded-[12px] bg-white text-sm leading-5 text-ink shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
        >
          <div className="px-4 py-3">{item.message}</div>
        </div>
      ))}
    </div>
  );
}
