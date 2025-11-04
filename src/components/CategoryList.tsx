// src/components/CategoryList.tsx
import React, { useMemo, useState } from "react";
import { type Category } from "../types/category";
import categoriesSeed from "../data/categorys.json"; // ใช้เป็น fallback

type CategoryListProps = {
  items: Category[];
  onDelete: (id: string) => void;
  onEdit?: (cat: Category) => void; // ← จะส่ง cat ที่ “รวมค่าเดิมครบๆ” ออกไป
};

export default function CategoryList({ items, onDelete, onEdit }: CategoryListProps) {
  const [q, setQ] = useState("");
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  // สร้างแผนที่ fallback จากไฟล์: id(lower) -> {name,image}
  const seedMap = useMemo(() => {
    const m = new Map<string, { name?: string; image?: string }>();
    (categoriesSeed as Array<{ id?: string; name?: string; image?: string }>).forEach((raw) => {
      const rawId = (raw.id || "").trim();
      if (!rawId) return;
      const key = rawId.toLowerCase();
      const prev = m.get(key);
      m.set(key, {
        name: prev?.name || raw.name?.trim() || undefined,
        image: prev?.image || raw.image?.trim() || undefined,
      });
    });
    return m;
  }, []);

  // รวมข้อมูลที่ใช้แสดง และที่ต้อง “ส่งให้แก้ไข”
  const view = useMemo<Category[]>(() => {
    return items.map((c) => {
      const key = c.id.toLowerCase();
      const seed = seedMap.get(key);
      return {
        id: c.id,
        name: c.name || seed?.name || c.id,     // ชื่อสำหรับแสดง (ถ้าไม่มีใช้ id)
        image: c.image || seed?.image || undefined,
      };
    });
  }, [items, seedMap]);

  // ค้นหา
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return view;
    return view.filter((c) => c.name?.toLowerCase().includes(t) || c.id.toLowerCase().includes(t));
  }, [view, q]);

  return (
    <section className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10">
      {/* controls */}
      <div className="mb-3 flex items-center gap-3">
        <input
          className="w-full max-w-xs rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
          placeholder="ค้นหาหมวดหมู่"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* header */}
      <div className="grid grid-cols-12 border-b border-black/10 px-2 py-2 text-xs font-semibold text-black/70">
        <div className="col-span-9 sm:col-span-10">หมวดหมู่</div>
        <div className="col-span-3 sm:col-span-2 text-right">จัดการ</div>
      </div>

      {/* rows */}
      <ul className="divide-y divide-black/5">
        {filtered.map((c) => {
          const noImg = !c.image || broken[c.id.toLowerCase()];
          return (
            <li key={c.id} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-black/5">
              <div className="col-span-9 sm:col-span-10 flex items-center gap-3">
                <div className="h-9 w-9 overflow-hidden rounded-md ring-1 ring-black/10 bg-white shrink-0">
                  {noImg ? (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-black/40">
                      no img
                    </div>
                  ) : (
                    <img
                      src={c.image}
                      alt={c.id}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={() =>
                        setBroken((b) => ({ ...b, [c.id.toLowerCase()]: true }))
                      }
                    />
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="font-medium leading-tight">{c.name || c.id}</span>
                  {c.name && (
                    <span className="text-[11px] text-black/50 leading-tight">id: {c.id}</span>
                  )}
                </div>
              </div>

              <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onEdit?.(c)}
                  className="rounded-md bg-black px-3 py-1 text-xs font-semibold text-white shadow hover:brightness-110"
                >
                  แก้ไข
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`ลบหมวดหมู่ "${c.name || c.id}" ?`)) onDelete(c.id);
                  }}
                  className="rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-600 shadow hover:bg-red-50"
                >
                  ลบ
                </button>
              </div>
            </li>
          );
        })}

        {filtered.length === 0 && (
          <li className="px-2 py-6 text-center text-sm text-black/50">ไม่พบหมวดหมู่</li>
        )}
      </ul>
    </section>
  );
}
