import React from "react"; // นำเข้า React เพื่อใช้ประกาศคอมโพเนนต์และ type React.ReactNode
import { FiTrendingUp } from "react-icons/fi"; // ไอคอน default รูปกราฟกำลังขึ้นจาก react-icons/fi

type Props = { // กำหนดชนิดของ props ที่ StatCard จะรับ
  title: string; // ชื่อสถิติ เช่น "จำนวนสินค้า", "ยอดขายวันนี้"
  value: number | string; // ค่าที่จะแสดง เช่น 10 หรือ "10 รายการ"
  icon?: React.ReactNode; // ไอคอนที่จะแสดงด้านขวา (อนุญาตให้ส่ง React element ใด ๆ)
}; // ปิด type Props

export default function StatCard({ // ประกาศคอมโพเนนต์ StatCard แบบฟังก์ชัน
  title, // ดึงค่า title จาก props
  value, // ดึงค่า value จาก props
  icon = <FiTrendingUp />, // ถ้าไม่ส่ง icon มา จะใช้ FiTrendingUp เป็นค่า default
}: Props) {
  return ( // คืน JSX สำหรับการ์ดสถิติ
    <div className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10"> {/* กล่องการ์ด พื้นหลังขาว โปร่งเล็กน้อย มุมโค้ง มีเงาและเส้นขอบบาง */}
      <div className="flex items-center justify-between"> {/* แถวบน: จัด title กับ icon ให้ห่างกันซ้าย-ขวา */}
        <h3 className="text-sm font-extrabold text-black/80">{title}</h3> {/* แสดงชื่อสถิติด้วยตัวหนา ขนาดเล็ก */}
        <span className="text-xl">{icon}</span> {/* แสดง icon ที่ส่งมา หรือค่า default ถ้าไม่ได้ส่ง */}
      </div>
      <div className="mt-2 text-3xl font-extrabold">{value}</div> {/* แสดงค่าของสถิติ ขนาดตัวใหญ่ เน้นด้วยตัวหนามาก */}
    </div>
  );
}
