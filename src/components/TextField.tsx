import React from "react"; // นำเข้า React เพื่อใช้ type สำหรับ props และ JSX

type Props = React.InputHTMLAttributes<HTMLInputElement> & { // สร้างชนิด Props โดยใช้ attrs มาตรฐานของ <input> ทั้งหมด
  label: string; // ข้อความ label ที่จะแสดงเหนือช่อง input
  error?: string; // ข้อความ error (ถ้ามี) จะแสดงใต้ input
}; // ปิดประกาศ type Props

export default function TextField({ label, error, className = "", ...rest }: Props) { // คอมโพเนนต์ TextField รับ label, error, className และ prop อื่น ๆ ของ input ผ่าน ...rest
  return ( // เริ่ม JSX ที่จะ render
    <div> {/* กล่องครอบ label + input + error */}
      <label className="block text-sm font-semibold text-black mb-1">{label}</label> {/* แสดง label ของ input ด้วยตัวหนาเล็กน้อย */}
      <input
        {...rest} // กระจาย props อื่น ๆ (เช่น type, value, onChange, placeholder) ลงใน <input>
        className={ // กำหนดคลาสของ input แบบต่อ string
          "w-full rounded-xl border bg-white px-4 py-2 outline-none focus:border-black/40 " + // คลาสพื้นฐาน: กว้างเต็ม, ขอบมน, padding, focus border
          (error ? "border-rose-400" : "border-black/20") + // ถ้ามี error ให้ใช้ขอบสีชมพู ไม่งั้นใช้ขอบเทาอ่อน
          " " + className // ต่อท้ายด้วย className ที่ส่งมาจากภายนอก (ไว้ปรับแต่งเพิ่มเติม)
        }
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>} {/* ถ้ามี error ให้แสดงข้อความ error ใต้ input สีแดงอ่อน */}
    </div>
  );
}
