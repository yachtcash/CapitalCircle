/**
 * Compatibility shim — the canonical EmptyState now lives in the shared UI
 * system. Existing imports keep working; new code should import from
 * "@/components/ui" directly.
 */
export { default } from "@/components/ui/EmptyState";
