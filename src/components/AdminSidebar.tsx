import React from "react";

type Props = {
  open: boolean;
  current: "dashboard" | "product" | "category";
  onChangeTab: (t: "dashboard" | "product" | "category") => void;
  onToggle: () => void;
  onLogout: () => void;
};

export default function AdminSidebar({
  open,
  current,
  onChangeTab,
  onToggle,
  onLogout,
}: Props) {
  const Item = (key: Props["current"], label: string, emoji: string) => (
    <button
      onClick={() => onChangeTab(key)}
      className={[
        "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-semibold transition",
        current === key
          ? "bg-white text-gray-900"
          : "text-white/90 hover:bg-white/10",
      ].join(" ")}
    >
      <span className="text-lg">{emoji}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <aside
      className={[
        "fixed z-40 h-dvh w-64 shrink-0 bg-gray-900/95 p-4 text-white shadow-lg ring-1 ring-black/40 md:static",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "transition-transform",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-teal-300">StyleHub</span>
        </div>
        <button
          onClick={onToggle}
          className="rounded-lg bg-white/10 px-2 py-1 text-sm md:hidden"
        >
          ☰
        </button>
      </div>

      <nav className="space-y-2">
        {Item("dashboard", "Dashboard", "📊")}
        {Item("product", "Product", "🛍️")}
        {Item("category", "Category", "🏷️")}
      </nav>

      <div className="mt-6 rounded-lg bg-white/10 p-3 text-white/90">
        <div className="flex items-center gap-2 font-semibold">
          <span>👤</span> <span>Admin</span>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="mt-6 w-full rounded-lg bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20"
      >
        Log out
      </button>
    </aside>
  );
}
