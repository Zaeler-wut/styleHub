// src/components/CategoryForm.tsx
import React, { useEffect, useRef, useState } from "react";
import { type Category } from "../types/category";
import { uploadImageToCloudinary } from "../services/cloudinary";

type Props = {
  onAdd: (c: Category) => void;
  initial?: Category | null;                 // โหมดแก้ไขถ้ามีค่า
  onSubmitEdit?: (c: Category) => void;      // ส่งกลับตอนบันทึกแก้ไข
  onCancelEdit?: () => void;                 // ยกเลิกแก้ไข
  existingIds?: string[];                    // ✅ รายการ id ที่มีอยู่แล้ว (เพื่อเช็คซ้ำ)
};

export default function CategoryForm({
  onAdd,
  initial,
  onSubmitEdit,
  onCancelEdit,
  existingIds = [],
}: Props) {
  const isEdit = !!initial && !!onSubmitEdit;

  const [displayName, setDisplayName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [slugEdited, setSlugEdited] = useState(false);

  const [image, setImage] = useState<string>("");

  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEdit && initial) {
      setDisplayName(initial.name || "");
      setSlug(initial.id || "");
      setSlugEdited(true);
      setImage(initial.image || "");
      setFileName("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [isEdit, initial]);

  const toSlug = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  function handleChangeDisplayName(v: string) {
    setDisplayName(v);
    if (!slugEdited) setSlug(toSlug(v));
  }

  function handleChangeSlug(v: string) {
    setSlugEdited(true);
    setSlug(toSlug(v));
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

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
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clearImage() {
    setImage("");
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const idPreview = toSlug(slug || displayName);
  const invalid = uploading || !displayName.trim() || !idPreview || !image;

  function resetForm() {
    setDisplayName("");
    setSlug("");
    setSlugEdited(false);
    setImage("");
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (invalid) {
      if (uploading) alert("กำลังอัปโหลดรูป กรุณารอสักครู่");
      else alert("กรอกข้อมูลให้ครบก่อนบันทึก");
      return;
    }

    // ✅ เช็คซ้ำฝั่งฟอร์ม (เฉพาะตอนเพิ่มใหม่)
    if (!isEdit) {
      const isDup = existingIds.map((s) => s.toLowerCase()).includes(idPreview);
      if (isDup) {
        alert(`มีไอดีหมวดหมู่ "${idPreview}" อยู่แล้ว`);
        return;
      }
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
        <div className="space-y-1">
          <label className="block text-sm">ชื่อหมวดหมู่ (ไว้แสดงผล)</label>
          <input
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            placeholder="เช่น กระเป๋า, เสื้อผ้าผู้ชาย"
            value={displayName}
            onChange={(e) => handleChangeDisplayName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm">รหัสหมวด (id)</label>
          <input
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 font-mono"
            placeholder="เช่น bags, clothes-men"
            value={slug}
            onChange={(e) => handleChangeSlug(e.target.value)}
          />
          <div className="text-xs text-black/60">
            จะบันทึกเป็น:
            <code className="ml-1 rounded bg-black/5 px-1">{idPreview || "—"}</code>
          </div>
        </div>
      </div>

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

        {image && (
          <div className="relative mt-1 inline-block">
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
          disabled={invalid}
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
