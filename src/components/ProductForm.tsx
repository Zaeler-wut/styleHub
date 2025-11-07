// src/components/ProductForm.tsx
import React, { useEffect, useRef, useState } from "react";
import { type Product } from "../types/product";
import { uploadImageToCloudinary } from "../services/cloudinary";

type Props = {
  initial?: Product | null;     // ถ้ามี => โหมดแก้ไข
  categories: string[];
  onSubmit: (p: Product, isEdit: boolean) => void; // ✅ ส่ง isEdit ออกไปชัดเจน
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
    images: [],
    isFavorite: false,
  });

  const [uploading, setUploading] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

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
      if (Array.isArray(initial.images) && initial.images.length > 0) {
        setFileNames((prev) =>
          initial.images.map((url, i) => prev[i] || guessNameFromUrl(url))
        );
      }
    } else {
      // เคลียร์ฟอร์มเมื่อออกจากโหมดแก้ไข
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

  function update<K extends keyof Product>(key: K, val: Product[K]) {
    setForm((s) => ({ ...s, [key]: val }));
  }

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

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
        setFileNames((prev) => prev.slice(0, prev.length - list.length));
      } else {
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

  function removeImage(idx: number) {
    setForm((s) => ({ ...s, images: s.images.filter((_, i) => i !== idx) }));
    setFileNames((names) => names.filter((_, i) => i !== idx));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }
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

    const payload: Product = {
      ...form,
      id: Number(form.id),
      price: Number(form.price) || 0,
    };

    onSubmit(payload, !!initial); // ✅ บอกให้ชัดว่าเป็น add หรือ edit

    // ถ้าเป็นโหมดเพิ่ม → เคลียร์ฟอร์ม
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              <option key={c} value={c}>
                {c}
              </option>
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

        {/* อัปโหลดรูปหลายรูป */}
        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm">
            อัปโหลดรูปภาพ (ได้หลายรูป){" "}
            {uploading && (
              <span className="text-xs text-blue-600">(กำลังอัปโหลด…)</span>
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

          {fileNames.length > 0 && (
            <div className="text-xs text-black/70">
              ไฟล์ที่เพิ่มแล้ว:{" "}
              <span className="font-medium">{fileNames.join(", ")}</span>
            </div>
          )}

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

        <label className="sm:col-span-2 inline-flex items-center gap-2">
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
