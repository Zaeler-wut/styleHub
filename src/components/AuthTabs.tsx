// คอมโพเนนต์ AuthTabs ใช้สำหรับสลับมุมมองระหว่างหน้า Login และ Register
// โดยใช้ NavLink ของ react-router ในการเช็คแท็บที่กำลังถูกเลือก (active)

import { NavLink } from "react-router-dom"; // นำเข้า NavLink เพื่อทำลิงก์ที่รู้สถานะ active จาก react-router

// คลาสพื้นฐานที่ใช้ร่วมกันของทั้งสองแท็บ (จัดให้กว้างเท่ากัน, ตัวอักษรอยู่กลาง, ขอบโค้ง และมี transition เวลาเปลี่ยนสถานะ)
const base = "flex-1 text-center py-3 rounded-full font-semibold transition";

// คลาสสำหรับแท็บที่กำลัง active:
// พื้นหลังสีขาว
// ตัวหนังสือสีดำ
// มีเงาเล็กน้อยให้ดูเด่นขึ้น
const active = "bg-white text-black shadow";

// คลาสสำหรับแท็บที่ยังไม่ active:
// พื้นหลังโปร่งสีดำอ่อน ๆ
// ตัวหนังสือสีเทาเข้ม
// เมื่อเอาเมาส์ชี้ hover จะเข้มขึ้นเล็กน้อยให้รู้ว่ากดได้
const idle = "bg-black/10 text-black/70 hover:bg-black/20";

// AuthTabs แสดงเป็นแถบแท็บสองปุ่ม: Login และ Register
// เวลาเปลี่ยนหน้า ระบบจะเปลี่ยนสไตล์ตามว่าแท็บไหนกำลัง active อยู่
export default function AuthTabs() {
  return (
    // กล่องพื้นหลังด้านนอกของแท็บ
    // ใช้ flex วางสองแท็บเรียงแนวนอน
    // มีระยะห่างระหว่างแท็บ gap-3
    // พื้นหลังโค้งมนแบบเม็ดยา rounded-full และใส่สีดำจาง ๆ
    <div className="mb-6 flex gap-3 rounded-full bg-black/10 p-2">
      {/* แท็บไปหน้า /login */}
      <NavLink
        to="/login"
        // ใช้ end เพื่อให้ path /login active แค่ตรงเป๊ะ
        // จะไม่ไปชนกับ path ที่ยาวกว่านี้ เช่น /login/extra
        end
        // className รับ callback ที่บอกว่า link นี้กำลัง active หรือไม่
        // ถ้า isActive เป็น true ใช้คลาส active ถ้าไม่ใช่ใช้ idle
        className={({ isActive }) => [base, isActive ? active : idle].join(" ")}
      >
        {/* ข้อความบนแท็บฝั่ง Login */}
        Login
      </NavLink>

      {/* แท็บไปหน้า /register */}
      <NavLink
        to="/register"
        className={({ isActive }) => [base, isActive ? active : idle].join(" ")}
      >
        {/* ข้อความบนแท็บฝั่ง Register */}
        Register
      </NavLink>
    </div>
  );
}
