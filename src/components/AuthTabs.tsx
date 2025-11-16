import { NavLink } from "react-router-dom"; // นำเข้า NavLink เพื่อทำลิงก์ที่รู้สถานะ active จาก react-router

const base = "flex-1 text-center py-3 rounded-full font-semibold transition"; // คลาสพื้นฐานของแท็บ (ขนาด/จัดกลาง/โค้ง/แอนิเมชัน)
const active = "bg-white text-black shadow"; // คลาสเมื่อแท็บอยู่หน้า active (พื้นหลังขาว ตัวหนังสือดำ มีเงา)
const idle = "bg-black/10 text-black/70 hover:bg-black/20"; // คลาสเมื่อแท็บไม่ได้ active (พื้นหลังจาง และ hover เข้มขึ้นเล็กน้อย)

export default function AuthTabs() { // คอมโพเนนต์แท็บสลับระหว่างหน้า Login / Register
  return (
    <div className="mb-6 flex gap-3 rounded-full bg-black/10 p-2"> {/* พื้นหลังโค้งมนหุ้มสองแท็บวางเรียงในแนวนอน */}
      <NavLink
        to="/login" // ลิงก์ไปหน้า /login
        end // ใช้ end เพื่อให้ active เฉพาะ path ตรง /login ไม่ไปชนกับ /login/...
        className={({ isActive }) => [base, isActive ? active : idle].join(" ")} // ถ้า isActive ให้ใช้คลาส active ไม่งั้นใช้ idle
      >
        Login {/* ป้ายชื่อแท็บ Login */}
      </NavLink>
      <NavLink
        to="/register" // ลิงก์ไปหน้า /register
        className={({ isActive }) => [base, isActive ? active : idle].join(" ")} // เลือกคลาสตามสถานะ isActive เช่นเดียวกับแท็บ Login
      >
        Register {/* ป้ายชื่อแท็บ Register */}
      </NavLink>
    </div>
  );
}
