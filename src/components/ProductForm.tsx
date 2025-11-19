import React, { useEffect, useRef, useState } from "react"; // ใช้ useState/useEffect/useRef จัดการ state, lifecycle และ input file
import { type Product } from "../types/product"; // type Product กำหนดรูปแบบข้อมูลสินค้าที่ฟอร์มนี้จะสร้าง/แก้ไข
import { uploadImageToCloudinary } from "../services/cloudinary"; // ฟังก์ชันอัปโหลดรูปไปยัง Cloudinary แล้วคืนค่า URL กลับมา

// Props ที่ฟอร์มนี้รับจากภายนอก
// initial : ถ้ามี แสดงว่าอยู่โหมดแก้ไข (edit) และมีข้อมูลเดิมของสินค้า
// categories : รายการหมวดหมู่ที่เลือกได้ใน <select>
// onSubmit : callback ส่งข้อมูล Product ออกไปให้ parent พร้อม flag isEdit
// onCancel : ใช้กดยกเลิกตอนอยู่โหมดแก้ไข
type Props = {
  initial?: Product | null;
  categories: string[];
  onSubmit: (p: Product, isEdit: boolean) => void;
  onCancel?: () => void;
};

export default function ProductForm({
  initial,
  categories,
  onSubmit,
  onCancel,
}: Props) {
  // state หลักเก็บข้อมูลฟิลด์ของสินค้าในฟอร์ม
  const [form, setForm] = useState<Product>({
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

  // state ที่เกี่ยวกับรูปภาพ
  // uploading : true ระหว่างกำลังอัปโหลดรูป (ใช้ปิดปุ่มไม่ให้กดซ้ำ)
  // fileNames : รายชื่อไฟล์รูปที่ผู้ใช้เลือกไว้ แสดงเป็นข้อความด้านล่าง input
  const [uploading, setUploading] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null); // ref สำหรับเคลียร์ค่า input[type=file]

  // ฟังก์ชันเดาชื่อไฟล์จาก URL (ใช้กรณีแก้ไข แล้วสินค้ามีรูปเดิมอยู่)
  const guessNameFromUrl = (url: string) => {
    try {
      const u = new URL(url);
      const last = decodeURIComponent(u.pathname.split("/").pop() || "");
      return last || "image";
    } catch {
      const parts = url.split("?")[0].split("/");
      return decodeURIComponent(parts.pop() || "image");
    }
  };

  // เมื่อ props.initial หรือ categories เปลี่ยน:
  // ถ้ามี initial โหมดแก้ไข: เติมค่าจาก initial เข้าฟอร์ม
  // ถ้าไม่มี initial โหมดเพิ่มใหม่: reset ฟอร์มกลับเป็นค่าเริ่มต้น
  useEffect(() => {
    if (initial) {
      // โหมดแก้ไข
      setForm(initial);

      // ถ้ามีรูปเดิม ให้เดาชื่อไฟล์จาก URL เพื่อแสดงใน fileNames
      if (Array.isArray(initial.images) && initial.images.length > 0) {
        setFileNames((prev) =>
          initial.images.map(
            (url, i) => prev[i] || guessNameFromUrl(url)
          )
        );
      }
    } else {
      // โหมดเพิ่มสินค้าใหม่: เคลียร์ฟอร์ม
      setForm((s) => ({
        ...s,
        id: 0,
        name: "",
        price: 0,
        category: categories[0] || "",
        storeLink: "",
        description: "",
        authentic: false,
        images: [],
        isFavorite: false,
      }));
      setFileNames([]);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [initial, categories]);

  // ฟังก์ชันช่วยอัปเดตฟิลด์ใดฟิลด์หนึ่งใน form (generic ตาม key)
  function update<K extends keyof Product>(key: K, val: Product[K]) {
    setForm((s) => ({ ...s, [key]: val }));
  }

  // จัดการตอนผู้ใช้เลือกไฟล์รูปภาพ
  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // กรองเอาเฉพาะไฟล์ที่เป็น image/*
    const list = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (list.length === 0) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    // เพิ่มชื่อไฟล์ใหม่เข้าไปใน state ไว้ให้ผู้ใช้เห็น
    setFileNames((prev) => [...prev, ...list.map((f) => f.name)]);

    setUploading(true);
    try {
      const urls: string[] = [];

      // อัปโหลดทีละไฟล์ไป Cloudinary แล้วเก็บ URL กลับมา
      for (const f of list) {
        const url = await uploadImageToCloudinary(f);
        if (url) urls.push(url);
      }

      // ถ้าไม่มี URL สำเร็จเลย แสดงว่าอัปโหลดไม่สำเร็จ
      if (urls.length === 0) {
        alert("อัปโหลดรูปไม่สำเร็จ");
        setFileNames((prev) => prev.slice(0, prev.length - list.length));
      } else {
        // ถ้าอัปโหลดสำเร็จอย่างน้อย 1 รูป → ต่อรูปใหม่เข้า form.images
        setForm((s) => ({ ...s, images: [...s.images, ...urls] }));
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูป");
      setFileNames((prev) => prev.slice(0, prev.length - list.length));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // ลบรูปภาพออกจากฟอร์มตาม index ที่ส่งมา
  function removeImage(idx: number) {
    setForm((s) => ({
      ...s,
      images: s.images.filter((_, i) => i !== idx),
    }));
    setFileNames((names) =>
      names.filter((_, i) => i !== idx)
    );
  }

  // ฟังก์ชันหลักสำหรับ submit ฟอร์ม
  function submit(e: React.FormEvent) {
    e.preventDefault();

    // เช็คความครบถ้วนของข้อมูลขั้นต่ำที่จำเป็น
    if (!form.name.trim()) {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }
    // โหมดเพิ่มสินค้า: ต้องมี id ที่เป็นเลขบวก
    if (!initial && (!form.id || form.id < 1)) {
      alert("กรุณากรอกรหัสสินค้า (id)");
      return;
    }
    if (form.images.length === 0) {
      alert("กรุณาอัปโหลดรูปอย่างน้อย 1 รูป");
      return;
    }
    if (uploading) {
      alert("กำลังอัปโหลดรูป กรุณารอก่อนบันทึก");
      return;
    }

    // สร้าง payload ตาม type Product ที่จะส่งออกไป
    const payload: Product = {
      ...form,
      id: Number(form.id),
      price: Number(form.price) || 0,
    };

    // ส่งข้อมูลออกไปให้ parent พร้อมบอกว่าเป็นโหมด edit หรือ add
    onSubmit(payload, !!initial);

    // ถ้าเป็นโหมดเพิ่ม ไม่ใช่แก้ไข รีเซ็ตฟอร์ม
    if (!initial) {
      setForm({
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
      if (fileRef.current) fileRef.current.value = "";
      setFileNames([]);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mb-4 rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10"
    >
      <h3 className="mb-3 text-base font-bold">
        {initial ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
      </h3>

      {/* layout ฟอร์ม 2 คอลัมน์ในหน้าจอ sm ขึ้นไป */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* ฟิลด์ id สินค้า */}
        <div className="space-y-2">
          <label className="block text-sm">รหัสสินค้า / id</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={initial ? initial.id : form.id || ""}
            onChange={(e) => {
              const v = Number(e.target.value);
              update("id", Number.isFinite(v) ? v : 0);
            }}
            placeholder="เช่น 101"
            disabled={!!initial} // ถ้าเป็นโหมดแก้ไข ไม่อนุญาตให้แก้ id
          />
        </div>

        {/* ฟิลด์ชื่อสินค้า */}
        <div className="space-y-2">
          <label className="block text-sm">ชื่อสินค้า</label>
          <input
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="เช่น Luxury Watch"
          />
        </div>

        {/* ฟิลด์ราคา */}
        <div className="space-y-2">
          <label className="block text-sm">ราคา</label>
          <input
            type="number"
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.price}
            onChange={(e) => update("price", Number(e.target.value))}
            placeholder="เช่น 1290"
          />
        </div>

        {/* ฟิลด์หมวดหมู่ */}
        <div className="space-y-2">
          <label className="block text-sm">หมวดหมู่</label>
          <select
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* ฟิลด์ลิงก์ร้านค้า */}
        <div className="space-y-2 sm:col-span-2">
          <label className="block text-sm">
            ลิงก์ร้านค้า (storelink)
          </label>
          <input
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.storeLink || ""}
            onChange={(e) => update("storeLink", e.target.value)}
            placeholder="https://…"
          />
        </div>

        {/* ฟิลด์รายละเอียดสินค้า */}
        <div className="space-y-2 sm:col-span-2">
          <label className="block text-sm">รายละเอียด</label>
          <textarea
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            rows={3}
            value={form.description || ""}
            onChange={(e) => update("description", e.target.value)}
            placeholder="คำอธิบายสินค้า…"
          />
        </div>

        {/* ส่วนอัปโหลดรูปหลายรูป */}
        <div className="space-y-2 sm:col-span-2">
          <label className="block text-sm">
            อัปโหลดรูปภาพ (ได้หลายรูป){" "}
            {uploading && (
              <span className="text-xs text-blue-600">
                (กำลังอัปโหลด…)
              </span>
            )}
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            disabled={uploading}
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
          />

          {/* แสดงรายชื่อไฟล์ที่เพิ่มแล้ว */}
          {fileNames.length > 0 && (
            <div className="text-xs text-black/70">
              ไฟล์ที่เพิ่มแล้ว:{" "}
              <span className="font-medium">
                {fileNames.join(", ")}
              </span>
            </div>
          )}

          {/* แสดงตัวอย่างรูปภาพที่เลือก/อัปโหลดแล้ว */}
          {form.images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {form.images.map((src, i) => (
                <div key={i} className="relative">
                  <img
                    src={src}
                    className="h-24 w-full rounded-lg object-cover ring-1 ring-black/10"
                    alt={`img-${i}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
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

        {/* checkbox สำหรับระบุว่าสินค้าเป็นแบรนด์แท้หรือไม่ */}
        <label className="inline-flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={!!form.authentic}
            onChange={(e) => update("authentic", e.target.checked)}
          />
          <span className="text-sm">สินค้าแบรนด์แท้</span>
        </label>
      </div>

      {/* ปุ่มบันทึก + ปุ่มยกเลิก (เฉพาะโหมดแก้ไข) */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={uploading}
          className="rounded-md bg-black px-4 py-2 text-white shadow hover:opacity-90 disabled:opacity-70"
          title={uploading ? "กำลังอัปโหลดรูป" : ""}
        >
          {initial ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
        </button>

        {initial && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-white px-4 py-2 shadow ring-1 ring-black/10"
          >
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
}
