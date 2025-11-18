// src/pages/RegisterPage.tsx
import React, { useState } from "react"; // นำเข้า React และ useState สำหรับจัดการ state ของฟอร์ม
import { NavLink } from "react-router-dom"; // ใช้สร้างลิงก์ไปหน้า Login พร้อมสไตล์ active ได้
import AuthTabs from "../components/AuthTabs"; // แถบสลับแท็บ LOGIN / REGISTER ด้านบนการ์ด
import AuthCard from "../components/AuthCard"; // การ์ดกลางหน้าที่ห่อฟอร์มสมัครสมาชิก
import TextField from "../components/TextField"; // ช่องกรอกแบบ reusable มี label + error
import baseUsers from "../data/user.json"; // รายชื่อเริ่มต้น เช่น admin ที่ฝังอยู่ในไฟล์ JSON

type User = { name: string; password: string; role: "member" | "admin" }; // กำหนดรูปแบบข้อมูลของผู้ใช้ในระบบ (name / password / role)

export default function RegisterPage() { // คอมโพเนนต์หลักของหน้า Register
  const [username, setUsername] = useState(""); // state เก็บค่าชื่อผู้ใช้ที่กรอก
  const [password, setPassword] = useState(""); // state เก็บค่ารหัสผ่านที่กรอก
  const [confirm, setConfirm] = useState(""); // state เก็บค่ารหัสผ่านสำหรับยืนยันอีกครั้ง

  const [errU, setErrU] = useState(""); // state ข้อความ error ของช่อง username
  const [errP, setErrP] = useState(""); // state ข้อความ error ของช่อง password
  const [errC, setErrC] = useState(""); // state ข้อความ error ของช่อง confirm password
  const [formErr, setFormErr] = useState(""); // state error ระดับฟอร์ม เช่น ชื่อซ้ำ

  const onSubmit = (e: React.FormEvent) => { // ฟังก์ชันที่ทำงานเมื่อฟอร์มถูก submit
    e.preventDefault(); // ป้องกัน behavior ปกติของฟอร์มที่ refresh หน้า
    // reset error
    setErrU(""); setErrP(""); setErrC(""); setFormErr(""); // ล้างข้อความ error เดิมทั้งหมดก่อนตรวจใหม่

    // validate
    let ok = true; // ธงบอกว่าฟอร์มผ่าน validation หรือไม่
    const u = username.trim(); // trim ช่องว่างหน้าหลังของชื่อผู้ใช้
    if (!u) { setErrU("กรุณากรอกชื่อผู้ใช้"); ok = false; } // ถ้าไม่กรอก username ให้แจ้ง error
    else if (u.length < 3) { setErrU("ชื่อต้องยาวอย่างน้อย 3 ตัวอักษร"); ok = false; } // ถ้าชื่อสั้นกว่า 3 ตัว ให้แจ้ง error

    if (!password) { setErrP("กรุณากรอกรหัสผ่าน"); ok = false; } // ถ้าไม่กรอกรหัสผ่านให้แจ้ง error
    else if (password.length < 6) { setErrP("รหัสผ่านต้องยาวอย่างน้อย 6 ตัว"); ok = false; } // ถ้ารหัสน้อยกว่า 6 ตัวให้แจ้ง error

    if (confirm !== password) { setErrC("รหัสผ่านไม่ตรงกัน"); ok = false; } // ถ้า confirm password ไม่ตรงกับ password ให้แจ้ง error

    if (!ok) return; // ถ้ามี validation ตัวใดไม่ผ่าน ให้หยุดทำงานไม่ไปต่อ

    // โหลด users จาก localStorage แบบกันพัง
    let localUsers: User[] = []; // เตรียม array สำหรับเก็บผู้ใช้ที่เคยสมัครแล้วใน localStorage
    try {
      const raw = localStorage.getItem("users"); // อ่านข้อมูลจาก key "users"
      const parsed = raw ? JSON.parse(raw) : []; // ถ้ามี string ให้ parse เป็น JSON ไม่งั้นใช้ array ว่าง
      localUsers = Array.isArray(parsed) ? parsed : []; // ถ้า parse ได้เป็น array ให้ใช้เลย ไม่งั้นใช้ []
    } catch {
      localUsers = []; // ถ้า parse แล้ว error ให้ถือว่าไม่มีผู้ใช้ใน localStorage
    }

    // กันชื่อซ้ำ ทั้งใน local และในไฟล์ JSON (เช่น admin)
    const takenLocal = localUsers.some(x => x.name.toLowerCase() === u.toLowerCase()); // ตรวจว่าชื่อซ้ำใน localStorage หรือไม่ (ไม่สนตัวพิมพ์เล็กใหญ่)
    const takenBase  = (Array.isArray(baseUsers) ? baseUsers as User[] : []) // ถ้า baseUsers เป็น array ให้ใช้ ไม่งั้นใช้ array ว่าง
                        .some(x => x.name.toLowerCase() === u.toLowerCase()); // ตรวจว่าชื่อซ้ำกับผู้ใช้ในไฟล์ JSON หรือไม่ เช่น admin
    if (takenLocal || takenBase) { // ถ้าพบว่ามีชื่อซ้ำในแหล่งใดแหล่งหนึ่ง
      setFormErr("ชื่อนี้ถูกใช้แล้ว"); // ตั้ง error ระดับฟอร์มว่า "ชื่อนี้ถูกใช้แล้ว"
      return; // หยุดการทำงาน ไม่บันทึก user ใหม่
    }

    // เพิ่มผู้ใช้ใหม่ (member) -> บันทึกลง localStorage
    const newUser: User = { name: u, password, role: "member" }; // สร้าง object ผู้ใช้ใหม่ โดย role เป็น member เสมอ
    localStorage.setItem("users", JSON.stringify([...localUsers, newUser])); // เขียน user ใหม่รวมกับของเดิมกลับเข้า localStorage

    // ❌ ไม่ auto-login
    // ✅ สมัครสำเร็จ -> เด้งไปหน้า login ทันที
    window.location.href = "/login"; // หลังสมัครเสร็จ redirect ไปหน้า login เพื่อให้ผู้ใช้เข้าสู่ระบบด้วยบัญชีใหม่
  };

  return ( // เริ่มส่วน UI ของหน้า Register
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900 flex items-center justify-center px-4"> {/* ฉากหลังไล่สี และจัดให้การ์ดอยู่กลางจอ */}
      <AuthCard> {/* การ์ดกลางหน้าห่อทั้งหมด: แท็บ + ฟอร์ม + ลิงก์ไป login */}
        <AuthTabs /> {/* แถบสลับ LOGIN / REGISTER ด้านบน (ในหน้านี้แท็บ REGISTER จะ active) */}

        <form onSubmit={onSubmit} className="space-y-4"> {/* ฟอร์มสมัครสมาชิก เมื่อ submit จะเรียก onSubmit; ช่องต่าง ๆ เว้นระยะห่างกัน */}
          <TextField
            label="Username" // label ช่องกรอก username
            placeholder="ชื่อผู้ใช้" // placeholder ตัวอย่างในช่อง
            value={username} // ผูกค่ากับ state username
            onChange={(e)=>setUsername(e.target.value)} // เมื่อพิมพ์ในช่องนี้ ให้ setUsername ด้วยค่าที่กรอก
            error={errU} // ถ้ามีข้อความ error ของช่อง username ให้ส่งไปแสดงใต้ TextField
          />
          <TextField
            label="Password" // label ช่องกรอกรหัสผ่าน
            type="password" // type password เพื่อซ่อนตัวอักษร
            placeholder="อย่างน้อย 6 ตัว" // บอกเงื่อนไขคร่าว ๆ ว่าต้อง 6 ตัวขึ้นไป
            value={password} // ผูกกับ state password
            onChange={(e)=>setPassword(e.target.value)} // แก้ค่า password เมื่อผู้ใช้พิมพ์
            error={errP} // แสดง error ของช่อง password ถ้ามี
          />
          <TextField
            label="Confirm Password" // label ช่องยืนยันรหัสผ่าน
            type="password" // type password เช่นกัน
            placeholder="พิมพ์รหัสผ่านอีกครั้ง" // บอกผู้ใช้ให้พิมพ์รหัสซ้ำ
            value={confirm} // ผูกกับ state confirm
            onChange={(e)=>setConfirm(e.target.value)} // แก้ค่า confirm เมื่อผู้ใช้พิมพ์
            error={errC} // แสดง error ช่องยืนยันรหัสผ่าน ถ้ามี
          />

          {formErr && ( // ถ้ามี error ระดับฟอร์ม (เช่น ชื่อซ้ำ) ให้แสดงกล่องแจ้งเตือน
            <div className="rounded-md bg-rose-50 text-rose-700 px-3 py-2 text-sm">
              {formErr} {/* แสดงข้อความ error */}
            </div>
          )}

          <button
            type="submit" // ปุ่ม submit ฟอร์ม (เรียก onSubmit)
            className="w-full rounded-full bg-black text-white py-3 font-extrabold tracking-wide shadow-md ring-2 ring-black/20 hover:brightness-110" // ปุ่มสีดำ ตัวหนา เต็มความกว้าง
          >
            REGISTER
          </button>
        </form>

        <div className="mt-4 text-center text-sm"> {/* ข้อความด้านล่าง ชวนให้ไปหน้า login ถ้ามีบัญชีแล้ว */}
          มีบัญชีอยู่แล้ว?
          <NavLink to="/login" className="ml-2 font-semibold text-rose-600 hover:underline"> {/* ลิงก์ไปหน้าเข้าสู่ระบบ */}
            เข้าสู่ระบบ
          </NavLink>
        </div>
      </AuthCard>
    </div>
  );
}