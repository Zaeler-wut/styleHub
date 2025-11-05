// src/components/CategoryForm.tsx
import React, { useEffect, useRef, useState } from "react";
import { type Category } from "../types/category";
import { uploadImageToCloudinary } from "../services/cloudinary";

type Props = {
  onAdd: (c: Category) => void;
  initial?: Category | null;                 // โหมดแก้ไขถ้ามีค่า
  onSubmitEdit?: (c: Category) => void;      // ส่งกลับตอนบันทึกแก้ไข
  onCancelEdit?: () => void;                 // ยกเลิกแก้ไข
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

  // เก็บ URL รูปจาก Cloudinary
  const [image, setImage] = useState<string>("");

  // เหมือน ProductForm
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  // touched สำหรับ validate
  const [touched, setTouched] = useState<{ name?: boolean; id?: boolean; img?: boolean }>({});

  useEffect(() => {
    if (isEdit && initial) {
      setDisplayName(initial.name || "");
      setSlug(initial.id || "");
      setSlugEdited(true);
      setImage(initial.image || "");
      setFileName(""); // ให้เลือกไฟล์ใหม่จะแสดงชื่อไฟล์ล่าสุด
      setTouched({});
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [isEdit, initial]);

  const toSlug = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

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

  // อัปโหลด 1 รูป ไป Cloudinary (แนวเดียวกับ ProductForm)
  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setTouched((t) => ({ ...t, img: true }));
    setUploading(true);
    setFileName(f.name);

    try {
      const url = await uploadImageToCloudinary(f);
      if (url) {
        setImage(url);
      } else {
        alert("อัปโหลดรูปไม่สำเร็จ");
        setFileName("");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูป");
      setFileName("");
    } finally {
      setUploading(false);
      // อนุญาตให้เลือกไฟล์เดิมซ้ำได้
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clearImage() {
    setImage("");
    setFileName("");
    setTouched((t) => ({ ...t, img: true }));
    if (fileRef.current) fileRef.current.value = "";
  }

  const idPreview = toSlug(slug || displayName);
  const invalidName = !displayName.trim();
  const invalidId = !idPreview;
  const invalidImg = !image;
  const invalid = invalidName || invalidId || invalidImg || uploading;

  function resetForm() {
    setDisplayName("");
    setSlug("");
    setSlugEdited(false);
    setImage("");
    setFileName("");
    setTouched({});
    if (fileRef.current) fileRef.current.value = "";
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, id: true, img: true });
    if (invalid) {
      if (uploading) alert("กำลังอัปโหลดรูป กรุณารอสักครู่");
      return;
    }

    const payload: Category = {
      id: idPreview,
      name: displayName.trim(),
      image,
    };

    if (isEdit && onSubmitEdit) {
      onSubmitEdit(payload);
    } else {
      onAdd(payload);
      resetForm();
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mb-4 rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10"
    >
      <h3 className="mb-3 text-base font-bold">
        {isEdit ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* ชื่อที่แสดงผล */}
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

      {/* อัปโหลดรูป (แนวเดียวกับ ProductForm) */}
      <div className="mt-3 space-y-2">
        <label className="block text-sm">
          อัปโหลดรูปภาพ (1 รูป){" "}
          {uploading && <span className="text-xs text-blue-600">(กำลังอัปโหลด…)</span>}
        </label>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImage}
          disabled={uploading}
          className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
        />
        <div className="text-xs text-black/70">
          {fileName ? <>ไฟล์ที่เลือก: <span className="font-medium">{fileName}</span></> : <>ยังไม่ได้เลือกไฟล์</>}
        </div>

        {/* preview */}
        {image && (
          <div className="mt-1 relative inline-block">
            <img
              src={image}
              alt="preview"
              className="h-24 w-32 rounded-lg object-cover ring-1 ring-black/10"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-1 top-1 rounded bg-white/90 px-1 text-xs shadow ring-1 ring-black/10"
              title="ลบรูปนี้"
            >
              ×
            </button>
          </div>
        )}

      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={invalid} // กัน submit ระหว่างอัปโหลดและตอนข้อมูลไม่ครบ
          className="rounded-md bg-black px-4 py-2 text-white shadow hover:opacity-90 disabled:pointer-events-none"
          title={uploading ? "กำลังอัปโหลดรูป" : invalid ? "กรอกให้ครบก่อนบันทึก" : ""}
        >
          {isEdit ? "บันทึกการแก้ไข" : "เพิ่ม"}
        </button>

        {isEdit && onCancelEdit && (
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
