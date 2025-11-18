// src/pages/LoginPage.tsx
import React, { useState } from "react"; // ใช้ React และ useState สำหรับจัดการ state ในฟอร์ม
import { NavLink } from "react-router-dom"; // NavLink สำหรับลิงก์ไปหน้า Register และรู้สถานะ active
import AuthTabs from "../components/AuthTabs"; // แถบสลับ LOGIN / REGISTER ด้านบนการ์ด
import AuthCard from "../components/AuthCard"; // การ์ดกลางหน้าที่ห่อฟอร์มล็อกอิน
import TextField from "../components/TextField"; // ช่องกรอกแบบมี label + แสดง error ใต้ input
import baseUsers from "../data/user.json"; // รายชื่อผู้ใช้พื้นฐาน (เช่น admin) ที่มาจากไฟล์ JSON

type User = { name: string; password: string; role: "admin" | "member" }; // รูปแบบข้อมูล user ในระบบ

export default function LoginPage() { // คอมโพเนนต์หน้าล็อกอินหลัก
  const [username, setUsername] = useState(""); // เก็บค่าชื่อผู้ใช้ที่พิมพ์ในฟอร์ม
  const [password, setPassword] = useState(""); // เก็บค่ารหัสผ่านที่พิมพ์ในฟอร์ม
  const [errU, setErrU] = useState(""); // ข้อผิดพลาดของช่อง Username
  const [errP, setErrP] = useState(""); // ข้อผิดพลาดของช่อง Password
  const [err, setErr] = useState(""); // ข้อผิดพลาดระดับฟอร์ม เช่น ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง

  const onSubmit = (e: React.FormEvent) => { // ฟังก์ชันเมื่อกดปุ่ม LOGIN หรือ submit ฟอร์ม
    e.preventDefault(); // กันไม่ให้หน้าเว็บรีเฟรชเมื่อ submit

    // เคลียร์ข้อความ error เดิมก่อนเช็กใหม่
    setErr("");
    setErrU("");
    setErrP("");

    const u = username.trim(); // ตัดช่องว่างหน้า-หลังของ username
    const p = password; // รหัสผ่านที่ผู้ใช้กรอก

    // ตรวจว่ากรอกครบหรือยัง
    if (!u) setErrU("กรุณากรอกชื่อผู้ใช้");
    if (!p) setErrP("กรุณากรอกรหัสผ่าน");
    if (!u || !p) return; // ถ้าขาดอย่างใดอย่างหนึ่ง ให้หยุดและไม่เช็กข้อมูลต่อ

    // อ่าน users ที่สมัครเพิ่มจาก localStorage
    let localUsers: User[] = [];
    try {
      const raw = localStorage.getItem("users"); // ดึงค่า key "users" จาก localStorage
      const parsed = raw ? JSON.parse(raw) : []; // แปลงเป็น JSON ถ้ามีข้อมูล
      localUsers = Array.isArray(parsed) ? (parsed as User[]) : []; // ถ้าไม่ใช่ array ให้ถือว่าไม่มี
    } catch {
      localUsers = []; // ถ้า parse ผิดพลาด ให้ถือว่าไม่มีผู้ใช้ใน localStorage
    }

    // รวม user จากไฟล์ฐาน (baseUsers) + user จาก localStorage
    const merged: User[] = [
      ...(Array.isArray(baseUsers) ? (baseUsers as User[]) : []),
      ...localUsers,
    ];

    // หาผู้ใช้ที่ชื่อและรหัสผ่านตรงกับที่กรอก
    const found = merged.find((x) => x.name === u && x.password === p);

    if (!found) { // ถ้าไม่พบ user ตรงกัน
      setErr("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"); // แสดงข้อความผิดพลาดตรงกลางฟอร์ม
      return;
    }

    // เก็บ session ของผู้ใช้ที่ล็อกอินสำเร็จ (เก็บแค่ name + role)
    localStorage.setItem(
      "user",
      JSON.stringify({ name: found.name, role: found.role })
    );

    // เปลี่ยนเส้นทางตาม role
    if (found.role === "admin") {
      window.location.href = "/admin"; // ถ้าเป็น admin ให้ไปหน้าแอดมิน
    } else {
      window.location.href = "/"; // ถ้าเป็น member ให้กลับหน้าแรกของผู้ใช้
    }
  };

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900 flex items-center justify-center px-4">
      {/* พื้นหลังไล่สี และจัดให้การ์ดล็อกอินอยู่กลางจอ */}
      <AuthCard>
        {/* กล่องการ์ดสีขาวห่อฟอร์มล็อกอิน */}
        <AuthTabs /> {/* แถบสลับหน้าระหว่าง LOGIN / REGISTER ด้านบนสุดของการ์ด */}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* ฟอร์มล็อกอิน หลัก ๆ มี Username + Password + ปุ่ม LOGIN */}
          <TextField
            label="Username" // ป้ายกำกับช่อง Username
            placeholder="ชื่อผู้ใช้" // ตัวอย่างข้อความในช่องกรอก
            value={username} // ผูกค่ากับ state username
            onChange={(e) => setUsername(e.target.value)} // อัปเดต state เมื่อผู้ใช้พิมพ์
            error={errU} // ข้อความ error เฉพาะของช่อง Username
          />

          <TextField
            label="Password" // ป้ายกำกับช่อง Password
            type="password" // ซ่อนตัวอักษรที่พิมพ์
            placeholder="********" // ตัวอย่างรูปแบบรหัสผ่าน
            value={password} // ผูกค่ากับ state password
            onChange={(e) => setPassword(e.target.value)} // อัปเดต state เมื่อพิมพ์รหัสผ่าน
            error={errP} // ข้อความ error เฉพาะช่อง Password
          />

          {err && (
            <div className="text-center text-sm font-semibold text-rose-600">
              {err}
            </div>
          )}
          {/* แสดง error กลางฟอร์ม เช่น ล็อกอินไม่ผ่าน ก็ตอนที่ username/password ไม่ตรง */}

          <button
            type="submit" // ปุ่ม submit ฟอร์ม
            className="w-full rounded-full bg-black text-white py-3 font-extrabold tracking-wide shadow-md ring-2 ring-black/20 hover:brightness-110"
          >
            LOGIN
          </button>
          {/* ปุ่ม LOGIN แบบเต็มความกว้างการ์ด */}
        </form>

        <div className="mt-4 text-center text-sm">
          {/* ข้อความลิงก์ไปหน้าสมัครสมาชิก */}
          ยังไม่มีบัญชี?
          <NavLink
            to="/register"
            className="ml-2 font-semibold text-rose-600 hover:underline"
          >
            สมัครสมาชิก
          </NavLink>
        </div>
      </AuthCard>
    </div>
  );
}
