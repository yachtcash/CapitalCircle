"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, Lock } from "lucide-react";
import Modal from "@/components/negotiations/Modal";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type { CalendarCategory } from "@/data/calendar";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
};

const DEFAULT_NEW_COLOR = "#294378";

function slugifyId(name: string, index: number): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${base || "category"}-${index}`;
}

export default function CategoryManager({ open, onClose }: Props) {
  const {
    calendarCategories,
    addCalendarCategory,
    updateCalendarCategory,
    deleteCalendarCategory,
  } = useMessaging();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_NEW_COLOR);

  const trimmed = newName.trim();
  const canAdd = trimmed.length > 0;

  function handleAdd() {
    if (!canAdd) return;
    addCalendarCategory({
      id: slugifyId(trimmed, calendarCategories.length),
      name: trimmed,
      color: newColor,
      removable: true,
    });
    setNewName("");
    setNewColor(DEFAULT_NEW_COLOR);
  }

  const footer = (
    <button
      type="button"
      onClick={onClose}
      className="inline-flex items-center justify-center rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-cream ring-1 ring-navy-900/10 transition-colors hover:bg-navy-700"
    >
      Done
    </button>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage Categories"
      description="Rename categories, recolor them, or add your own. Colors appear on calendar events."
      footer={footer}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Existing categories */}
        <ul className="space-y-2">
          {calendarCategories.map((category: CalendarCategory) => (
            <li
              key={category.id}
              className="group flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 ring-1 ring-navy-900/[0.06] transition-shadow hover:ring-navy-900/[0.12]"
            >
              {/* Color swatch */}
              <label
                className="relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-navy-900/10 transition-transform hover:scale-[1.05]"
                style={{ backgroundColor: category.color }}
                title="Change color"
              >
                <input
                  type="color"
                  value={category.color}
                  onChange={(e) => updateCalendarCategory(category.id, { color: e.target.value })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label={`${category.name} color`}
                />
              </label>

              {/* Editable name */}
              <input
                type="text"
                value={category.name}
                onChange={(e) => updateCalendarCategory(category.id, { name: e.target.value })}
                aria-label={`${category.name} name`}
                className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium text-navy-900 outline-none transition-colors hover:border-navy-900/10 hover:bg-bone/40 focus:border-gold-500/60 focus:bg-white focus:ring-2 focus:ring-gold-500/20"
              />

              {/* Lock badge for non-removable defaults */}
              {category.removable === false ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-navy-900/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-navy-700/60 ring-1 ring-navy-900/[0.06]">
                  <Lock className="h-3 w-3" strokeWidth={2.4} />
                  Default
                </span>
              ) : null}

              {/* Delete — only for custom (removable) categories; defaults are protected */}
              {category.removable !== false ? (
                <button
                  type="button"
                  onClick={() => deleteCalendarCategory(category.id)}
                  aria-label={`Delete ${category.name}`}
                  className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full text-navy-700/40 transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2.1} />
                </button>
              ) : (
                <span className="h-8 w-8 shrink-0" aria-hidden="true" />
              )}
            </li>
          ))}

          {calendarCategories.length === 0 ? (
            <li className="flex flex-col items-center gap-2 rounded-2xl bg-bone/40 px-4 py-8 text-center ring-1 ring-navy-900/[0.06]">
              <Tag className="h-6 w-6 text-navy-700/30" strokeWidth={1.8} />
              <p className="text-sm text-navy-700/60">No categories yet. Add one below.</p>
            </li>
          ) : null}
        </ul>

        {/* Add category row */}
        <div className="rounded-2xl bg-bone/40 p-3 ring-1 ring-navy-900/[0.06]">
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-navy-700/50">
            New Category
          </p>
          <div className="flex items-center gap-2.5">
            {/* New color */}
            <label
              className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-navy-900/10 transition-transform hover:scale-[1.05]"
              style={{ backgroundColor: newColor }}
              title="Pick color"
            >
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="New category color"
              />
            </label>

            {/* New name */}
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="Category name"
              aria-label="New category name"
              className="min-w-0 flex-1 rounded-lg border border-navy-900/10 bg-white px-3 py-2 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-700/35 focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/20"
            />

            {/* Add */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition-colors",
                canAdd
                  ? "bg-gold-500 text-navy-900 ring-gold-700/20 hover:bg-gold-700 hover:text-cream"
                  : "cursor-not-allowed bg-navy-900/[0.04] text-navy-700/35 ring-navy-900/[0.06]"
              )}
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              Add
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
