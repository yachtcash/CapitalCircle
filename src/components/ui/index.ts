/**
 * Capital Circle shared UI system. New surfaces should compose these
 * primitives (plus the tokens in @/lib/design/tokens) instead of re-declaring
 * shells inline.
 */
export { default as Badge } from "./Badge";
export { default as StatusBadge, toneForStatus } from "./StatusBadge";
export { default as Button } from "./Button";
export { default as Card, CardHeader, CardBody, CardFooter } from "./Card";
export { default as SectionHeader } from "./SectionHeader";
export { default as PageHeader } from "./PageHeader";
export { default as StatCard, StatGrid } from "./StatCard";
export { default as EmptyState } from "./EmptyState";
export { default as Modal } from "./Modal";
export { default as ConfirmDialog } from "./ConfirmDialog";
export { default as Avatar } from "./Avatar";
export { default as SearchField } from "./SearchField";
export { FilterBar, FilterSelect } from "./FilterBar";
export { Table, THead, TH, TBody, TR, TD } from "./Table";
