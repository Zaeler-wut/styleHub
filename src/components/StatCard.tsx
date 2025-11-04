import React from "react";

type Props = { title: string; value: number | string; icon?: string };

export default function StatCard({ title, value, icon = "📈" }: Props) {
  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-black/80">{title}</h3>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="mt-2 text-3xl font-extrabold">{value}</div>
    </div>
  );
}
