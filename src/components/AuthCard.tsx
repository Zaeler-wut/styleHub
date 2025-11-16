import React from "react"; // นำเข้า React เพื่อใช้ type React.ReactNode และฟังก์ชันคอมโพเนนต์

export default function AuthCard({ children }: { children: React.ReactNode }) { // คอมโพเนนต์กล่องกลางสำหรับห่อฟอร์ม login/register รับ children มาแสดงด้านใน
  return ( // คืน JSX สำหรับกล่องการ์ด
    <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-6 md:p-8"> {/* กล่องสีขาว ขอบโค้ง เงา และมี ring บาง ๆ ใช้จัด layout ฟอร์มให้สวย */}
      {children} {/* เนื้อหาภายใน (เช่น ฟอร์ม AuthTabs / TextField) ถูกส่งเข้ามาผ่าน props.children */}
    </div>
  );
}
