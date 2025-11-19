//AuthCard ใช้เป็นกล่องกลางห่อฟอร์มล็อกอิน / สมัครสมาชิก
//เพื่อให้ทุกหน้าที่เกี่ยวกับการยืนยันตัวตนมีหน้าตาและสไตล์ที่เหมือนกัน
import React from "react";

// กำหนดให้ AuthCard รับ props ชื่อ children
// children คือองค์ประกอบภายในที่เราจะนำมาแสดงในกรอบการ์ดนี้ เช่น ฟอร์ม Login / Register
export default function AuthCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // กล่องหลักของการ์ด:
    // w-full, max-w-xl : จำกัดความกว้างไม่ให้กว้างเกินไป และปรับให้เต็มบนจอเล็ก
    // rounded-3xl : มุมโค้งมน ดูเป็นการ์ดสวยงาม
    // bg-white : พื้นหลังสีขาว ตัดกับพื้นหลังด้านนอก
    // shadow-xl : ใส่เงาให้การ์ดลอยขึ้นมาจากพื้นหลัง
    // ring-1 ring-black/5 : เส้นขอบบาง ๆ ช่วยให้การ์ดดูเด่นขึ้น
    // p-6 md:p-8 : ระยะห่างด้านใน (padding) ปรับตามขนาดหน้าจอ
    <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-6 md:p-8">
      {/* ส่วนนี้จะแสดงคอนเทนต์ที่ถูกส่งเข้ามาผ่าน AuthCard เช่น แท็บสลับ Login/Register, ช่องกรอก TextField */}
      {children}
    </div>
  );
}
