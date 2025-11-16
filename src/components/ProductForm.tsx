// src/components/ProductForm.tsx // ไฟล์ฟอร์มเพิ่ม/แก้ไขสินค้า
import React, { useEffect, useRef, useState } from "react"; // นำเข้า React hooks ที่ใช้: useEffect, useRef, useState
import { type Product } from "../types/product"; // นำเข้า type Product เพื่อใช้กำหนดโครงสร้างฟอร์ม
import { uploadImageToCloudinary } from "../services/cloudinary"; // ฟังก์ชันอัปโหลดรูปไป Cloudinary

type Props = {
  initial?: Product | null;     // ถ้ามีค่า → อยู่ในโหมดแก้ไขสินค้า
  categories: string[];         // รายการหมวดหมู่ที่เลือกได้ (ใช้ใน select)
  onSubmit: (p: Product, isEdit: boolean) => void; // ✅ ฟังก์ชันส่งข้อมูลสินค้าออกไป พร้อมบอกว่าเป็นโหมด edit หรือ add
  onCancel?: () => void;        // ฟังก์ชันเมื่อกดยกเลิก (เฉพาะตอนแก้ไข)
}; // จบ type Props

export default function ProductForm({ initial, categories, onSubmit, onCancel }: Props) { // คอมโพเนนต์ฟอร์มสินค้า รับ props ตามด้านบน
  const [form, setForm] = useState<Product>({ // state หลักเก็บข้อมูลฟอร์มสินค้า
    id: 0,                                    // รหัสสินค้าเริ่มต้น (0 = ยังไม่ได้ตั้ง)
    name: "",                                 // ชื่อสินค้า
    price: 0,                                 // ราคาสินค้า
    category: categories[0] || "",            // หมวดหมู่เริ่มต้น คือค่าตัวแรกใน categories
    storeLink: "",                            // ลิงก์ร้านค้า (ยังว่าง)
    description: "",                          // รายละเอียด (ยังว่าง)
    authentic: false,                         // สถานะสินค้าแท้ (default = false)
    images: [],                               // รายการรูปภาพ (URL)
    isFavorite: false,                        // สถานะ favorite (ของผู้ใช้) default = false
  }); // ปิด useState form

  const [uploading, setUploading] = useState(false); // state บอกว่ากำลังอัปโหลดรูปอยู่หรือไม่
  const [fileNames, setFileNames] = useState<string[]>([]); // เก็บชื่อไฟล์รูปที่ผู้ใช้เลือก (เพื่อแสดงให้เห็น)
  const fileRef = useRef<HTMLInputElement | null>(null); // ref ไปยัง input type="file" เพื่อใช้เคลียร์ค่า

  const guessNameFromUrl = (url: string) => { // ฟังก์ชันเดาชื่อไฟล์จาก URL (ใช้ตอน initial มีรูปอยู่แล้ว)
    try {
      const u = new URL(url); // พยายามแปลง string เป็น URL object
      const last = decodeURIComponent(u.pathname.split("/").pop() || ""); // ดึง segment สุดท้ายจาก path แล้ว decode
      return last || "image"; // ถ้าไม่มีค่า ให้ใช้คำว่า "image"
    } catch {
      const parts = url.split("?")[0].split("/"); // ถ้า new URL ล้มเหลว ใช้วิธี split เอง (ตัด query string ทิ้ง)
      return decodeURIComponent(parts.pop() || "image"); // ดึงตัวท้ายสุดเป็นชื่อไฟล์
    }
  }; // ปิด guessNameFromUrl

  useEffect(() => { // effect ใช้ sync ฟอร์มเมื่อ initial หรือ categories เปลี่ยน
    if (initial) { // ถ้ามี initial → โหมดแก้ไข
      setForm(initial); // ใส่ค่าจาก initial ลงฟอร์มทั้งหมด
      if (Array.isArray(initial.images) && initial.images.length > 0) { // ถ้าสินค้ามีรูปเดิมอยู่
        setFileNames((prev) => // สร้างรายชื่อไฟล์จาก URL (ใช้เดาจาก URL ถ้าไม่มีชื่อเก่า)
          initial.images.map((url, i) => prev[i] || guessNameFromUrl(url)) // ถ้าเคยมีชื่อใน prev ตำแหน่งเดียวกันใช้ต่อ ไม่งั้นเดาจาก URL
        );
      }
    } else { // ถ้าไม่มี initial → โหมดเพิ่มสินค้าใหม่
      // เคลียร์ฟอร์มเมื่อออกจากโหมดแก้ไข
      setForm((s) => ({ // รีเซ็ตค่าใน form
        ...s,                                             // ใช้ค่าเดิมที่อาจจำเป็น (ถ้ามี)
        id: 0,                                            // ตั้ง id กลับเป็น 0
        name: "",                                         // ล้างชื่อสินค้า
        price: 0,                                         // ล้างราคา
        category: categories[0] || "",                    // ตั้งหมวดหมู่กลับเป็นตัวแรกใน list
        storeLink: "",                                    // ล้างลิงก์ร้านค้า
        description: "",                                  // ล้างรายละเอียด
        authentic: false,                                 // ล้างสถานะสินค้าแท้
        images: [],                                       // ล้างรายการรูป
        isFavorite: false,                                // ล้างสถานะ favorite
      }));
      setFileNames([]);                                   // ล้างรายการชื่อไฟล์
      if (fileRef.current) fileRef.current.value = "";   // เคลียร์ค่า input file
    }
  }, [initial, categories]); // ถ้า initial หรือ categories เปลี่ยนให้รัน effect ใหม่

  function update<K extends keyof Product>(key: K, val: Product[K]) { // ฟังก์ชันอัปเดตฟิลด์ใน form แบบ generic
    setForm((s) => ({ ...s, [key]: val })); // สร้าง object ใหม่โดยแก้เฉพาะฟิลด์ที่ต้องการ
  } // ปิดฟังก์ชัน update

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) { // ฟังก์ชันจัดการเมื่อเลือกไฟล์รูปภาพ
    const files = e.target.files; // ได้ FileList มาจาก input
    if (!files || files.length === 0) return; // ถ้าไม่มีไฟล์ให้จบฟังก์ชัน

    const list = Array.from(files).filter((f) => f.type.startsWith("image/")); // กรองเอาเฉพาะไฟล์ที่เป็น image/*
    if (list.length === 0) { // ถ้าไม่มีไฟล์รูปที่ถูกต้องเลย
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น"); // แจ้งเตือนผู้ใช้
      if (fileRef.current) fileRef.current.value = ""; // เคลียร์ค่า input file
      return;
    }

    setFileNames((prev) => [...prev, ...list.map((f) => f.name)]); // เพิ่มชื่อไฟล์ที่เลือกไว้ไปต่อท้ายรายการเดิม

    setUploading(true); // ตั้งสถานะว่ากำลังอัปโหลดรูป
    try {
      const urls: string[] = []; // array เก็บ URL ที่ได้จาก Cloudinary
      for (const f of list) { // loop อัปโหลดทีละไฟล์
        const url = await uploadImageToCloudinary(f); // อัปโหลดไป Cloudinary
        if (url) urls.push(url); // ถ้าได้ URL กลับมาให้เก็บลง array
      }
      if (urls.length === 0) { // ถ้าอัปโหลดไม่สำเร็จทุกไฟล์
        alert("อัปโหลดรูปไม่สำเร็จ"); // แจ้งผู้ใช้
        setFileNames((prev) => prev.slice(0, prev.length - list.length)); // ลบชื่อไฟล์ที่เพิ่งเพิ่มออก
      } else {
        setForm((s) => ({ ...s, images: [...s.images, ...urls] })); // เพิ่ม URL รูปใหม่เข้า state form ต่อท้ายของเดิม
      }
    } catch { // ถ้ามี error ระหว่างอัปโหลด
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูป"); // แจ้งเตือนผู้ใช้
      setFileNames((prev) => prev.slice(0, prev.length - list.length)); // ลบชื่อไฟล์ที่เพิ่งเพิ่ม
    } finally {
      setUploading(false); // ปิดสถานะ uploading
      if (fileRef.current) fileRef.current.value = ""; // เคลียร์ input file
    }
  } // ปิดฟังก์ชัน handleImages

  function removeImage(idx: number) { // ฟังก์ชันลบรูปภาพตาม index
    setForm((s) => ({ ...s, images: s.images.filter((_, i) => i !== idx) })); // ลบ URL รูปออกจาก form.images
    setFileNames((names) => names.filter((_, i) => i !== idx)); // ลบชื่อไฟล์ออกจาก fileNames
  } // ปิดฟังก์ชัน removeImage

  function submit(e: React.FormEvent) { // ฟังก์ชัน submit ฟอร์มสินค้า
    e.preventDefault(); // กันไม่ให้หน้า reload

    if (!form.name.trim()) { // ถ้ายังไม่กรอกชื่อสินค้า
      alert("กรุณากรอกชื่อสินค้า"); // แจ้งเตือน
      return;
    }
    if (!initial && (!form.id || form.id < 1)) { // ถ้าเป็นโหมดเพิ่ม (ไม่มี initial) และ id ไม่ถูกต้อง
      alert("กรุณากรอกรหัสสินค้า (id)"); // แจ้งเตือน
      return;
    }
    if (form.images.length === 0) { // ถ้ายังไม่มีรูปเลย
      alert("กรุณาอัปโหลดรูปอย่างน้อย 1 รูป"); // แจ้งเตือน
      return;
    }
    if (uploading) { // ถ้ายังอัปโหลดรูปไม่เสร็จ
      alert("กำลังอัปโหลดรูป กรุณารอก่อนบันทึก"); // แจ้งให้รอ
      return;
    }

    const payload: Product = { // เตรียม payload สุดท้ายตาม type Product
      ...form, // เอาข้อมูลจาก form ทั้งหมดมาก่อน
      id: Number(form.id), // แปลง id ให้เป็น number แน่ ๆ
      price: Number(form.price) || 0, // แปลงราคาเป็น number ถ้า NaN ให้เป็น 0
    };

    onSubmit(payload, !!initial); // ✅ เรียก onSubmit พร้อมบอก isEdit = true ถ้ามี initial

    // ถ้าเป็นโหมดเพิ่ม → เคลียร์ฟอร์ม
    if (!initial) { // แปลว่าไม่ใช่โหมดแก้ไข
      setForm({ // รีเซ็ตฟอร์มกลับค่าเริ่มต้น
        id: 0,
        name: "",
        price: 0,
        category: categories[0] || "",
        storeLink: "",
        description: "",
        authentic: false,
        images: [],
        isFavorite: false,
      });
      if (fileRef.current) fileRef.current.value = ""; // เคลียร์ input file
      setFileNames([]); // ลบชื่อไฟล์ที่แสดง
    }
  } // ปิดฟังก์ชัน submit

  return (
    <form
      onSubmit={submit} // เมื่อ submit ฟอร์มให้ใช้ฟังก์ชัน submit ที่เราสร้าง
      className="mb-4 rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10" // สไตล์กล่องฟอร์มสินค้า
    >
      <h3 className="mb-3 text-base font-bold">
        {initial ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"} {/*เปลี่ยนหัวข้อฟอร์มตามโหมด (แก้ไข/เพิ่มใหม่)*/}
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"> {/* layout ฟอร์ม 2 คอลัมน์บนจอ sm ขึ้นไป */}
        <div className="space-y-2">
          <label className="block text-sm">รหัสสินค้า / id</label> {/* label input id */}
          <input
            type="number" // input ตัวเลข
            inputMode="numeric" // โหมดตัวเลข (ช่วยบนมือถือ)
            min={1} // id ขั้นต่ำ = 1
            step={1} // เพิ่มทีละ 1
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2" // สไตล์กล่อง input
            value={initial ? initial.id : form.id || ""} // ถ้าโหมดแก้ไขใช้ id เดิมจาก initial ถ้าไม่ใช้จาก form
            onChange={(e) => {
              const v = Number(e.target.value); // แปลงค่าจาก input เป็น number
              update("id", Number.isFinite(v) ? v : 0); // ถ้าเป็น NaN ให้ใช้ 0
            }}
            placeholder="เช่น 101" // ตัวอย่างค่าที่ต้องกรอก
            disabled={!!initial} // ถ้าโหมดแก้ไข จะล็อก id ไม่ให้แก้
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm">ชื่อสินค้า</label> {/* label ชื่อสินค้า */}
          <input
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.name} // ชื่อสินค้าจาก state
            onChange={(e) => update("name", e.target.value)} // อัปเดตฟิลด์ name เมื่อพิมพ์
            placeholder="เช่น Luxury Watch" // ตัวอย่างชื่อสินค้า
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm">ราคา</label> {/* label ราคา */}
          <input
            type="number" // input แบบตัวเลข
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.price} // ราคาใน state
            onChange={(e) => update("price", Number(e.target.value))} // แปลงเป็น number แล้วอัปเดต
            placeholder="เช่น 1290" // ตัวอย่างราคา
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm">หมวดหมู่</label> {/* label หมวดหมู่ */}
          <select
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.category} // category ปัจจุบัน
            onChange={(e) => update("category", e.target.value)} // เปลี่ยนหมวดเมื่อเลือก option ใหม่
          >
            {categories.map((c) => ( // map หมวดหมู่แต่ละอันเป็น option
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm">ลิงก์ร้านค้า (storelink)</label> {/* label ลิงก์ร้าน */}
          <input
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.storeLink || ""} // ค่า storeLink (ถ้า falsy ให้เป็น empty string)
            onChange={(e) => update("storeLink", e.target.value)} // อัปเดต storeLink
            placeholder="https://…" // ตัวอย่างลิงก์ร้าน
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm">รายละเอียด</label> {/* label รายละเอียดสินค้า */}
          <textarea
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            rows={3} // แสดงสูงประมาณ 3 แถว
            value={form.description || ""} // รายละเอียด (หรือ "" ถ้าไม่มี)
            onChange={(e) => update("description", e.target.value)} // อัปเดต description
            placeholder="คำอธิบายสินค้า…" // placeholder อธิบายว่าควรพิมพ์อะไร
          />
        </div>

        {/* อัปโหลดรูปหลายรูป */}
        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm">
            อัปโหลดรูปภาพ (ได้หลายรูป){" "}
            {uploading && (
              <span className="text-xs text-blue-600">(กำลังอัปโหลด…)</span> // แสดงข้อความสถานะกำลังอัปโหลด
            )}
          </label>
          <input
            ref={fileRef} // ผูก ref เพื่อใช้เคลียร์ค่า
            type="file" // input เลือกไฟล์
            accept="image/*" // รับเฉพาะไฟล์รูปภาพ
            multiple // เลือกได้หลายไฟล์
            onChange={handleImages} // จัดการอัปโหลดเมื่อเลือกไฟล์
            disabled={uploading} // ถ้ากำลังอัปโหลดอยู่ให้ disable ป้องกันการกดซ้ำ
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
          />

          {fileNames.length > 0 && (
            <div className="text-xs text-black/70">
              ไฟล์ที่เพิ่มแล้ว:{" "}
              <span className="font-medium">{fileNames.join(", ")}</span> {/* แสดงชื่อไฟล์ทั้งหมดที่เพิ่ม */}
            </div>
          )}

          {form.images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6"> {/* แสดงตัวอย่างรูปเป็นกริด */}
              {form.images.map((src, i) => (
                <div key={i} className="relative">
                  <img
                    src={src}
                    className="h-24 w-full rounded-lg object-cover ring-1 ring-black/10" // ตัวอย่างรูปแต่ละรูป
                    alt={`img-${i}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)} // กดเพื่อลบรูปที่ตำแหน่ง i
                    className="absolute right-1 top-1 rounded bg-white/90 px-1 text-xs shadow ring-1 ring-black/10"
                    title="ลบรูปนี้"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="sm:col-span-2 inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!form.authentic} // แปลงค่าเป็น boolean เพื่อให้ checkbox ทำงานถูกต้อง
            onChange={(e) => update("authentic", e.target.checked)} // เปลี่ยนค่าสินค้าแท้เมื่อคลิก
          />
          <span className="text-sm">สินค้าแบรนด์แท้</span> {/* ข้อความกำกับ checkbox */}
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={uploading} // ถ้ายังอัปโหลดรูปไม่เสร็จห้ามกด submit
          className="rounded-md bg-black px-4 py-2 text-white shadow hover:opacity-90 disabled:opacity-70"
          title={uploading ? "กำลังอัปโหลดรูป" : ""} // tooltip เมื่อปุ่มถูก disable เพราะกำลังอัปโหลด
        >
          {initial ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"} {/* เปลี่ยนข้อความปุ่มตามโหมด */}
        </button>
        {initial && onCancel && (
          <button
            type="button"
            onClick={onCancel} // กดเพื่อยกเลิกการแก้ไข แล้วให้ parent จัดการต่อ
            className="rounded-md bg-white px-4 py-2 shadow ring-1 ring-black/10"
          >
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
}
