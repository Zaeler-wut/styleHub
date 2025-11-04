import React, { useEffect, useRef, useState } from "react";
import { type Product } from "../types/product";

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
    images: [],          // หลายใบ
    isFavorite: false,
  });

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  function update<K extends keyof Product>(key: K, val: Product[K]) {
    setForm((s) => ({ ...s, [key]: val }));
  }

  // อ่านหลายไฟล์เป็น DataURL
  async function filesToDataURLs(files: FileList): Promise<string[]> {
    const readers = Array.from(files).map(
      (f) =>
        new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(String(r.result || ""));
          r.onerror = rej;
          r.readAsDataURL(f);
        })
    );
    return Promise.all(readers);
  }

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const urls = await filesToDataURLs(files);
    setForm((s) => ({ ...s, images: [...s.images, ...urls] }));
  }

  function removeImage(idx: number) {
    setForm((s) => ({ ...s, images: s.images.filter((_, i) => i !== idx) }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!initial && (!form.id || form.id < 1)) return; // เพิ่มใหม่ต้องมี id
    if (form.images.length === 0) {
      alert("กรุณาอัปโหลดรูปอย่างน้อย 1 รูป");
      return;
    }
    onSubmit({
      ...form,
      price: Number(form.price) || 0,
      id: Number(form.id),
    });
    // ถ้าเป็นโหมดเพิ่ม → เคลียร์
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
            disabled={!!initial}   // แก้ไข: ไม่ให้เปลี่ยน id
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

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm">อัปโหลดรูปภาพ (ได้หลายรูป)</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
          />
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
          className="rounded-md bg-black px-4 py-2 text-white shadow hover:opacity-90"
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
