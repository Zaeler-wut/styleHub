// src/components/TextField.tsx
// ช่องกรอกข้อมูลแบบ reusable ใช้ได้กับฟอร์มหลาย ๆ ที่
// รองรับ label, ข้อความ error และ attrs พื้นฐานของ <input> ทั้งหมด

import React from "react"; // ใช้ React สำหรับ type ของ props และ JSX

// Props ของ TextField:
// - สืบทอดคุณสมบัติของ <input> มาตรฐานทั้งหมด (type, value, onChange, ฯลฯ)
// - เพิ่ม label สำหรับแสดงชื่อฟิลด์
// - เพิ่ม error สำหรับแสดงข้อความเตือนใต้ช่องกรอก
type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function TextField({
  label,
  error,
  className = "",
  ...rest // props อื่น ๆ ของ input จะถูกส่งต่อไปให้ <input> โดยตรง
}: Props) {
  return (
    <div>
      {/* label อยู่เหนือช่องกรอก ทำให้ฟอร์มอ่านง่ายและชัดเจนว่าฟิลด์นี้คืออะไร */}
      <label className="mb-1 block text-sm font-semibold text-black">
        {label}
      </label>

      {/* ช่อง input หลัก:
          - รองรับ props จากภายนอกผ่าน ...rest
          - ถ้ามี error จะเปลี่ยนสีขอบเป็นแดงอ่อน
      */}
      <input
        {...rest}
        className={
          "w-full rounded-xl border bg-white px-4 py-2 outline-none focus:border-black/40 " +
          (error ? "border-rose-400" : "border-black/20") +
          " " +
          className
        }
      />

      {/* ข้อความ error ใต้ช่องกรอก แสดงเฉพาะเมื่อมี error ส่งเข้ามา */}
      {error && (
        <p className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
