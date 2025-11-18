// src/components/ProductTable.tsx
import React, { useMemo, useState } from "react"; // ใช้ useState/useMemo สำหรับ state และการคำนวณที่ cache ได้
import { type Product } from "../types/product";  // ใช้ type Product เพื่อให้ props มีชนิดชัดเจน

type Props = {
  items: Product[];                  // รายการสินค้า (ทั้งหมด) ที่จะเอามาแสดง
  categories: string[];              // รายชื่อหมวดหมู่ สำหรับใช้เป็นตัวเลือก filter
  onEdit: (p: Product) => void;      // ฟังก์ชันที่เรียกเมื่อกดปุ่ม "แก้ไข" ส่ง Product กลับไปให้หน้า Admin
  onDelete: (id: number) => void;    // ฟังก์ชันที่เรียกเมื่อกดปุ่ม "ลบ" ส่ง id ของสินค้านั้นกลับไป
};

export default function ProductTable({ items, categories, onEdit, onDelete }: Props) {
  // q = ข้อความสำหรับค้นหา / cat = หมวดหมู่ที่เลือกใน dropdown
  const [q, setQ] = useState("");                 // เก็บคำค้นหา (ค้นจากชื่อสินค้า / id)
  const [cat, setCat] = useState<string>("__ALL__"); // "__ALL__" = แสดงทุกหมวด

  // ใช้ useMemo ช่วยกรองรายการสินค้าให้ตรงกับคำค้น + หมวดหมู่
  const filtered = useMemo(() => {
    return items.filter((p: Product) => {
      // แปลงคำค้นให้เป็นตัวพิมพ์เล็กทั้งหมดก่อนเปรียบเทียบ
      const qLower = q.toLowerCase();

      // เงื่อนไขฝั่ง "ค้นหา" — ถ้า q ว่าง = ผ่านเลย, ถ้าไม่ว่างให้เช็กจากชื่อสินค้า หรือ id
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(qLower) ||
        String(p.id).includes(qLower);

      // เงื่อนไขฝั่ง "หมวดหมู่" — ถ้าเลือกทุกหมวดให้ผ่านหมด, ถ้าเลือกหมวดเฉพาะให้เทียบกับ p.category
      const matchCat = cat === "__ALL__" || p.category === cat;

      // ต้องตรงทั้งคำค้นและหมวดหมู่ ถึงจะถูกเก็บไว้ใน filtered
      return matchQ && matchCat;
    });
  }, [items, q, cat]);

  return (
    <section className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10">
      {/* แถบด้านบน: ช่องค้นหา + เลือกหมวดหมู่ */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {/* ช่องค้นหา id / ชื่อสินค้า */}
          <input
            placeholder="ค้นหา"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full sm:w-56 rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
          />
          {/* เลือกหมวดหมู่ที่จะกรอง */}
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
          >
            <option value="__ALL__">ทุกหมวด</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ----------------- มุมมองสำหรับจอเล็ก (Mobile) : แสดงเป็นการ์ด ----------------- */}
      {/* ใช้ sm:hidden เพื่อซ่อนส่วนนี้บนจอ sm ขึ้นไป */}
      <div className="space-y-3 sm:hidden">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5"
          >
            {/* แถวบน: รูป + ชื่อสินค้า */}
            <div className="flex items-start gap-3">
              {p.images?.[0] && (
                <img
                  src={p.images[0]}
                  alt=""
                  className="h-12 w-12 flex-shrink-0 rounded object-cover ring-1 ring-black/10"
                />
              )}
              <div className="flex-1">
                <div className="text-xs text-black/50">ID: {p.id}</div>
                <div className="text-sm font-semibold leading-snug">
                  {p.name}
                  {p.images && p.images.length > 1 && (
                    <span className="ml-1 text-[11px] text-black/50">
                      (+{p.images.length - 1})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* แถวกลาง: หมวดหมู่ + ราคา */}
            <div className="mt-2 flex justify-between text-xs text-black/70">
              <span>หมวดหมู่: {p.category}</span>
              <span>ราคา: {p.price.toLocaleString()}</span>
            </div>

            {/* แถวล่าง: ปุ่มจัดการ */}
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => onEdit(p)}
                className="rounded-md bg-black px-3 py-1 text-xs font-semibold text-white shadow hover:opacity-90"
              >
                แก้ไข
              </button>
              <button
                onClick={() => {
                  if (confirm(`ลบสินค้า ${p.name}?`)) onDelete(p.id);
                }}
                className="rounded-md bg-white px-3 py-1 text-xs font-semibold shadow ring-1 ring-red-300 hover:bg-red-50"
              >
                ลบ
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl bg-white/80 p-6 text-center text-sm text-black/60">
            ไม่พบรายการ
          </div>
        )}
      </div>

      {/* ----------------- มุมมองสำหรับจอ sm ขึ้นไป : แสดงเป็นตาราง ----------------- */}
      {/* ใช้ hidden sm:block เพื่อแสดงเฉพาะจอใหญ่กว่า mobile */}
      <div className="hidden sm:block overflow-x-auto">
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
                <td
                  className="px-3 py-6 text-center text-black/50"
                  colSpan={5}
                >
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
