import React from "react"; // ใช้ React ในการประกาศคอมโพเนนต์ และใช้ type React.ReactNode
import { FiTrendingUp } from "react-icons/fi"; // ไอคอนกราฟแนวขึ้น ให้เป็นไอคอนเริ่มต้นของการ์ด

// โครงสร้าง props ของการ์ดสถิติ 1 ใบ
type Props = {
  title: string;             // ข้อความหัวข้อ เช่น "จำนวนสินค้า", "ยอดขายวันนี้"
  value: number | string;    // ค่าที่ต้องการโชว์บนการ์ด เช่น 10 หรือ "10 รายการ"
  icon?: React.ReactNode;    // ไอคอนด้านขวา สามารถส่ง React element อะไรก็ได้
};

export default function StatCard({
  title,                     // ชื่อสถิติ
  value,                     // ค่าของสถิติ
  icon = <FiTrendingUp />,   // ถ้าไม่ส่ง icon เข้ามา ให้ใช้ FiTrendingUp เป็นค่าเริ่มต้น
}: Props) {
  return (
    // การ์ดสถิติพื้นหลังสีขาว มุมโค้ง มีเงาและเส้น ring บาง ๆ
    <div className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10">
      {/* แถวบน: แสดงชื่อสถิติด้านซ้าย และไอคอนด้านขวา */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-black/80">{title}</h3>
        <span className="text-xl">{icon}</span>
      </div>

      {/* แถวล่าง: แสดงตัวเลข/ค่าของสถิติให้เด่นเป็นตัวใหญ่ */}
      <div className="mt-2 text-3xl font-extrabold">{value}</div>
    </div>
  );
}
