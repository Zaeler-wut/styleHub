// src/components/CategoryForm.tsx
import React, { useEffect, useRef, useState } from "react"; // นำเข้า React และ hooks สำหรับจัดการ state, ref, side-effect
import { type Category } from "../types/category"; // type Category สำหรับระบุรูปแบบข้อมูลหมวดหมู่
import { uploadImageToCloudinary } from "../services/cloudinary"; // ฟังก์ชันอัปโหลดรูปไป Cloudinary

type Props = {
  onAdd: (c: Category) => void;                 // ฟังก์ชันที่ถูกเรียกเมื่อเพิ่มหมวดหมู่ใหม่
  initial?: Category | null;                   // ถ้ามีค่า แปลว่าอยู่ในโหมดแก้ไข (edit)
  onSubmitEdit?: (c: Category) => void;        // ฟังก์ชันเรียกเมื่อบันทึกการแก้ไขหมวดหมู่
  onCancelEdit?: () => void;                   // ฟังก์ชันเรียกเมื่อยกเลิกการแก้ไข
  existingIds?: string[];                      // รายการ id หมวดหมู่ที่มีอยู่แล้ว (ไว้เช็คซ้ำตอนเพิ่มใหม่)
};

export default function CategoryForm({
  onAdd,
  initial,
  onSubmitEdit,
  onCancelEdit,
  existingIds = [],                            // ถ้าไม่ส่ง existingIds มาให้ใช้เป็น array ว่าง
}: Props) {
  const isEdit = !!initial && !!onSubmitEdit;  // ถ้ามี initial และ onSubmitEdit แสดงว่าอยู่โหมดแก้ไข

  const [displayName, setDisplayName] = useState<string>(""); // ชื่อหมวดหมู่ที่ไว้แสดงผล
  const [slug, setSlug] = useState<string>("");               // รหัสหมวด (id ที่จะใช้ในระบบ / URL)
  const [slugEdited, setSlugEdited] = useState(false);        // flag บอกว่าผู้ใช้แก้ slug เองแล้วหรือยัง

  const [image, setImage] = useState<string>("");             // URL รูปภาพหมวดหมู่หลังอัปโหลดสำเร็จ

  const [uploading, setUploading] = useState(false);          // สถานะกำลังอัปโหลดรูปภาพอยู่หรือไม่
  const [fileName, setFileName] = useState<string>("");       // ชื่อไฟล์รูปที่เลือก (ไว้แสดงให้ผู้ใช้เห็น)
  const fileRef = useRef<HTMLInputElement | null>(null);      // ref ไปยัง input type="file" เพื่อเคลียร์ค่าได้

  useEffect(() => {
    if (isEdit && initial) {                                  // ถ้าอยู่โหมดแก้ไขและมีข้อมูลเริ่มต้น
      setDisplayName(initial.name || "");                     // เติมชื่อหมวดจาก initial
      setSlug(initial.id || "");                              // เติม slug จาก id เดิม
      setSlugEdited(true);                                    // ถือว่า slug ถูกแก้แล้ว จะไม่ auto gen ตามชื่อ
      setImage(initial.image || "");                          // เติมรูปเดิม (ถ้ามี)
      setFileName("");                                        // เคลียร์ชื่อไฟล์ที่เลือก
      if (fileRef.current) fileRef.current.value = "";        // เคลียร์ค่าใน input file
    }
  }, [isEdit, initial]);                                      // รันเมื่อสถานะ isEdit หรือ initial เปลี่ยน

  const toSlug = (s: string) =>                               // ฟังก์ชันแปลงสตริงให้เป็น slug ปลอดภัย
    s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); // ตัดช่องว่าง แปลงเป็นตัวเล็ก และเหลือเฉพาะ a-z0-9-

  function handleChangeDisplayName(v: string) {
    setDisplayName(v);                                        // อัปเดตชื่อหมวดหมู่
    if (!slugEdited) setSlug(toSlug(v));                      // ถ้ายังไม่เคยแก้ slug เอง ให้ auto gen slug จากชื่อ
  }

  function handleChangeSlug(v: string) {
    setSlugEdited(true);                                      // ผู้ใช้เริ่มแก้ slug เองแล้ว
    setSlug(toSlug(v));                                       // แปลงค่าที่กรอกให้เป็น slug ตามกฎ
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];                            // ดึงไฟล์แรกที่เลือก
    if (!f) return;                                           // ถ้าไม่มีไฟล์ให้หยุดทำงาน

    if (!f.type.startsWith("image/")) {                       // ถ้าไฟล์ไม่ใช่รูปภาพ
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");                // แจ้งเตือนผู้ใช้
      if (fileRef.current) fileRef.current.value = "";        // เคลียร์ input file
      return;
    }

    setUploading(true);                                       // ตั้งสถานะกำลังอัปโหลด
    setFileName(f.name);                                      // เก็บชื่อไฟล์ที่เลือกไว้แสดงผล

    try {
      const url = await uploadImageToCloudinary(f);           // อัปโหลดไฟล์ขึ้น Cloudinary และรอ URL ตอบกลับ
      if (url) {
        setImage(url);                                        // ถ้าได้ URL กลับมา ให้ใช้เป็นรูปของหมวดนี้
      } else {
        alert("อัปโหลดรูปไม่สำเร็จ");                       // แจ้งเตือนหากไม่มี URL
        setFileName("");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูป");              // แจ้งเตือนเมื่อเกิด error ระหว่างอัปโหลด
      setFileName("");
    } finally {
      setUploading(false);                                    // ไม่ว่าผลจะสำเร็จหรือไม่ ให้ปิดสถานะ uploading
      if (fileRef.current) fileRef.current.value = "";        // เคลียร์ input file
    }
  }

  function clearImage() {
    setImage("");                                             // ลบ URL ภาพออก
    setFileName("");                                          // ลบชื่อไฟล์ที่เลือก
    if (fileRef.current) fileRef.current.value = "";          // เคลียร์ input file
  }

  const idPreview = toSlug(slug || displayName);              // ตัวอย่าง id ที่จะบันทึกจริง (จาก slug หรือ displayName)
  const invalid = uploading || !displayName.trim() || !idPreview || !image; // เงื่อนไขฟอร์มไม่สมบูรณ์ หรือยังอัปโหลดไม่เสร็จ

  function resetForm() {
    setDisplayName("");                                       // รีเซ็ตชื่อหมวด
    setSlug("");                                              // รีเซ็ต slug
    setSlugEdited(false);                                     // รีเซ็ตสถานะว่า slug ยังไม่ถูกแก้เอง
    setImage("");                                             // รีเซ็ตรูปภาพ
    setFileName("");                                          // รีเซ็ตชื่อไฟล์
    if (fileRef.current) fileRef.current.value = "";          // เคลียร์ input file
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();                                       // กันการ submit แล้วรีเฟรชหน้า
    if (invalid) {                                            // ถ้าฟอร์มยังไม่ถูกต้อง
      if (uploading) alert("กำลังอัปโหลดรูป กรุณารอสักครู่"); // ถ้ากำลังอัปโหลดอยู่ แจ้งให้รอ
      else alert("กรอกข้อมูลให้ครบก่อนบันทึก");              // ไม่งั้นแจ้งให้กรอกข้อมูลให้ครบ
      return;
    }

    // ✅ เช็คซ้ำฝั่งฟอร์ม (เฉพาะตอนเพิ่มใหม่)
    if (!isEdit) {                                            // ถ้าเป็นโหมดเพิ่มใหม่เท่านั้น
      const isDup = existingIds.map((s) => s.toLowerCase()).includes(idPreview); // เช็คว่า idPreview ซ้ำกับ existingIds หรือไม่ (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
      if (isDup) {
        alert(`มีไอดีหมวดหมู่ "${idPreview}" อยู่แล้ว`);   // แจ้งเตือนว่ามี id นี้อยู่แล้ว
        return;
      }
    }

    const payload: Category = {                               // สร้างออบเจ็กต์ Category ที่จะส่งกลับ
      id: idPreview,                                          // ใช้ idPreview เป็น id หมวดหมู่
      name: displayName.trim(),                               // ชื่อหมวดหมู่ตัดช่องว่างหัวท้าย
      image,                                                  // URL รูปภาพหมวดหมู่
    };

    if (isEdit && onSubmitEdit) {                             // ถ้าอยู่โหมดแก้ไขและมีฟังก์ชัน onSubmitEdit
      onSubmitEdit(payload);                                  // ส่งข้อมูลที่แก้ไขกลับให้พาเรนต์จัดการ
    } else {
      onAdd(payload);                                         // ถ้าไม่ใช่โหมดแก้ไข → เรียก onAdd เพื่อเพิ่มหมวดใหม่
      resetForm();                                            // เคลียร์ฟอร์มสำหรับเพิ่มรายการถัดไป
    }
  }

  return (
    <form
      onSubmit={submit}                                       // เมื่อ submit ฟอร์มให้ใช้ฟังก์ชัน submit ด้านบน
      className="mb-4 rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10" // สไตล์กล่องฟอร์มหมวดหมู่
    >
      <h3 className="mb-3 text-base font-bold">
        {isEdit ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}        {/* เปลี่ยนหัวข้อฟอร์มตามโหมด (เพิ่ม / แก้ไข) */}
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm">ชื่อหมวดหมู่ (ไว้แสดงผล)</label> {/* label สำหรับชื่อที่โชว์ให้ผู้ใช้เห็น */}
          <input
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2" // input ชื่อหมวด
            placeholder="เช่น กระเป๋า, เสื้อผ้าผู้ชาย"
            value={displayName}                                 // ผูกค่ากับ state displayName
            onChange={(e) => handleChangeDisplayName(e.target.value)} // เมื่อเปลี่ยนให้เรียก handleChangeDisplayName
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm">รหัสหมวด (id)</label> {/* label สำหรับ id ใช้ในระบบ/URL */}
          <input
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 font-mono" // input slug ใช้ฟอนต์ monospace
            placeholder="เช่น bags, clothes-men"
            value={slug}                                        // ผูกค่ากับ state slug
            onChange={(e) => handleChangeSlug(e.target.value)}  // เมื่อเปลี่ยนให้เรียก handleChangeSlug
          />
          <div className="text-xs text-black/60">
            จะบันทึกเป็น:
            <code className="ml-1 rounded bg-black/5 px-1">{idPreview || "—"}</code> {/* แสดงตัวอย่าง id จริงที่จะถูกบันทึก */}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <label className="block text-sm">
          อัปโหลดรูปภาพ (1 รูป){" "}
          {uploading && <span className="text-xs text-blue-600">(กำลังอัปโหลด…)</span>} {/* แสดงสถานะกำลังอัปโหลด */}
        </label>

        <input
          ref={fileRef}                                       // ผูก ref เพื่อเคลียร์ค่าทีหลังได้
          type="file"
          accept="image/*"                                    // จำกัดให้เลือกเฉพาะไฟล์รูปภาพ
          onChange={handleImage}                              // เมื่อเลือกไฟล์เรียก handleImage
          disabled={uploading}                                // ถ้ากำลังอัปโหลด ให้ disable input
          className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
        />
        <div className="text-xs text-black/70">
          {fileName ? <>ไฟล์ที่เลือก: <span className="font-medium">{fileName}</span></> : <>ยังไม่ได้เลือกไฟล์</>} {/* แสดงชื่อไฟล์ หรือข้อความถ้ายังไม่เลือก */}
        </div>

        {image && (
          <div className="relative mt-1 inline-block">
            <img
              src={image}
              alt="preview"
              className="h-24 w-32 rounded-lg object-cover ring-1 ring-black/10" // แสดงรูปตัวอย่างของหมวด
            />
            <button
              type="button"
              onClick={clearImage}                             // กดเพื่อลบรูปออกจากฟอร์ม
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
          disabled={invalid}                                   // ถ้าฟอร์มไม่สมบูรณ์หรือกำลังอัปโหลด ให้กดปุ่มไม่ได้
          className="rounded-md bg-black px-4 py-2 text-white shadow hover:opacity-90 disabled:pointer-events-none"
          title={uploading ? "กำลังอัปโหลดรูป" : invalid ? "กรอกให้ครบก่อนบันทึก" : ""} // tooltip ตามสถานะ
        >
          {isEdit ? "บันทึกการแก้ไข" : "เพิ่ม"}              {/* เปลี่ยนข้อความปุ่มตามโหมด */}
        </button>

        {isEdit && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}                             // กดเพื่อยกเลิกโหมดแก้ไข
            className="rounded-md bg-white px-4 py-2 shadow ring-1 ring-black/10 hover:bg-black/5"
          >
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
}
