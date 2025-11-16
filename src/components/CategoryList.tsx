// src/components/CategoryList.tsx
import React, { useMemo, useState } from "react"; // ใช้ useState สำหรับ state ในฟอร์ม และ useMemo สำหรับคำนวณข้อมูลที่ cache ได้
import { type Category } from "../types/category"; // type Category ที่ใช้เก็บข้อมูลหมวดหมู่
import categoriesSeed from "../data/categorys.json"; // ใช้เป็น fallback ข้อมูล name/image ถ้าในฐานหลักไม่มี

type CategoryListProps = {
  items: Category[]; // รายการหมวดหมู่ที่แอดมินมีอยู่ในระบบ (จาก state หลัก)
  onDelete: (id: string) => void; // ฟังก์ชันลบหมวดหมู่ตาม id
  onEdit?: (cat: Category) => void; // ฟังก์ชันแก้ไข: จะส่ง cat ที่ “รวมค่าเดิมครบๆ” ออกไป
};

export default function CategoryList({ items, onDelete, onEdit }: CategoryListProps) {
  const [q, setQ] = useState(""); // state เก็บคำค้นหาหมวดหมู่
  const [broken, setBroken] = useState<Record<string, boolean>>({}); // เก็บสถานะรูปภาพที่โหลดไม่ได้ (ตาม id, lowercase)

  // สร้าง fallback จากไฟล์: id(lower) -> {name,image}
  const seedMap = useMemo(() => {
    const m = new Map<string, { name?: string; image?: string }>(); // map สำหรับเก็บข้อมูล name/image จากไฟล์ seed
    (categoriesSeed as Array<{ id?: string; name?: string; image?: string }>).forEach((raw) => {
      const rawId = (raw.id || "").trim(); // ดึง id แล้วตัดช่องว่าง
      if (!rawId) return; // ถ้าไม่มี id ให้ข้าม
      const key = rawId.toLowerCase(); // ใช้ id แบบตัวพิมพ์เล็กเป็น key
      const prev = m.get(key); // ตรวจว่ามีข้อมูลเก่าใน map อยู่แล้วหรือไม่
      m.set(key, {
        name: prev?.name || raw.name?.trim() || undefined, // ถ้ามี name เก่าอยู่แล้วให้คงไว้ ไม่งั้นใช้จากไฟล์
        image: prev?.image || raw.image?.trim() || undefined, // เช่นเดียวกับ image
      });
    });
    return m; // คืน map ที่ประกอบเสร็จแล้ว
  }, []); // ทำครั้งเดียวตอน mount

  // รวมข้อมูลที่ใช้แสดง และที่ต้อง “ส่งให้แก้ไข”
  const view = useMemo<Category[]>(() => {
    return items.map((c) => {
      const key = c.id.toLowerCase(); // แปลง id เป็นตัวพิมพ์เล็กเพื่อใช้หาจาก seedMap
      const seed = seedMap.get(key); // เอา fallback name/image จาก seed ถ้ามี
      return {
        id: c.id, // id จริงของหมวดหมู่
        name: c.name || seed?.name || c.id, // ถ้าไม่มี name ใน items ใช้จาก seed ถ้าไม่มีอีก ใช้ id แทน
        image: c.image || seed?.image || undefined, // ถ้า image ใน items ว่าง ให้ใช้จาก seed
      };
    });
  }, [items, seedMap]); // คำนวณใหม่เมื่อ items หรือ seedMap เปลี่ยน

  // ค้นหา
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase(); // เตรียมคำค้นหา: ตัดช่องว่างและแปลงเป็นตัวเล็ก
    if (!t) return view; // ถ้าไม่มีคำค้นหา ให้คืนทั้งหมด
    return view.filter(
      (c) => c.name?.toLowerCase().includes(t) || c.id.toLowerCase().includes(t) // ค้นจากทั้ง name และ id
    );
  }, [view, q]); // คำนวณใหม่เมื่อรายการหรือคำค้นหาเปลี่ยน

  return (
    <section className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10">
      {/* controls: ช่องค้นหา */}
      <div className="mb-3 flex items-center gap-3">
        <input
          className="w-full max-w-xs rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
          placeholder="ค้นหาหมวดหมู่"
          value={q}
          onChange={(e) => setQ(e.target.value)} // เมื่อผู้ใช้พิมพ์ให้ปรับคำค้นหาใน state
        />
      </div>

      {/* header: หัวตาราง */}
      <div className="grid grid-cols-12 border-b border-black/10 px-2 py-2 text-xs font-semibold text-black/70">
        <div className="col-span-9 sm:col-span-10">หมวดหมู่</div>
        <div className="col-span-3 sm:col-span-2 text-right">จัดการ</div>
      </div>

      {/* rows: แสดงรายการหมวดหมู่ */}
      <ul className="divide-y divide-black/5">
        {filtered.map((c) => {
          const noImg = !c.image || broken[c.id.toLowerCase()]; // กำหนดว่าหมวดนี้ควรถือว่า "ไม่มีรูป" หรือไม่
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
                        setBroken((b) => ({ ...b, [c.id.toLowerCase()]: true })) // ถ้ารูปโหลดไม่ได้ให้ mark เป็น broken เพื่อไม่พยายามแสดงอีก
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
                  onClick={() => onEdit?.(c)} // ถ้ามี onEdit ให้ส่งหมวดนี้ออกไปแก้ไข
                  className="rounded-md bg-black px-3 py-1 text-xs font-semibold text-white shadow hover:brightness-110"
                >
                  แก้ไข
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`ลบหมวดหมู่ "${c.name || c.id}" ?`)) onDelete(c.id); // ยืนยันก่อนลบ แล้วค่อยเรียก onDelete
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
