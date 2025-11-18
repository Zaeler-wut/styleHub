// src/pages/LoginPage.tsx
import React, { useState } from "react"; // นำเข้า React และ hook useState สำหรับจัดการ state ฟอร์ม
import { NavLink } from "react-router-dom"; // ใช้ NavLink สำหรับลิงก์ไปหน้า register พร้อมเช็ก active ได้
import AuthTabs from "../components/AuthTabs"; // แถบสลับ LOGIN / REGISTER ด้านบนการ์ด
import AuthCard from "../components/AuthCard"; // การ์ดกลางหน้าที่ห่อฟอร์ม login
import TextField from "../components/TextField"; // คอมโพเนนต์ input แบบมี label + แสดง error
import baseUsers from "../data/user.json"; // ← รายชื่อ user พื้นฐาน (โดยเฉพาะ admin) มาจากไฟล์ JSON

type User = { name: string; password: string; role: "admin" | "member" }; // กำหนดรูปแบบข้อมูลของ user ที่ใช้ในระบบ

export default function LoginPage() { // ประกาศคอมโพเนนต์หลักของหน้าเข้าสู่ระบบ
  const [username, setUsername] = useState(""); // state เก็บค่าชื่อผู้ใช้ที่กรอกในฟอร์ม
  const [password, setPassword] = useState(""); // state เก็บค่ารหัสผ่านที่กรอกในฟอร์ม
  const [errU, setErrU] = useState(""); // state เก็บข้อความ error ของช่อง username
  const [errP, setErrP] = useState(""); // state เก็บข้อความ error ของช่อง password
  const [err, setErr] = useState(""); // state เก็บ error หลัก เช่น username/password ไม่ถูกต้อง

  const onSubmit = (e: React.FormEvent) => { // ฟังก์ชันจัดการเมื่อกดปุ่ม LOGIN หรือ submit ฟอร์ม
    e.preventDefault(); // กันไม่ให้ฟอร์ม reload หน้า
    setErr(""); setErrU(""); setErrP(""); // เคลียร์ error เดิมทุกช่องก่อนตรวจใหม่

    const u = username.trim(); // ตัดช่องว่างหน้า-หลังของชื่อผู้ใช้
    const p = password; // เก็บรหัสผ่านตามที่กรอก

    if (!u) setErrU("กรุณากรอกชื่อผู้ใช้"); // ถ้าไม่ได้กรอก username ให้ตั้ง error เฉพาะช่อง
    if (!p) setErrP("กรุณากรอกรหัสผ่าน"); // ถ้าไม่ได้กรอกรหัสผ่านให้ตั้ง error เฉพาะช่อง
    if (!u || !p) return; // ถ้าช่องใดช่องหนึ่งว่าง ให้หยุดตรวจต่อ

    // users จาก localStorage
    let localUsers: User[] = []; // ตัวแปรเก็บรายการผู้ใช้ที่สมัครผ่านหน้าเว็บ (อยู่ใน localStorage)
    try {
      const raw = localStorage.getItem("users"); // อ่านค่า key "users" จาก localStorage
      const parsed = raw ? JSON.parse(raw) : []; // ถ้ามีค่าให้ parse เป็น JSON ถ้าไม่มีให้ใช้ array ว่าง
      localUsers = Array.isArray(parsed) ? parsed as User[] : []; // ถ้า parse แล้วเป็น array ให้ใช้ ไม่งั้นใช้ []
    } catch { localUsers = []; } // ถ้า parse แล้ว error ให้ถือว่าไม่มี user ใน localStorage

    // รวมกับ users จากไฟล์ (admin)
    const merged: User[] = [ // รวม users จากไฟล์ (เช่น admin) กับ users ที่สมัครใน localStorage
      ...(Array.isArray(baseUsers) ? (baseUsers as User[]) : []), // ดึง user พื้นฐานจากไฟล์ ถ้าไม่ใช่ array ให้ถือว่า []
      ...localUsers, // ต่อด้วย user จาก localStorage
    ];

    const found = merged.find(x => x.name === u && x.password === p); // หา user ที่ name และ password ตรงกับที่กรอก
    if (!found) { // ถ้าไม่พบ user
      setErr("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"); // ตั้ง error กลางว่าข้อมูลไม่ถูกต้อง
      return; // หยุดทำงาน ไม่ไปต่อ
    }

    // เก็บ session
    localStorage.setItem("user", JSON.stringify({ name: found.name, role: found.role })); // เก็บข้อมูล session user (ชื่อ + role) ลง localStorage

    // ✅ แยกเส้นทางตาม role
    if (found.role === "admin") { // ถ้าเป็นผู้ใช้ role admin
      window.location.href = "/admin"; // เด้งไปหน้า /admin
    } else { // ถ้าเป็น member ทั่วไป
      window.location.href = "/"; // เด้งกลับหน้าแรกของผู้ใช้ทั่วไป
    }
  };

  return ( // เริ่มส่วน UI ของหน้า login
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900 flex items-center justify-center px-4"> {/* พื้นหลังไล่สี + จัดฟอร์มให้อยู่กลางจอ */}
      <AuthCard> {/* การ์ดห่อฟอร์ม login ให้ดูเป็นกล่องสวย ๆ */}
        <AuthTabs /> {/* แถบสลับ LOGIN / REGISTER ด้านบนการ์ด */}
        <form onSubmit={onSubmit} className="space-y-4"> {/* ฟอร์ม login เมื่อ submit ให้เรียก onSubmit และเว้นระยะระหว่างช่องเป็น 4 */}
          <TextField
            label="Username" // label บอกว่าช่องนี้คือ Username
            placeholder="ชื่อผู้ใช้" // placeholder ภาษาไทยในช่อง input
            value={username} // ผูกกับ state username
            onChange={(e)=>setUsername(e.target.value)} // เมื่อพิมพ์ให้ปรับค่า username ใน state
            error={errU} // ถ้ามี error ช่อง username ให้ส่งไปแสดงใต้ TextField
          />
          <TextField
            label="Password" // label ช่องรหัสผ่าน
            type="password" // กำหนด input type เป็น password เพื่อซ่อนตัวอักษร
            placeholder="********" // placeholder รหัสผ่าน
            value={password} // ผูกกับ state password
            onChange={(e)=>setPassword(e.target.value)} // เมื่อพิมพ์ให้ปรับค่า password ใน state
            error={errP} // ถ้ามี error ช่อง password ให้ส่งไปแสดง
          />

          {err && <div className="text-center text-sm font-semibold text-rose-600">{err}</div>} {/* ถ้ามี error กลาง (เช่น ล็อกอินไม่ผ่าน) ให้แสดงข้อความสีแดงตรงกลาง */}

          <button
            type="submit" // ปุ่มประเภท submit เพื่อให้ฟอร์มเรียก onSubmit
            className="w-full rounded-full bg-black text-white py-3 font-extrabold tracking-wide shadow-md ring-2 ring-black/20 hover:brightness-110" // สไตล์ปุ่ม LOGIN แบบเต็มความกว้าง
          >
            LOGIN
          </button>
        </form>

        <div className="mt-4 text-center text-sm"> {/* ข้อความด้านล่างฟอร์ม ชวนไปสมัครสมาชิก */}
          ยังไม่มีบัญชี?
          <NavLink to="/register" className="ml-2 font-semibold text-rose-600 hover:underline"> {/* ลิงก์ไปหน้า register พร้อมสีชมพูและขีดเส้นใต้เมื่อ hover */}
            สมัครสมาชิก
          </NavLink>
        </div>
      </AuthCard>
    </div>
  );
}