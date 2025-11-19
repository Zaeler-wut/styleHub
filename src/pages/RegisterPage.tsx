// ส่วน import: ดึงเครื่องมือและคอมโพเนนต์ที่จำเป็นมาใช้ในหน้าสมัครสมาชิก
import React, { useState } from "react"; // useState ใช้เก็บค่า input และ error ของฟอร์ม
import { NavLink } from "react-router-dom"; // NavLink ใช้ลิงก์ไปหน้า Login และรู้สถานะ active ได้
import AuthTabs from "../components/AuthTabs"; // แถบสลับแท็บ LOGIN / REGISTER ด้านบนการ์ด
import AuthCard from "../components/AuthCard"; // กล่องการ์ดตรงกลาง ที่ห่อทั้งฟอร์มและข้อความต่าง ๆ
import TextField from "../components/TextField"; // ช่องกรอกข้อมูลที่มี label + แสดง error ได้ในตัว
import baseUsers from "../data/user.json"; // รายชื่อผู้ใช้พื้นฐาน (เช่น admin) ที่ฝังมาในระบบจากไฟล์ JSON

// รูปแบบข้อมูลของ User ในระบบ: มีชื่อ, รหัสผ่าน และบทบาท (role)
type User = { 
  name: string;
  password: string;
  role: "member" | "admin";
};

