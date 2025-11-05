// src/components/CategorySidebar.tsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import seedCats from "../data/categorys.json";

type Cat = { id: string; name?: string };

// ✅ รองรับทั้ง string[] และ Cat[]
type Props = {
  categories?: Array<string | Cat>;
  selectedKey?: string;
  className?: string;
};

const norm = (s?: string) => (s ?? "").trim().toLowerCase();

export default function CategorySidebar({
  categories,
  selectedKey,
  className = "",
}: Props) {
  const current = norm(selectedKey ?? "all");

  const cats: Cat[] = useMemo(() => {
    const hasProps = Array.isArray(categories) && categories.length > 0;

    // 1) ถ้ามี props → ใช้เฉพาะ props (ไม่ fallback/ไม่ union กับไฟล์)
    if (hasProps) {
      const map = new Map<string, Cat>();
      for (const item of categories!) {
        if (typeof item === "string") {
          const id = norm(item);
          if (!id) continue;
          if (!map.has(id)) map.set(id, { id }); // name ไม่มีก็ใช้ id เป็น label ใน UI ได้
        } else {
          const id = norm(item.id);
          if (!id) continue;
          const name = (item.name || "").trim();
          if (!map.has(id)) map.set(id, { id, name: name || undefined });
        }
      }
      return Array.from(map.values());
    }

    // 2) ถ้าไม่มี props → ค่อย fallback ไฟล์ JSON
    const map = new Map<string, Cat>();
    (seedCats as Array<{ id?: string; name?: string }>).forEach((c) => {
      const id = norm(String(c?.id ?? ""));
      if (!id) return;
      const name = (c?.name || "").trim();
      if (!map.has(id)) map.set(id, { id, name: name || undefined });
    });
    return Array.from(map.values());
  }, [categories]);

  return (
    <aside
      className={`w-full sm:w-56 rounded-[1.5rem] bg-white/85 px-5 py-6 shadow-md ring-1 ring-black/5 ${className}`}
    >
      <ul className="space-y-5 text-center">
        <li>
          <Link
            to="/products"
            className={`inline-block text-base font-semibold ${
              current === "all" ? "text-rose-400" : "text-black"
            }`}
          >
            หมวดหมู่ทั้งหมด
          </Link>
        </li>

        {cats.map((c) => {
          const id = norm(c.id);
          const active = current === id;
          return (
            <li key={id}>
              <Link
                to={`/products/${encodeURIComponent(id)}`}
                className={`inline-block text-base font-semibold ${
                  active ? "text-rose-400" : "text-black"
                }`}
                title={c.name || c.id}
              >
                {c.name || c.id}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
