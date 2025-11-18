// src/components/CategoryForm.tsx
// ฟอร์มสำหรับ “เพิ่ม / แก้ไขหมวดหมู่สินค้า”
// ทำหน้าที่จัดการชื่อหมวด, id (slug), และรูปภาพ (อัปโหลดขึ้น Cloudinary)

import React, { useEffect, useRef, useState } from "react";
import { type Category } from "../types/category";
import { uploadImageToCloudinary } from "../services/cloudinary";

// กำหนดรูปแบบ props ที่ฟอร์มนี้รับจากภายนอก
// - onAdd         : ใช้ตอนโหมดเพิ่มหมวดใหม่ ส่ง Category กลับให้พาเรนต์จัดการบันทึก
// - initial       : ถ้ามีค่า แปลว่ากำลังแก้ไขหมวดเดิม (edit mode)
// - onSubmitEdit  : ฟังก์ชันสำหรับบันทึกการแก้ไข (ใช้คู่กับ initial)
// - onCancelEdit  : ฟังก์ชันสำหรับปุ่ม “ยกเลิกแก้ไข”
// - existingIds   : รายการ id ของหมวดหมู่ที่มีอยู่แล้ว (ใช้สำหรับเช็คไม่ให้ id ซ้ำตอนเพิ่มใหม่)
type Props = {
  onAdd: (c: Category) => void;
  initial?: Category | null;
  onSubmitEdit?: (c: Category) => void;
  onCancelEdit?: () => void;
  existingIds?: string[];
};

