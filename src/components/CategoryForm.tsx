// src/components/CategoryForm.tsx
import React, { useEffect, useRef, useState } from "react";
import { type Category } from "../types/category";

type Props = {
  onAdd: (c: Category) => void;
  initial?: Category;                                   // ← ใช้พรีฟิลเวลาแก้ไข
  onSubmitEdit?: (c: Category) => void;                // ← บันทึกตอนแก้ไข
  onCancelEdit?: () => void;                           // ← ยกเลิกแก้ไข
};

export default function CategoryForm({
  onAdd,
  initial,
  onSubmitEdit,
  onCancelEdit,
}: Props) {
  const isEdit = !!initial && !!onSubmitEdit;

  const [displayName, setDisplayName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [image, setImage] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState<{ name?: boolean; id?: boolean; img?: boolean }>({});

  const fileRef = useRef<HTMLInputElement | null>(null);

  // พรีฟิลเมื่อ initial เปลี่ยน (เข้าโหมดแก้ไข)
  useEffect(() => {
    if (isEdit && initial) {
      setDisplayName(initial.name || "");
      setSlug(initial.id || "");
      setSlugEdited(true);                  // ผู้ใช้เคยมี id แล้ว
      setImage(initial.image);
      setTouched({});
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [isEdit, initial]);

  const toSlug = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handlePickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setTouched((t) => ({ ...t, img: true }));
    if (!f) return;
    const url = await fileToDataURL(f);
    setImage(url);
  }

  function clearImage() {
    setImage(undefined);
    if (fileRef.current) fileRef.current.value = "";
    setTouched((t) => ({ ...t, img: true }));
  }

  function handleChangeDisplayName(v: string) {
    setDisplayName(v);
    setTouched((t) => ({ ...t, name: true }));
    if (!slugEdited) setSlug(toSlug(v));
  }

  function handleChangeSlug(v: string) {
    setSlugEdited(true);
    setSlug(toSlug(v));
    setTouched((t) => ({ ...t, id: true }));
  }

  const idPreview = toSlug(slug || displayName);
  const invalidName = !displayName.trim();
  const invalidId = !idPreview;
  const invalidImg = !image;
  const invalid = invalidName || invalidId || invalidImg;

  function resetForm() {
    setDisplayName("");
    setSlug("");
    setSlugEdited(false);
    setImage(undefined);
    setTouched({});
    if (fileRef.current) fileRef.current.value = "";
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, id: true, img: true });
    if (invalid) return;

    const payload: Category = {
      id: idPreview,
      name: displayName.trim(),
      image,
    };

    if (isEdit && onSubmitEdit) {
      onSubmitEdit(payload);     // ← ส่งกลับไปให้ AdminPage.saveEditCategory
    } else {
      onAdd(payload);            // ← โหมดเพิ่ม
      resetForm();
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10 mb-4"
    >
      <h3 className="mb-3 text-base font-bold">
        {isEdit ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* ชื่อหมวด */}
        <div className="space-y-1">
          <label className="block text-sm">
            ชื่อหมวดหมู่ (ไว้แสดงผล) <span className="text-red-600">*</span>
          </label>
          <input
            className={`w-full rounded-md border bg-white px-3 py-2 ${
              touched.name && invalidName ? "border-red-400 ring-1 ring-red-300" : "border-black/10"
            }`}
            placeholder="เช่น กระเป๋า, เสื้อผ้าผู้ชาย"
            value={displayName}
            onChange={(e) => handleChangeDisplayName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          />
          {touched.name && invalidName && (
            <p className="text-xs text-red-600">กรุณากรอกชื่อหมวดหมู่</p>
          )}
        </div>

        {/* รหัสหมวด (id) */}
        <div className="space-y-1">
          <label className="block text-sm">
            รหัสหมวด (id) <span className="text-red-600">*</span>
          </label>
          <input
            className={`w-full rounded-md border bg-white px-3 py-2 font-mono ${
              touched.id && invalidId ? "border-red-400 ring-1 ring-red-300" : "border-black/10"
            }`}
            placeholder="เช่น bags, clothes-men"
            value={slug}
            onChange={(e) => handleChangeSlug(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, id: true }))}
          />
          <div className="text-xs text-black/60">
            จะบันทึกเป็น:
            <code className="ml-1 rounded bg-black/5 px-1">{idPreview || "—"}</code>
          </div>
          {touched.id && invalidId && (
            <p className="text-xs text-red-600">
              กรุณากรอกรหัสหมวด (ใช้ a-z, 0-9, - เท่านั้น)
            </p>
          )}
        </div>
      </div>

      {/* อัปโหลดรูป */}
      <div className="mt-3 space-y-1">
        <label className="block text-sm">
          อัปโหลดรูปภาพ (1 รูป) <span className="text-red-600">*</span>
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePickImage}
          className={`w-full rounded-md border bg-white px-3 py-2 ${
            touched.img && invalidImg ? "border-red-400 ring-1 ring-red-300" : "border-black/10"
          }`}
          onBlur={() => setTouched((t) => ({ ...t, img: true }))}
        />

        {image && (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={image}
              alt="preview"
              className="h-20 w-20 rounded-lg object-cover ring-1 ring-black/10"
            />
            <button
              type="button"
              onClick={clearImage}
              className="rounded-md bg-white px-3 py-1 shadow ring-1 ring-black/10 hover:bg-red-50"
            >
              ลบรูป
            </button>
          </div>
        )}

        {touched.img && invalidImg && (
          <p className="text-xs text-red-600">กรุณาอัปโหลดรูปหมวดหมู่</p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={invalid}
          className="rounded-md bg-black px-4 py-2 text-white shadow hover:opacity-90 disabled:pointer-events-none"
          title={invalid ? "กรอกให้ครบก่อนบันทึก" : ""}
        >
          {isEdit ? "บันทึกการแก้ไข" : "เพิ่ม"}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-md bg-white px-4 py-2 shadow ring-1 ring-black/10 hover:bg-black/5"
          >
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
}
