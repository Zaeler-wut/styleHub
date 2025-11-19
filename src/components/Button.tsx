// คอมโพเนนต์ปุ่ม Button แบบปรับแต่งได้
// ใช้ร่วมกันทั้งหน้าเว็บ เพื่อให้ปุ่มมีสไตล์ที่เป็นมาตรฐานเดียวกัน

import React from "react";

// กำหนดชนิดของรูปแบบปุ่ม (variant) ที่รองรับ:
// primary : ปุ่มหลัก พื้นหลังทึบ
// outline : ปุ่มขอบดำ พื้นหลังขาว
type Variant = "primary" | "outline";

// กำหนดขนาดของปุ่มที่เลือกใช้ได้:
// sm : ขนาดเล็ก
// md : ขนาดกลาง
// lg : ขนาดใหญ่
type Size = "sm" | "md" | "lg";

/**
 * โครงสร้าง props ของคอมโพเนนต์ Button
 * label : ข้อความที่จะแสดงบนปุ่ม
 * type : ประเภทปุ่มตามมาตรฐาน HTML (button / submit / reset)
 * variant : เลือกรูปแบบสีของปุ่ม (primary / outline)
 * size : เลือกขนาดปุ่ม (sm / md / lg)
 * fullWidth : ถ้า true จะขยายปุ่มให้กว้างเต็มบรรทัด
 * className : ใช้เพิ่มคลาส Tailwind เพิ่มเติมจากภายนอก
 * disabled : ใช้ปิดการใช้งานปุ่ม (เช่น ระหว่างกำลังส่งฟอร์ม)
 * onClick : ฟังก์ชันที่ถูกเรียกเมื่อผู้ใช้คลิกปุ่ม
 */
interface ButtonProps {
  label: string;
  type?: "button" | "submit" | "reset";
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

// ตารางแมปขนาดปุ่ม /คลาส Tailwind ที่ใช้จริงในแต่ละขนาด
// แยกไว้ตรงนี้เพื่อให้จัดการ/ปรับแต่งสไตล์แต่ละขนาดได้ง่าย
const sizeMap: Record<Size, string> = {
  sm: "px-3 py-2 text-xs rounded-xl",
  md: "px-4 py-2 text-sm rounded-2xl",
  lg: "px-5 py-3 text-base rounded-2xl",
};

// ตารางแมปรูปแบบปุ่ม → คลาส Tailwind ของสีและเส้นขอบ
// ทำให้เลือกใช้ได้จาก props.variant โดยไม่ต้องเขียนคลาสซ้ำ
const variantMap: Record<Variant, string> = {
  primary:
    "bg-black text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-black/30",
  outline:
    "bg-white text-black border border-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20",
};

// คอมโพเนนต์ Button หลัก
// ใช้ React.FC เพื่อผูกกับชนิด ButtonProps ที่เรากำหนดไว้ด้านบน
const Button: React.FC<ButtonProps> = ({
  label,
  type = "button",  // ถ้าไม่กำหนด จะเป็นปุ่มธรรมดา (ไม่ trigger submit ฟอร์ม)
  variant = "primary", // ค่าเริ่มต้นใช้สไตล์ primary
  size = "lg",  // ค่าเริ่มต้นให้เป็นปุ่มขนาดใหญ่ (เหมาะเป็นปุ่มหลัก)
  fullWidth,
  className = "",
  disabled,
  onClick,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // รวมคลาส Tailwind ทั้งหมดเป็นสตริงเดียว
      className={[
        // สไตล์พื้นฐานของปุ่ม: จัดให้อยู่กึ่งกลาง, ตัวหนา, และมี transition เวลา hover
        "inline-flex items-center justify-center font-semibold transition",
        // สไตล์เมื่อปุ่มถูกปิดการใช้งาน: ทำให้จางลง และเปลี่ยน cursor
        "disabled:opacity-60 disabled:cursor-not-allowed",
        // เลือกคลาสตามขนาดที่ระบุ (sm/md/lg)
        sizeMap[size],
        // เลือกคลาสตามรูปแบบสีของปุ่ม (primary/outline)
        variantMap[variant],
        // ถ้า fullWidth เป็น true จะให้ปุ่มกว้างเต็มบรรทัด
        fullWidth ? "w-full" : "",
        // เผื่อให้ไฟล์ภายนอกส่งคลาสมาเสริมเพิ่มเติมได้
        className,
      ].join(" ")}
    >
      {/* แสดงข้อความบนปุ่มจาก props.label */}
      {label}
    </button>
  );
};

export default Button;
