//ใช้เลือกแท็บ Dashboard / Product / Category และปุ่ม Log out
import React, { useEffect } from "react";
import {
  FiMenu,
  FiGrid,
  FiShoppingBag,
  FiTag,
  FiUser,
} from "react-icons/fi";

// กำหนดชนิดของชื่อแท็บที่ Sidebar รองรับ
// เพื่อให้โค้ดส่วนอื่นใช้ TabKey แล้วไม่พิมพ์ชื่อแท็บผิด
type TabKey = "dashboard" | "product" | "category";

/**
 * กำหนดรูปแบบ Props ที่ Component นี้ต้องการรับจากพาเรนต์
 * - open : สถานะเปิด/ปิด sidebar (ใช้ควบคุมบนมือถือ)
 * - current : แท็บที่ถูกเลือกอยู่ตอนนี้
 * - onChangeTab : ฟังก์ชันที่ให้พาเรนต์รู้ว่าเราเปลี่ยนแท็บแล้ว
 * - onToggle : ฟังก์ชันสำหรับสลับเปิด/ปิด sidebar
 * - onLogout : ฟังก์ชันที่เรียกเมื่อกดปุ่ม Log out
 */
type Props = {
  open: boolean;
  current: TabKey;
  onChangeTab: (t: TabKey) => void;
  onToggle: () => void;
  onLogout: () => void;
};

//ชื่อ key ที่ใช้เก็บแท็บล่าสุดของแอดมินใน localStorage
//เพื่อให้รีเฟรชหน้าแล้วกลับมาเปิดแท็บเดิมได้
const TAB_STORAGE_KEY = "admin_tab";

export default function AdminSidebar({
  open,
  current,
  onChangeTab,
  onToggle,
  onLogout,
}: Props) {
  //ส่วนนี้ทำหน้าที่ sync ชื่อแท็บปัจจุบันลง localStorage ทุกครั้งที่ current เปลี่ยน
  //ข้อดีคือเปิดหน้าเว็บใหม่หรือรีเฟรชแล้ว สามารถดึงแท็บเดิมกลับมาใช้ได้
  useEffect(() => {
    if (current) {
      localStorage.setItem(TAB_STORAGE_KEY, current);
    }
  }, [current]);

  //ฟังก์ชันกลางสำหรับเปลี่ยนแท็บ
  //บันทึกชื่อแท็บที่เลือกลง localStorage
  //เรียก onChangeTab เพื่อบอกพาเรนต์ให้เปลี่ยนเนื้อหาในหน้าหลัก
  const handleChange = (key: TabKey) => {
    localStorage.setItem(TAB_STORAGE_KEY, key);
    onChangeTab(key);
  };

  //ฟังก์ชันย่อยสำหรับสร้างปุ่มเมนูแต่ละแท็บใน Sidebar
  //รับ key ชื่อแท็บ, label ข้อความที่โชว์ และ icon (React Icon)
  const Item = (key: TabKey, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => handleChange(key)}
      //aria-current ใช้ช่วยด้าน accessibility
      //ถ้าเป็นแท็บปัจจุบันให้ใส่ค่า "page"
      aria-current={current === key ? "page" : undefined}
      className={[
        "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-semibold transition",
        current === key
          ? "bg-white text-gray-900" //สไตล์ของแท็บที่กำลังถูกเลือก
          : "text-white/90 hover:bg-white/10", //สไตล์ของแท็บที่ยังไม่ถูกเลือก
      ].join(" ")}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <aside
      className={[
        //กำหนดให้ Sidebar ติดด้านซ้ายสูงเต็มหน้าจอ และมีพื้นหลังสีเข้ม
        "fixed inset-y-0 left-0 z-40 h-screen w-64 shrink-0 bg-gray-900/95 p-4 text-white shadow-lg ring-1 ring-black/40",
        //ควบคุมการเลื่อนเข้า/ออกของ Sidebar บนจอเล็กด้วยคลาส translate
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "transition-transform",
      ].join(" ")}
    >
      {/*ส่วนหัวของ Sidebar: แสดงชื่อระบบ + ปุ่ม Toggle บนจอเล็ก*/}
      <div className="mb-4 flex items-center justify-between">
        {/*โลโก้หรือชื่อระบบ*/}
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-teal-300">
            StyleHub
          </span>
        </div>

        {/*ปุ่มเปิด/ปิด Sidebar (แสดงเฉพาะบนมือถือ / จอขนาดเล็ก)*/}
        <button
          onClick={onToggle}
          className="rounded-lg bg-white/10 px-2 py-1 text-sm md:hidden"
          aria-label="Toggle sidebar"
        >
          <FiMenu className="text-lg" />
        </button>
      </div>

      {/*โซนเมนูหลักสำหรับสลับแท็บของหน้า Admin*/}
      <nav className="space-y-2">
        {Item("dashboard", "Dashboard", <FiGrid />)}
        {Item("product", "Product", <FiShoppingBag />)}
        {Item("category", "Category", <FiTag />)}
      </nav>

      {/*กล่องแสดงข้อมูลสั้นๆ ของผู้ใช้(Admin) ด้านล่างเมนู*/}
      <div className="mt-6 rounded-lg bg-white/10 p-3 text-white/90">
        <div className="flex items-center gap-2 font-semibold">
          <FiUser className="text-lg" />
          <span>Admin</span>
        </div>
      </div>

      {/*ปุ่ม Log out อยู่ด้านล่าง ใช้ออกจากระบบ Admin*/}
      <button
        onClick={onLogout}
        className="mt-6 w-full rounded-lg bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20"
      >
        Log out
      </button>
    </aside>
  );
}
