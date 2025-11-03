// src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import AuthTabs from "../components/AuthTabs";
import AuthCard from "../components/AuthCard";
import TextField from "../components/TextField";

export default function RegisterPage() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errU, setErrU] = useState("");
  const [errP, setErrP] = useState("");
  const [errC, setErrC] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // reset error
    setErrU(""); setErrP(""); setErrC("");

    // validate
    let ok = true;
    if (!username.trim()) { setErrU("กรุณากรอกชื่อผู้ใช้"); ok = false; }
    else if (username.trim().length < 3) { setErrU("ชื่อต้องยาวอย่างน้อย 3 ตัวอักษร"); ok = false; }

    if (!password) { setErrP("กรุณากรอกรหัสผ่าน"); ok = false; }
    else if (password.length < 6) { setErrP("รหัสผ่านต้องยาวอย่างน้อย 6 ตัว"); ok = false; }

    if (confirm !== password) { setErrC("รหัสผ่านไม่ตรงกัน"); ok = false; }

    if (!ok) return;

    // mock DB in localStorage
    const users: Array<{name:string; password:string; role:string}> =
      JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some(u => u.name.toLowerCase() === username.trim().toLowerCase())) {
      setErrU("ชื่อนี้ถูกใช้แล้ว");
      return;
    }

    const newUser = { name: username.trim(), password, role: "member" };
    localStorage.setItem("users", JSON.stringify([...users, newUser]));

    // auto login
    localStorage.setItem("user", JSON.stringify({ name: newUser.name, role: newUser.role }));

    nav("/login");

  };

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900 flex items-center justify-center px-4">
      <AuthCard>
        <AuthTabs />

        <form onSubmit={onSubmit} className="space-y-4">
          <TextField
            label="Username"
            placeholder="ชื่อผู้ใช้"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            error={errU}
          />
          <TextField
            label="Password"
            type="password"
            placeholder="อย่างน้อย 6 ตัว"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            error={errP}
          />
          <TextField
            label="Confirm Password"
            type="password"
            placeholder="พิมพ์รหัสผ่านอีกครั้ง"
            value={confirm}
            onChange={(e)=>setConfirm(e.target.value)}
            error={errC}
          />

          <button
            type="submit"
            className="w-full rounded-full bg-black text-white py-3 font-extrabold tracking-wide shadow-md ring-2 ring-black/20 hover:brightness-110"
          >
            REGISTER
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          มีบัญชีอยู่แล้ว?
          <NavLink to="/login" className="ml-2 font-semibold text-rose-600 hover:underline">
            เข้าสู่ระบบ
          </NavLink>
        </div>
      </AuthCard>
    </div>
  );
}
