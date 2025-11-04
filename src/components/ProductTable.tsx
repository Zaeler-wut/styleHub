import React, { useMemo, useState } from "react";
import { type Product } from "../types/product";

type Props = {
  items: Product[];
  categories: string[];
  onEdit: (p: Product) => void;
  onDelete: (id: number) => void;
};

export default function ProductTable({ items, categories, onEdit, onDelete }: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("__ALL__");

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const qLower = q.toLowerCase();
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(qLower) ||
        String(p.id).includes(qLower);
      const matchCat = cat === "__ALL__" || p.category === cat;
      return matchQ && matchCat;
    });
  }, [items, q, cat]);

  return (
    <section className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <input
            placeholder="ค้นหา"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-56 rounded-md border border-black/10 bg-white px-3 py-2"
          />
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="rounded-md border border-black/10 bg-white px-3 py-2"
          >
            <option value="__ALL__">ทุกหมวด</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-black/70">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">ชื่อสินค้า</th>
              <th className="px-3 py-2">หมวดหมู่</th>
              <th className="px-3 py-2">ราคา</th>
              <th className="px-3 py-2 w-36">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-black/5">
                <td className="px-3 py-2">{p.id}</td>
                <td className="px-3 py-2 font-semibold">
                  <div className="flex items-center gap-2">
                    {p.images?.[0] && (
                      <img
                        src={p.images[0]}
                        alt=""
                        className="h-8 w-8 rounded object-cover ring-1 ring-black/10"
                      />
                    )}
                    <span>{p.name}</span>
                    {p.images && p.images.length > 1 && (
                      <span className="text-xs text-black/50">
                        (+{p.images.length - 1})
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">{p.category}</td>
                <td className="px-3 py-2">{p.price.toLocaleString()}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="rounded-md bg-black px-3 py-1 text-white shadow hover:opacity-90"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`ลบสินค้า ${p.name}?`)) onDelete(p.id);
                      }}
                      className="rounded-md bg-white px-3 py-1 shadow ring-1 ring-red-300 hover:bg-red-50"
                    >
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-black/50" colSpan={5}>
                  ไม่พบรายการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
