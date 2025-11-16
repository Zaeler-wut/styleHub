import React, { useMemo, useState } from "react"; // นำเข้า React และ hooks useMemo/useState สำหรับ state และการคำนวณแบบ cache
import { type Product } from "../types/product"; // นำเข้า type Product เพื่อใช้บอกชนิดข้อมูลรายการสินค้า

type Props = { // กำหนดชนิดของ props ที่คอมโพเนนต์นี้จะรับ
  items: Product[]; // items: รายการสินค้า (ทั้งหมด) ที่จะแสดงในตาราง
  categories: string[]; // categories: รายชื่อหมวดหมู่ เพื่อใช้เป็นตัวเลือก filter
  onEdit: (p: Product) => void; // onEdit: ฟังก์ชันที่เรียกตอนกดปุ่มแก้ไข พร้อมส่ง Product กลับไปให้แม่
  onDelete: (id: number) => void; // onDelete: ฟังก์ชันที่เรียกตอนกดปุ่มลบ พร้อมส่ง id สินค้าออกไป
}; // ปิด type Props

export default function ProductTable({ items, categories, onEdit, onDelete }: Props) { // ประกาศคอมโพเนนต์ ProductTable และรับ props
  const [q, setQ] = useState(""); // สร้าง state q สำหรับเก็บข้อความที่ใช้ค้นหา (search keyword)
  const [cat, setCat] = useState<string>("__ALL__"); // สร้าง state cat สำหรับเก็บหมวดหมู่ที่เลือก (ค่าเริ่มต้นคือทุกหมวด)

  const filtered = useMemo(() => { // ใช้ useMemo เพื่อคำนวณรายการสินค้าที่ผ่านการกรอง (search + category)
    return items.filter((p) => { // กรองจาก items ทีละสินค้า p
      const qLower = q.toLowerCase(); // แปลงคำค้นหาให้เป็นตัวพิมพ์เล็กเพื่อเทียบแบบไม่สนตัวใหญ่/เล็ก
      const matchQ = // เงื่อนไขว่าตรงกับคำค้นหาหรือไม่
        !q || // ถ้า q ว่าง ให้ผ่านเลย (ไม่กรอง)
        p.name.toLowerCase().includes(qLower) || // หรือชื่อสินค้าประกอบด้วยคำที่ค้นหา
        String(p.id).includes(qLower); // หรือ id สินค้า (แปลงเป็น string) มีข้อความที่ค้นหาอยู่
      const matchCat = cat === "__ALL__" || p.category === cat; // เงื่อนไขว่าตรงกับหมวดหมู่ที่เลือกหรือไม่ (ถ้าเลือกทุกหมวดให้ผ่าน)
      return matchQ && matchCat; // ต้องทั้งตรงกับคำค้นหาและหมวดหมู่ที่เลือกถึงจะคงไว้
    });
  }, [items, q, cat]); // ให้คำนวณใหม่เมื่อ items, q หรือ cat เปลี่ยน

  return ( // เริ่มคืน JSX ของคอมโพเนนต์
    <section className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10"> {/* กล่องหลักของตารางสินค้า มีพื้นหลังขาว โปร่งนิด ๆ และเงา */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"> {/* แถวบนสำหรับช่องค้นหา + ตัวเลือกหมวดหมู่ จัด layout ตามขนาดจอ */}
        <div className="flex items-center gap-2"> {/* กลุ่ม input และ select จัดเรียงแนวนอน */}
          <input
            placeholder="ค้นหา" // ข้อความตัวอย่างในช่องค้นหา
            value={q} // ผูกค่ากับ state q
            onChange={(e) => setQ(e.target.value)} // เมื่อพิมพ์ให้ปรับค่าค้นหาใน state
            className="w-56 rounded-md border border-black/10 bg-white px-3 py-2" // สไตล์ช่องค้นหา
          />
          <select
            value={cat} // ค่า select ปัจจุบัน (หมวดหมู่ที่เลือก)
            onChange={(e) => setCat(e.target.value)} // เมื่อเปลี่ยนตัวเลือกให้เซ็ต state cat ใหม่
            className="rounded-md border border-black/10 bg-white px-3 py-2" // สไตล์ select หมวดหมู่
          >
            <option value="__ALL__">ทุกหมวด</option> {/* ตัวเลือกสำหรับ "ทุกหมวดหมู่" */}
            {categories.map((c) => ( // วนสร้าง option จากรายการหมวดหมู่ที่รับมา
              <option key={c} value={c}>{c}</option> // แต่ละ option ใช้ value และ key เป็นชื่อหมวดหมู่
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto"> {/* ครอบ table ด้วย div ที่เลื่อนแนวนอนได้ ถ้าตารางกว้างเกิน */}
        <table className="min-w-full text-sm"> {/* สร้างตาราง กำหนดให้กว้างอย่างน้อยเท่าคอนเทนเนอร์ และใช้ฟอนต์ขนาดเล็ก */}
          <thead> {/* ส่วนหัวของตาราง */}
            <tr className="text-left text-black/70"> {/* แถวหัวตาราง จัดตัวอักษรชิดซ้าย ใช้สีเทาเข้ม */}
              <th className="px-3 py-2">ID</th> {/* หัวคอลัมน์ ID */}
              <th className="px-3 py-2">ชื่อสินค้า</th> {/* หัวคอลัมน์ชื่อสินค้า */}
              <th className="px-3 py-2">หมวดหมู่</th> {/* หัวคอลัมน์หมวดหมู่ */}
              <th className="px-3 py-2">ราคา</th> {/* หัวคอลัมน์ราคา */}
              <th className="px-3 py-2 w-36">จัดการ</th> {/* หัวคอลัมน์ปุ่มจัดการ (แก้ไข/ลบ) พร้อมกำหนดความกว้างคงที่ */}
            </tr>
          </thead>
          <tbody> {/* ส่วนเนื้อหาตาราง (แถวข้อมูล) */}
            {filtered.map((p) => ( // วนแสดงสินค้าทั้งหมดหลังจากกรองแล้ว
              <tr key={p.id} className="border-t border-black/5"> {/* แถวของสินค้าแต่ละตัว มีเส้นคั่นด้านบน */}
                <td className="px-3 py-2">{p.id}</td> {/* แสดง id สินค้า */}
                <td className="px-3 py-2 font-semibold"> {/* คอลัมน์ชื่อสินค้า ใช้ตัวหนา */}
                  <div className="flex items-center gap-2"> {/* แสดงรูป + ชื่อสินค้าในแถวเดียวกัน */}
                    {p.images?.[0] && ( // ถ้าสินค้ามีรูปภาพใน index 0
                      <img
                        src={p.images[0]} // ใช้รูปแรกเป็นรูปตัวอย่าง
                        alt="" // alt ว่าง เพราะเป็นรูปตกแต่งเล็ก ๆ
                        className="h-8 w-8 rounded object-cover ring-1 ring-black/10" // รูปขนาดเล็ก 8x8 มุมโค้ง มีเส้นกรอบบาง ๆ
                      />
                    )}
                    <span>{p.name}</span> {/* ชื่อสินค้า */}
                    {p.images && p.images.length > 1 && ( // ถ้ามีรูปมากกว่า 1 รูป
                      <span className="text-xs text-black/50">
                        (+{p.images.length - 1}) {/* บอกจำนวนรูปเพิ่ม เช่น (+2) */}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">{p.category}</td> {/* แสดงหมวดหมู่ของสินค้า */}
                <td className="px-3 py-2">{p.price.toLocaleString()}</td> {/* แสดงราคาโดยใส่คอมมาคั่นหลัก */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2"> {/* กลุ่มปุ่มจัดการ (แก้ไข/ลบ) */}
                    <button
                      onClick={() => onEdit(p)} // เมื่อคลิกให้เรียก onEdit พร้อมส่ง object สินค้าทั้งตัวไปแก้ไข
                      className="rounded-md bg-black px-3 py-1 text-white shadow hover:opacity-90" // สไตล์ปุ่มแก้ไข
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => { // จัดการเมื่อกดปุ่มลบ
                        if (confirm(`ลบสินค้า ${p.name}?`)) onDelete(p.id); // แสดงกล่อง confirm และถ้าตอบตกลงเรียก onDelete ด้วย id
                      }}
                      className="rounded-md bg-white px-3 py-1 shadow ring-1 ring-red-300 hover:bg-red-50" // สไตล์ปุ่มลบ มีกรอบสีแดงจาง ๆ
                    >
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && ( // ถ้าหลังกรองไม่เหลือสินค้าเลย
              <tr>
                <td className="px-3 py-6 text-center text-black/50" colSpan={5}> {/* แสดงข้อความ "ไม่พบรายการ" ครอบทั้ง 5 คอลัมน์ */}
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
