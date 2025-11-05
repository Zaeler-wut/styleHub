// src/components/users/UserForm.tsx
import React, { useEffect, useState } from "react";
import type { User, Role } from "../services/usersStorage";

type Props = {
  editing?: User | null;                // ถ้ามี = โหมดแก้ไข
  onSubmit: (user: User, isEdit: boolean) => void;
  onCancel?: () => void;
};

export default function UserForm({ editing, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<User>({ name: "", password: "", role: "member" });

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ name: "", password: "", role: "member" });
  }, [editing]);

  const isEdit = !!editing;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      alert("กรุณากรอกชื่อผู้ใช้");
      return;
    }
    if (!isEdit && !form.password.trim()) {
      alert("กรุณากรอกรหัสผ่านสำหรับบัญชีใหม่");
      return;
    }
    onSubmit(form, isEdit);
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10"
    >
      <h3 className="mb-3 text-base font-bold">
        {isEdit ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
      </h3>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1 sm:col-span-1">
          <label className="block text-sm">ชื่อผู้ใช้</label>
          <input
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            placeholder="เช่น admin, demo"
            disabled={isEdit}
          />
        </div>

        <div className="space-y-1 sm:col-span-1">
          <label className="block text-sm">รหัสผ่าน</label>
          <input
            type="text"
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            placeholder={isEdit ? "เว้นว่างถ้าไม่ต้องการเปลี่ยน" : "เช่น demo123"}
          />
          {isEdit && (
            <p className="text-xs text-black/60">
              หากปล่อยว่าง จะคงรหัสผ่านเดิม
            </p>
          )}
        </div>

        <div className="space-y-1 sm:col-span-1">
          <label className="block text-sm">สิทธิ์</label>
          <select
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
            value={form.role}
            onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as Role }))}
          >
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-white shadow hover:opacity-90"
        >
          {isEdit ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้"}
        </button>
        {isEdit ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-white px-4 py-2 shadow ring-1 ring-black/10"
          >
            ยกเลิก
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setForm({ name: "", password: "", role: "member" })}
            className="rounded-md bg-white px-4 py-2 shadow ring-1 ring-black/10"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
