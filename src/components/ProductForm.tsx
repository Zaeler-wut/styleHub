// src/components/ProductForm.tsx
import React, { useEffect, useRef, useState } from "react";
import { type Product } from "../types/product";
import { uploadImageToCloudinary } from "../services/cloudinary";

type Props = {
  initial?: Product | null;     // ถ้ามี => โหมดแก้ไข
  categories: string[];
  onSubmit: (p: Product) => void;
  onCancel?: () => void;
};

export default function ProductForm({ initial, categories, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    category: categories[0] || "",
    storeLink: "",
    description: "",
    authentic: false,
    images: [],          // URL จาก Cloudinary
    isFavorite: false,
  });

  const [uploading, setUploading] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]); // ✅ ค้างชื่อไฟล์ไว้หลังอัปโหลด
  const fileRef = useRef<HTMLInputElement | null>(null);

  // เดาชื่อไฟล์จาก URL (กรณี initial มีรูปอยู่แล้ว)
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

  useEffect(() => {
    if (initial) {
      setForm(initial);
      // ถ้ามีรูปอยู่แล้วแต่ไม่มีชื่อไฟล์ → เดาจาก URL
      if (Array.isArray(initial.images) && initial.images.length > 0) {
        setFileNames((prev) =>
          initial.images.map((url, i) => prev[i] || guessNameFromUrl(url))
        );
      }
    }
  }, [initial]);

  function update<K extends keyof Product>(key: K, val: Product[K]) {
    setForm((s) => ({ ...s, [key]: val }));
  }

  // ✅ อัปโหลดหลายไฟล์ขึ้น Cloudinary + เก็บชื่อไฟล์ให้ค้างอยู่
  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    // โชว์ชื่อไฟล์ที่ “เพิ่มเข้าไปใหม่” ทับกับของเดิม
    setFileNames((prev) => [...prev, ...list.map((f) => f.name)]);

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of list) {
        const url = await uploadImageToCloudinary(f);
        if (url) urls.push(url);
      }
      if (urls.length === 0) {
        alert("อัปโหลดรูปไม่สำเร็จ");
        // ย้อนคืนชื่อไฟล์ที่เพิ่งใส่ (เพราะอัปโหลดไม่สำเร็จ)
        setFileNames((prev) => prev.slice(0, prev.length - list.length));
      } else {
        setForm((s) => ({ ...s, images: [...s.images, ...urls] }));
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูป");
      // ย้อนคืนชื่อไฟล์
      setFileNames((prev) => prev.slice(0, prev.length - list.length));
    } finally {
      setUploading(false);
      // ล้างค่า input เพื่อให้เลือกไฟล์ซ้ำชื่อเดิมได้
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(idx: number) {
    setForm((s) => ({ ...s, images: s.images.filter((_, i) => i !== idx) }));
    setFileNames((names) => names.filter((_, i) => i !== idx)); // ✅ ลบชื่อไฟล์คู่กัน
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { alert("กรุณากรอกชื่อสินค้า"); return; }
    if (!initial && (!form.id || form.id < 1)) { alert("กรุณากรอกรหัสสินค้า (id)"); return; }
    if (form.images.length === 0) { alert("กรุณาอัปโหลดรูปอย่างน้อย 1 รูป"); return; }
    if (uploading) { alert("กำลังอัปโหลดรูป กรุณารอก่อนบันทึก"); return; }

    onSubmit({
      ...form,
      price: Number(form.price) || 0,
      id: Number(form.id),
    });

    // ถ้าเป็นโหมดเพิ่ม → เคลียร์ฟอร์มและชื่อไฟล์
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
      className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10 mb-4"
    >
      <h3 className="mb-3 text-base font-bold">
        {initial ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm">รหัสสินค้า / id</label>
          <input
            type="number"
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.id}
            onChange={(e) => update("id", Number(e.target.value))}
            placeholder="เช่น 101"
            disabled={!!initial}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm">ชื่อสินค้า</label>
          <input
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="เช่น Luxury Watch"
          />
        </div>

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

        <div className="space-y-2">
          <label className="block text-sm">หมวดหมู่</label>
          <select
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm">ลิงก์ร้านค้า (storelink)</label>
          <input
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.storeLink || ""}
            onChange={(e) => update("storeLink", e.target.value)}
            placeholder="https://…"
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm">รายละเอียด</label>
          <textarea
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            rows={3}
            value={form.description || ""}
            onChange={(e) => update("description", e.target.value)}
            placeholder="คำอธิบายสินค้า…"
          />
        </div>

        {/* ✅ อัปโหลดรูปหลายรูปขึ้น Cloudinary + แสดงชื่อไฟล์คงอยู่ */}
        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm">
            อัปโหลดรูปภาพ (ได้หลายรูป) {uploading && <span className="text-xs text-blue-600">(กำลังอัปโหลด…)</span>}
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

          {/* รายชื่อไฟล์ที่เพิ่มเข้ามา (ค้างอยู่) */}
          {fileNames.length > 0 && (
            <div className="text-xs text-black/70">
              ไฟล์ที่เพิ่มแล้ว: <span className="font-medium">{fileNames.join(", ")}</span>
            </div>
          )}

          {/* preview */}
          {form.images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-2">
              {form.images.map((src, i) => (
                <div key={i} className="relative">
                  <img
                    src={src}
                    className="h-24 w-full object-cover rounded-lg ring-1 ring-black/10"
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

        <label className="inline-flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={!!form.authentic}
            onChange={(e) => update("authentic", e.target.checked)}
          />
          <span className="text-sm">สินค้าแบรนด์แท้</span>
        </label>
      </div>

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
