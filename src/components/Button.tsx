import React from "react"; // นำเข้า React เพื่อใช้ React.FC และ type ต่าง ๆ

type Variant = "primary" | "outline"; // ประเภทสไตล์ของปุ่ม (ปกติ/ขอบ)
type Size = "sm" | "md" | "lg"; // ขนาดของปุ่ม (เล็ก/กลาง/ใหญ่)

interface ButtonProps {
  label: string; // ข้อความบนปุ่ม
  type?: "button" | "submit" | "reset"; // ประเภทของปุ่มตาม HTML (default: button)
  variant?: Variant; // เลือกสไตล์ปุ่ม primary หรือ outline
  size?: Size; // เลือกขนาดปุ่ม sm / md / lg
  fullWidth?: boolean; // ถ้า true จะให้ปุ่มกว้างเต็มบรรทัด
  className?: string; // คลาส Tailwind เพิ่มเติมจากภายนอก
  disabled?: boolean; // ปุ่มถูกปิดการใช้งานหรือไม่
  onClick?: () => void; // ฟังก์ชัน callback เมื่อคลิกปุ่ม
} // จบประกาศ interface ButtonProps

const sizeMap: Record<Size, string> = { // แมปขนาดปุ่ม → คลาส Tailwind ที่ใช้จริง
  sm: "px-3 py-2 text-xs rounded-xl", // ปุ่มเล็ก: padding น้อย, ฟอนต์เล็ก, มุมโค้งน้อยลง
  md: "px-4 py-2 text-sm rounded-2xl", // ปุ่มกลาง: ขนาดมาตรฐาน
  lg: "px-5 py-3 text-base rounded-2xl", // ปุ่มใหญ่: padding เยอะ ฟอนต์ใหญ่ เหมาะเป็นปุ่มหลัก
};

const variantMap: Record<Variant, string> = { // แมปสไตล์ปุ่ม → คลาส Tailwind
  primary:
    "bg-black text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-black/30", // ปุ่มหลักพื้นดำ ตัวอักษรขาว มี hover และ focus ring
  outline:
    "bg-white text-black border border-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20", // ปุ่มแบบขอบดำ พื้นขาว
};

const Button: React.FC<ButtonProps> = ({ // ประกาศคอมโพเนนต์ Button แบบ React.FC พร้อม type Props
  label, // ข้อความบนปุ่ม
  type = "button", // ค่าเริ่มต้นเป็นปุ่มธรรมดา (ไม่ส่งฟอร์ม)
  variant = "primary", // ค่าเริ่มต้นเป็นปุ่มแบบ primary
  size = "lg", // ค่าเริ่มต้นเป็นปุ่มขนาดใหญ่
  fullWidth, // ถ้าส่ง true จะทำให้ปุ่มกว้างเต็ม
  className = "", // ถ้าไม่ส่ง className ให้เป็นสตริงว่าง
  disabled, // สถานะ disabled ของปุ่ม
  onClick, // callback เมื่อคลิกปุ่ม
}) => {
  return (
    <button
      type={type} // กำหนดประเภทปุ่ม (button/submit/reset)
      onClick={onClick} // ผูก event handler เมื่อคลิก
      disabled={disabled} // ถ้าส่ง disabled=true จะปิดการใช้งานปุ่ม
      className={[ // รวมคลาส Tailwind หลาย ๆ อันเป็นสตริงเดียว
        "inline-flex items-center justify-center font-semibold transition", // ทำให้ปุ่มจัดกึ่งกลางแนวนอน/ตั้ง พร้อมตัวอักษรหนา และมี transition
        "disabled:opacity-60 disabled:cursor-not-allowed", // เมื่อ disabled ให้จางลงและเปลี่ยน cursor
        sizeMap[size], // ใช้คลาสตามขนาดที่เลือกจาก sizeMap
        variantMap[variant], // ใช้คลาสตามสไตล์ที่เลือกจาก variantMap
        fullWidth ? "w-full" : "", // ถ้า fullWidth เป็น true ให้ปุ่มกว้างเต็มบรรทัด
        className, // เพิ่มคลาสจากภายนอก (ถ้ามี)
      ].join(" ")} // join array เป็นสตริง className สุดท้าย
    >
      {label} {/* แสดงข้อความบนปุ่มตาม props.label */}
    </button>
  );
};

export default Button; // ส่งออกคอมโพเนนต์ Button ให้ไฟล์อื่นนำไปใช้ได้