export default function CategoryForm({
  onAdd,
  initial,
  onSubmitEdit,
  onCancelEdit,
  existingIds = [],
}: Props) {
  // ถ้ามีทั้ง initial และ onSubmitEdit แสดงว่าเป็นโหมดแก้ไข
  const isEdit = !!initial && !!onSubmitEdit;

  // displayName  : ชื่อหมวดหมู่ที่เอาไว้แสดงบนหน้าเว็บ
  // slug         : รหัสหมวดหมู่ (id ที่ใช้ในระบบ / URL)
  // slugEdited   : ใช้เช็คว่าผู้ใช้เคยแก้ slug เองหรือยัง (ถ้าเคยแล้วจะไม่ auto-gen จากชื่ออีก)
  const [displayName, setDisplayName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [slugEdited, setSlugEdited] = useState(false);

  // image        : เก็บ URL รูปหมวดหมู่ที่อัปโหลดสำเร็จแล้ว
  const [image, setImage] = useState<string>("");

  // uploading    : สถานะกำลังอัปโหลดรูปอยู่หรือไม่ (ใช้ disable ปุ่มและ input บางส่วน)
  // fileName     : ชื่อไฟล์รูปที่เลือก (เอาไว้แสดงให้ผู้ใช้ดู)
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  // ref สำหรับ input[type="file"] เพื่อให้สามารถเคลียร์ค่าหลังจากใช้งานเสร็จได้
  const fileRef = useRef<HTMLInputElement | null>(null);

  // เมื่อเข้าโหมดแก้ไข (isEdit) หรือ initial เปลี่ยน ให้เติมค่าตั้งต้นลงในฟอร์ม
  useEffect(() => {
    if (isEdit && initial) {
      setDisplayName(initial.name || "");
      setSlug(initial.id || "");
      setSlugEdited(true);        // ถือว่า slug ถูกดูแลด้วยมือแล้ว จะไม่ auto-gen ตามชื่ออีก
      setImage(initial.image || "");
      setFileName("");

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }, [isEdit, initial]);

  // ฟังก์ชันช่วยแปลงข้อความให้เป็น slug ที่ปลอดภัยสำหรับใช้เป็น id / URL
  // 1) trim() เอาช่องว่างหัวท้ายออก
  // 2) toLowerCase() แปลงเป็นตัวพิมพ์เล็ก
  // 3) แทนที่ช่องว่างด้วยเครื่องหมาย - (dash)
  // 4) ตัดอักขระที่ไม่ใช่ a-z, 0-9, หรือ - ทิ้ง
  const toSlug = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  // เมื่อผู้ใช้เปลี่ยนชื่อหมวดหมู่
  // - อัปเดต displayName
  // - ถ้ายังไม่เคยแก้ slug เอง ให้สร้าง slug จากชื่อให้โดยอัตโนมัติ
  function handleChangeDisplayName(v: string) {
    setDisplayName(v);
    if (!slugEdited) {
      setSlug(toSlug(v));
    }
  }

  // เมื่อผู้ใช้พิมพ์ slug เอง
  // - ตั้งค่า slugEdited = true เพื่อบอกว่า slug นี้ผู้ใช้จะดูแลเอง
  // - ทำความสะอาดค่าที่กรอกด้วย toSlug
  function handleChangeSlug(v: string) {
    setSlugEdited(true);
    setSlug(toSlug(v));
  }

  // จัดการเมื่อผู้ใช้เลือกไฟล์รูปภาพ
  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    // ป้องกันกรณีเลือกไฟล์ที่ไม่ใช่รูป
    if (!f.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    setFileName(f.name);

    try {
      // อัปโหลดรูปไปยัง Cloudinary แล้วรอรับ URL กลับมา
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

  // ล้างข้อมูลรูปภาพออกจากฟอร์ม
  function clearImage() {
    setImage("");
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  // idPreview คือ id ที่จะใช้จริงในการบันทึก
  // ถ้า slug มีค่า ใช้ slug → ถ้า slug ว่างใช้ displayName แปลงเป็น slug แทน
  const idPreview = toSlug(slug || displayName);

  // invalid เป็น flag เช็คว่า “ฟอร์มยังไม่พร้อมบันทึกหรือไม่”
  // เงื่อนไข:
  // - กำลังอัปโหลดอยู่
  // - ยังไม่ได้กรอกชื่อหมวด
  // - ยังไม่มี idPreview
  // - ยังไม่ได้เลือกรูป
  const invalid =
    uploading || !displayName.trim() || !idPreview || !image;

  // รีเซ็ตฟอร์มกลับเป็นค่าเริ่มต้น (ใช้หลังเพิ่มสำเร็จ)
  function resetForm() {
    setDisplayName("");
    setSlug("");
    setSlugEdited(false);
    setImage("");
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  // เมื่อ submit ฟอร์ม (ทั้งโหมดเพิ่ม และโหมดแก้ไข)
  function submit(e: React.FormEvent) {
    e.preventDefault(); // กันไม่ให้รีเฟรชหน้า

    if (invalid) {
      if (uploading) {
        alert("กำลังอัปโหลดรูป กรุณารอสักครู่");
      } else {
        alert("กรอกข้อมูลให้ครบก่อนบันทึก");
      }
      return;
    }

    // เช็ค id ซ้ำ ฝั่งฟอร์ม (เฉพาะโหมดเพิ่มใหม่)
    if (!isEdit) {
      const normalizedIds = existingIds.map((s) => s.toLowerCase());
      const isDup = normalizedIds.includes(idPreview.toLowerCase());

      if (isDup) {
        alert(`มีไอดีหมวดหมู่ "${idPreview}" อยู่แล้ว`);
        return;
      }
    }

    // สร้าง payload Category ที่จะส่งกลับให้ parent
    const payload: Category = {
      id: idPreview,
      name: displayName.trim(),
      image,
    };

    // ถ้าเป็นโหมดแก้ไข ให้เรียก onSubmitEdit
    // ถ้าเป็นโหมดเพิ่มใหม่ ให้เรียก onAdd แล้วรีเซ็ตฟอร์ม
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
      {/* หัวข้อฟอร์ม เปลี่ยนข้อความตามว่าอยู่โหมดเพิ่ม หรือโหมดแก้ไข */}
      <h3 className="mb-3 text-base font-bold">
        {isEdit ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}
      </h3>

      {/* ส่วนกรอกชื่อหมวดหมู่ และรหัสหมวด (id) */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm">
            ชื่อหมวดหมู่ (ไว้แสดงผล)
          </label>
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
            <code className="ml-1 rounded bg-black/5 px-1">
              {idPreview || "—"}
            </code>
          </div>
        </div>
      </div>

      {/* ส่วนอัปโหลดรูปหมวดหมู่ + แสดงสถานะ + แสดงรูปตัวอย่าง */}
      <div className="mt-3 space-y-2">
        <label className="block text-sm">
          อัปโหลดรูปภาพ (1 รูป){" "}
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
          onChange={handleImage}
          disabled={uploading}
          className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
        />

        <div className="text-xs text-black/70">
          {fileName ? (
            <>
              ไฟล์ที่เลือก:{" "}
              <span className="font-medium">{fileName}</span>
            </>
          ) : (
            <>ยังไม่ได้เลือกไฟล์</>
          )}
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

      {/* ปุ่มบันทึก (เพิ่ม/แก้ไข) และปุ่มยกเลิกกรณีอยู่โหมด Edit */}
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={invalid}
          className="rounded-md bg-black px-4 py-2 text-white shadow hover:opacity-90 disabled:pointer-events-none"
          title={
            uploading
              ? "กำลังอัปโหลดรูป"
              : invalid
              ? "กรอกให้ครบก่อนบันทึก"
              : ""
          }
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
