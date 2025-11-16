import React, { useEffect } from "react"; // นำเข้า React และ hook useEffect สำหรับ side-effect
import {
  FiMenu,
  FiGrid,
  FiShoppingBag,
  FiTag,
  FiUser,
} from "react-icons/fi"; // นำเข้า react-icons สำหรับใช้แทน emoji

type TabKey = "dashboard" | "product" | "category"; // type แท็บที่มีได้ใน sidebar

type Props = {
  open: boolean; // สถานะเปิด/ปิด sidebar (สำหรับมือถือ)
  current: TabKey; // แท็บที่ถูกเลือกอยู่ในปัจจุบัน
  onChangeTab: (t: TabKey) => void; // callback เปลี่ยนแท็บที่เลือก
  onToggle: () => void; // callback เปิด/ปิด sidebar
  onLogout: () => void; // callback เมื่อกด log out
};

const TAB_STORAGE_KEY = "admin_tab"; // key ที่ใช้เก็บชื่อแท็บใน localStorage

export default function AdminSidebar({
  open,
  current,
  onChangeTab,
  onToggle,
  onLogout,
}: Props) {
  // เมื่อมีการเปลี่ยน current จากพาเรนต์ ให้ sync ลง localStorage ไว้ด้วย
  useEffect(() => {
    if (current) localStorage.setItem(TAB_STORAGE_KEY, current); // ถ้ามีค่า current ให้บันทึกลง localStorage
  }, [current]); // dependency คือ current

  const handleChange = (key: TabKey) => {
    // ฟังก์ชันเปลี่ยนแท็บและอัปเดต localStorage
    localStorage.setItem(TAB_STORAGE_KEY, key); // เก็บชื่อแท็บที่เลือกลง localStorage
    onChangeTab(key); // แจ้งพาเรนต์ให้เปลี่ยนแท็บ
  };

  // ฟังก์ชันย่อยสร้างปุ่มแท็บแต่ละอัน (ใช้ React icon แทน emoji)
  const Item = (key: TabKey, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => handleChange(key)} // เมื่อคลิกให้เรียก handleChange ด้วย key ของแท็บนั้น
      aria-current={current === key ? "page" : undefined} // ใส่ aria-current เมื่อเป็นแท็บปัจจุบัน เพื่อช่วยด้าน accessibility
      className={[
        "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-semibold transition", // สไตล์พื้นฐานของปุ่ม
        current === key
          ? "bg-white text-gray-900" // ถ้าเป็นแท็บปัจจุบัน: พื้นหลังขาว ตัวอักษรเข้ม
          : "text-white/90 hover:bg-white/10", // ถ้าไม่ใช่แท็บปัจจุบัน: ตัวอักษรจางลง และ hover มีพื้นหลังโปร่ง ๆ
      ].join(" ")}
    >
      <span className="text-lg">{icon}</span> {/* แสดง react-icon ของเมนู */}
      <span>{label}</span> {/* ข้อความ label ของเมนู */}
    </button>
  );

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-40 h-screen w-64 shrink-0 bg-gray-900/95 p-4 text-white shadow-lg ring-1 ring-black/40", // sidebar ติดซ้ายเต็มความสูงจอ พื้นหลังเข้ม
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0", // ถ้า open ให้เลื่อนเข้ามา, ถ้าไม่ open ซ่อนนอกจอ (แต่จอ md ขึ้นไปให้โชว์ตลอด)
        "transition-transform", // ใส่เอฟเฟกต์เลื่อนเข้าออกนุ่มนวล
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between">
        {/* แถวบนสุดของ sidebar: โลโก้ + ปุ่ม toggle */}
        <div className="flex items-center gap-2">
          {/* กลุ่มโลโก้ / ชื่อระบบ */}
          <span className="text-xl font-extrabold text-teal-300">
            StyleHub {/* ชื่อระบบ admin */}
          </span>
        </div>
        <button
          onClick={onToggle} // กดเพื่อเปิด/ปิด sidebar (เฉพาะจอเล็ก)
          className="rounded-lg bg-white/10 px-2 py-1 text-sm md:hidden" // แสดงปุ่มเฉพาะบนมือถือ (ซ่อนบน md ขึ้นไป)
          aria-label="Toggle sidebar"
        >
          <FiMenu className="text-lg" /> {/* ไอคอนเมนู (hamburger) จาก react-icons */}
        </button>
      </div>

      <nav className="space-y-2">
        {/* โซนเมนูหลัก: dashboard / product / category */}
        {Item("dashboard", "Dashboard", <FiGrid />)} {/* ปุ่มไปหน้า dashboard */}
        {Item("product", "Product", <FiShoppingBag />)} {/* ปุ่มไปหน้าจัดการสินค้า */}
        {Item("category", "Category", <FiTag />)} {/* ปุ่มไปหน้าจัดการหมวดหมู่ */}
      </nav>

      <div className="mt-6 rounded-lg bg-white/10 p-3 text-white/90">
        {/* กล่องแสดงข้อมูลผู้ใช้ (admin) */}
        <div className="flex items-center gap-2 font-semibold">
          {/* แถวชื่อ admin + ไอคอน */}
          <FiUser className="text-lg" /> {/* ไอคอนรูปคน จาก react-icons */}
          <span>Admin</span>
        </div>
      </div>

      <button
        onClick={onLogout} // เมื่อคลิกให้เรียก callback log out
        className="mt-6 w-full rounded-lg bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20"
      >
        Log out {/* ข้อความบนปุ่มออกจากระบบ */}
      </button>
    </aside>
  );
}