// คอมโพเนนต์หลักของหน้า Register หน้าสมัครสมาชิก
export default function RegisterPage() {
  // ส่วนเก็บค่า input ของฟอร์ม
  const [username, setUsername] = useState(""); // เก็บชื่อผู้ใช้ที่กรอกในช่อง Username
  const [password, setPassword] = useState(""); // เก็บรหัสผ่านที่กรอก
  const [confirm, setConfirm] = useState("");   // เก็บรหัสผ่านที่ผู้ใช้พิมพ์เพื่อยืนยันอีกครั้ง

  // ส่วนเก็บข้อความ error ต่อช่อง
  const [errU, setErrU] = useState("");  // ข้อความ error ของช่อง Username
  const [errP, setErrP] = useState("");  // ข้อความ error ของช่อง Password
  const [errC, setErrC] = useState("");  // ข้อความ error ของช่อง Confirm Password
  const [formErr, setFormErr] = useState(""); // ข้อความ error ระดับฟอร์ม (เช่น ชื่อนี้ถูกใช้แล้ว)

  // ฟังก์ชันทำงานตอนผู้ใช้กดปุ่ม REGISTER submit ฟอร์ม
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // กันพฤติกรรมปกติของฟอร์มที่รีเฟรชหน้าใหม่

    // เริ่มต้นด้วยการล้าง error เดิมทุกช่อง ก่อนเช็กใหม่
    setErrU("");
    setErrP("");
    setErrC("");
    setFormErr("");

    // ขั้นตอนตรวจสอบความถูกต้องของข้อมูล (Validation)
    let ok = true; // ธงบอกว่าฟอร์มผ่านหรือไม่
    const u = username.trim(); // ตัดช่องว่างหัวท้ายของชื่อผู้ใช้

    // ตรวจช่อง Username
    if (!u) { // ถ้าไม่กรอกชื่อผู้ใช้เลย
      setErrU("กรุณากรอกชื่อผู้ใช้");
      ok = false;
    } else if (u.length < 3) { // ถ้าชื่อสั้นเกินไป
      setErrU("ชื่อต้องยาวอย่างน้อย 3 ตัวอักษร");
      ok = false;
    }

    // ตรวจช่อง Password
    if (!password) { // ถ้าไม่กรอกรหัสผ่าน
      setErrP("กรุณากรอกรหัสผ่าน");
      ok = false;
    } else if (password.length < 6) { // ถ้ารหัสผ่านสั้นกว่า 6 ตัว
      setErrP("รหัสผ่านต้องยาวอย่างน้อย 6 ตัว");
      ok = false;
    }

    // ตรวจช่อง Confirm Password ให้ตรงกับ Password
    if (confirm !== password) {
      setErrC("รหัสผ่านไม่ตรงกัน");
      ok = false;
    }

    // ถ้ามีเงื่อนไขใดไม่ผ่าน ให้หยุดการทำงาน ไม่ไปขั้นตอนบันทึก
    if (!ok) return;

    // โหลดรายชื่อผู้ใช้ที่เคยสมัครไว้จาก localStorage
    let localUsers: User[] = []; // เก็บรายการ User ที่เคยสมัครผ่านเว็บนี้

    try {
      const raw = localStorage.getItem("users"); // อ่านข้อมูลจาก key ชื่อ "users"
      const parsed = raw ? JSON.parse(raw) : []; // ถ้ามี string ให้ parse เป็น JSON ถ้าไม่มีให้เป็น array ว่าง
      localUsers = Array.isArray(parsed) ? parsed : []; // ถ้า parse แล้วไม่ใช่ array ให้ fallback เป็น []
    } catch {
      localUsers = []; // ถ้ามี error ตอน parse ให้ถือว่าไม่มี user ใน localStorage
    }

    // ตรวจว่า Username ซ้ำหรือไม่ ทั้งใน localStorage และในไฟล์ฐาน
    const takenLocal = localUsers.some(
      (x) => x.name.toLowerCase() === u.toLowerCase() // เช็กชื่อซ้ำใน localStorage ไม่สนตัวเล็ก/ใหญ่
    );

    const takenBase = (Array.isArray(baseUsers) ? (baseUsers as User[]) : [])
      .some((x) => x.name.toLowerCase() === u.toLowerCase()); // เช็กชื่อซ้ำกับ user พื้นฐาน เช่น admin

    if (takenLocal || takenBase) {
      // ถ้าชื่อซ้ำในแหล่งใดแหล่งหนึ่ง ให้แจ้ง error ระดับฟอร์ม
      setFormErr("ชื่อนี้ถูกใช้แล้ว");
      return; // ไม่สร้าง user ใหม่
    }

    // สร้าง User ใหม่ และบันทึกลง localStorage
    const newUser: User = {
      name: u,
      password,
      role: "member", // สมัครผ่านหน้าเว็บจะได้ role เป็น member เสมอ
    };

    // เขียน users ชุดใหม่ ของเดิม user ใหม่ กลับเข้า localStorage
    localStorage.setItem("users", JSON.stringify([...localUsers, newUser]));

    // ไม่ทำ auto-login เพื่อให้ขั้นตอนชัดเจน: สมัครเสร็จแล้วให้ไป login เอง
    // หลังสมัครสำเร็จ redirect ไปหน้า Login
    window.location.href = "/login";
  };

  // ส่วนแสดงผล UI ของหน้า Register
  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900 flex items-center justify-center px-4">
      {/* พื้นหลังไล่สี จัดตำแหน่งให้การ์ดอยู่กลางหน้าจอทั้งแนวตั้งและแนวนอน */}

      <AuthCard>
        {/* การ์ดกลางหน้าที่ห่อแท็บ ฟอร์ม ข้อความล่างสุด */}

        <AuthTabs />
        {/* แถบสลับ LOGIN / REGISTER ในหน้านี้แท็บ REGISTER จะ active อยู่ */}

        {/* ฟอร์มสมัครสมาชิก */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* ช่องกรอก Username */}
          <TextField
            label="Username"
            placeholder="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // อัปเดต state username ตามที่พิมพ์
            error={errU} // ถ้ามีข้อความ error ของช่องนี้ จะถูกแสดงใต้ TextField
          />

          {/* ช่องกรอกรหัสผ่าน */}
          <TextField
            label="Password"
            type="password"
            placeholder="อย่างน้อย 6 ตัว"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // อัปเดต state password
            error={errP} // แสดง error ช่อง password ถ้ามี
          />

          {/* ช่องยืนยันรหัสผ่าน */}
          <TextField
            label="Confirm Password"
            type="password"
            placeholder="พิมพ์รหัสผ่านอีกครั้ง"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}  // อัปเดต state confirm
            error={errC}                                  // แสดง error ช่องยืนยันรหัสผ่าน
          />

          {/* แสดง error ระดับฟอร์ม เช่น ชื่อผู้ใช้ซ้ำ */}
          {formErr && (
            <div className="rounded-md bg-rose-50 text-rose-700 px-3 py-2 text-sm">
              {formErr}
            </div>
          )}

          {/* ปุ่มกด REGISTER */}
          <button
            type="submit"
            className="w-full rounded-full bg-black text-white py-3 font-extrabold tracking-wide shadow-md ring-2 ring-black/20 hover:brightness-110"
          >
            REGISTER
          </button>
        </form>

        {/* ข้อความล่างสุด + ลิงก์ไปหน้า Login ถ้ามีบัญชีอยู่แล้ว */}
        <div className="mt-4 text-center text-sm">
          มีบัญชีอยู่แล้ว?
          <NavLink
            to="/login"
            className="ml-2 font-semibold text-rose-600 hover:underline"
          >
            เข้าสู่ระบบ
          </NavLink>
        </div>
      </AuthCard>
    </div>
  );
}
