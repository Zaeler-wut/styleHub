// src/components/CategoryList.tsx
// ส่วนแสดง “รายการหมวดหมู่สินค้า” สำหรับฝั่งแอดมิน
// สามารถค้นหา แก้ไข และลบหมวดหมู่ได้จากตารางนี้

import React, { useMemo, useState } from "react";
import { type Category } from "../types/category";
import categoriesSeed from "../data/categorys.json";

// โครงสร้าง props ของ CategoryList
// - items   : รายการหมวดหมู่ที่อยู่ใน state หลักของระบบ (ข้อมูลจริงที่ใช้งานอยู่)
// - onDelete: ฟังก์ชันลบหมวดหมู่ตาม id
// - onEdit  : ฟังก์ชันที่เรียกเมื่อกด “แก้ไข” โดยจะส่ง Category ที่ประกอบข้อมูลพร้อมใช้กลับไปให้ฟอร์มแก้ไข
type CategoryListProps = {
  items: Category[];
  onDelete: (id: string) => void;
  onEdit?: (cat: Category) => void;
};

export default function CategoryList({
  items,
  onDelete,
  onEdit,
}: CategoryListProps) {
  // q        : เก็บข้อความที่ผู้ใช้พิมพ์เพื่อค้นหาหมวดหมู่
  // broken   : เก็บสถานะ “รูปโหลดไม่ได้” สำหรับแต่ละ id (ใช้ปิดการแสดงรูปที่ error ไปแล้ว)
  const [q, setQ] = useState("");
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  // สร้าง fallback จากไฟล์ JSON: id(lower) -> { name, image }
  // ใช้กรณีที่ใน items ไม่มี name หรือ image แต่ในไฟล์ seed มีข้อมูลอยู่
  const seedMap = useMemo(() => {
    const m = new Map<string, { name?: string; image?: string }>();

    (categoriesSeed as Array<{
      id?: string;
      name?: string;
      image?: string;
    }>).forEach((raw) => {
      const rawId = (raw.id || "").trim();
      if (!rawId) return;

      const key = rawId.toLowerCase();
      const prev = m.get(key);

      m.set(key, {
        // ถ้ามีค่าเก่าใน map แล้ว ให้คงค่าเดิมไว้ก่อน (ป้องกันการทับค่า)
        name: prev?.name || raw.name?.trim() || undefined,
        image: prev?.image || raw.image?.trim() || undefined,
      });
    });

    return m;
  }, []);

  // รวมข้อมูลที่ใช้แสดงจริงในตาราง โดยผสมข้อมูลจาก items + seedMap
  // ลอจิก:
  // - name  : ใช้จาก items ก่อน → ถ้าว่างใช้จาก seed → ถ้ายังไม่มีเลยใช้ id แทน
  // - image : ใช้จาก items ก่อน → ถ้าว่างใช้จาก seed
  const view = useMemo<Category[]>(() => {
    return items.map((c) => {
      const key = c.id.toLowerCase();
      const seed = seedMap.get(key);

      return {
        id: c.id,
        name: c.name || seed?.name || c.id,
        image: c.image || seed?.image || undefined,
      };
    });
  }, [items, seedMap]);

  // ฟิลเตอร์รายการตามคำค้นหา q
  // ค้นจากทั้ง name และ id โดยไม่สนตัวพิมพ์เล็ก/ใหญ่
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return view;

    return view.filter(
      (c) =>
        c.name?.toLowerCase().includes(t) ||
        c.id.toLowerCase().includes(t)
    );
  }, [view, q]);

  return (
    <section className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10">
      {/* ส่วนควบคุมด้านบน: ช่องค้นหาหมวดหมู่ */}
      <div className="mb-3 flex items-center gap-3">
        <input
          className="w-full max-w-xs rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
          placeholder="ค้นหาหมวดหมู่"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* หัวตาราง: แบ่งเป็นคอลัมน์ชื่อหมวด และคอลัมน์ปุ่มจัดการ */}
      <div className="grid grid-cols-12 border-b border-black/10 px-2 py-2 text-xs font-semibold text-black/70">
        <div className="col-span-9 sm:col-span-10">หมวดหมู่</div>
        <div className="col-span-3 sm:col-span-2 text-right">จัดการ</div>
      </div>

      {/* แสดงรายการหมวดหมู่ทีละแถว */}
      <ul className="divide-y divide-black/5">
        {filtered.map((c) => {
          const noImg =
            !c.image || broken[c.id.toLowerCase()]; // ใช้เช็คว่าหมวดนี้ถือว่า “ไม่มีรูป” หรือไม่

          return (
            <li
              key={c.id}
              className="grid grid-cols-12 items-center px-2 py-2 hover:bg-black/5"
            >
              {/* คอลัมน์ซ้าย: รูป + ชื่อหมวด */}
              <div className="col-span-9 sm:col-span-10 flex items-center gap-3">
                {/* กล่องรูปภาพขนาดเล็กด้านหน้าแต่ละแถว */}
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-black/10">
                  {noImg ? (
                    // ถ้าไม่มีรูป หรือรูปเคยโหลดพังแล้ว ให้แสดงกล่อง “no img”
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
                        setBroken((b) => ({
                          ...b,
                          [c.id.toLowerCase()]: true,
                        }))
                      }
                    />
                  )}
                </div>

                {/* ข้อมูลชื่อหมวด และ id แสดงเสริมด้านล่าง */}
                <div className="flex flex-col">
                  <span className="font-medium leading-tight">
                    {c.name || c.id}
                  </span>
                  {c.name && (
                    <span className="leading-tight text-[11px] text-black/50">
                      id: {c.id}
                    </span>
                  )}
                </div>
              </div>

              {/* คอลัมน์ขวา: ปุ่ม “แก้ไข” และ “ลบ” */}
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
                    if (
                      confirm(`ลบหมวดหมู่ "${c.name || c.id}" ?`)
                    ) {
                      onDelete(c.id);
                    }
                  }}
                  className="rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-600 shadow hover:bg-red-50"
                >
                  ลบ
                </button>
              </div>
            </li>
          );
        })}

        {/* กรณีค้นหาแล้วไม่เจอหมวดหมู่ หรือไม่มีข้อมูลเลย */}
        {filtered.length === 0 && (
          <li className="px-2 py-6 text-center text-sm text-black/50">
            ไม่พบหมวดหมู่
          </li>
        )}
      </ul>
    </section>
  );
}
