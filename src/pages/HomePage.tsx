// src/pages/HomePage.tsx
// หน้าโฮม (HomePage) ของเว็บแนะนำสินค้า
// หน้าที่หลักของหน้านี้:
// 1) แสดงข้อความแนะนำสั้น ๆ ว่าเว็บช่วย “คัดเลือกร้านค้าที่ดีให้ผู้ใช้”
// 2) ให้ผู้ใช้เลือก “หมวดหมู่สินค้า” ผ่านปุ่มด้านซ้าย (CategoryButtonList)
// 3) แสดง “กริดรูปภาพหมวดหมู่” ด้านขวา (CategoryImageGrid) โดยใช้ข้อมูลหมวดหมู่ล่าสุดจาก state/App

import React from "react"; // นำเข้า React เพื่อใช้ประกาศคอมโพเนนต์แบบ React.FC
import CategoryButtonList from "../components/CategoryButtonList"; // คอมโพเนนต์ปุ่มหมวดหมู่ (หน้าตาแบบแคปซูล กดแล้วไปหน้า /products ตามหมวด)
import CategoryImageGrid from "../components/CategoryImageGrid"; // คอมโพเนนต์กริดรูปภาพหมวดหมู่ (ใช้รูปจากหมวดหมู่ที่กำหนด)
import { type Product } from "../types/product"; // type Product (เผื่อรองรับการใช้สินค้าในหน้าโฮมในอนาคต)
import { type Category } from "../types/category"; // type Category ใช้ระบุชนิดของ props categories

type Props = {
  products: Product[];   // รายการสินค้า (ตอนนี้ยังไม่ได้ใช้บนหน้าโฮม แต่เตรียมไว้เผื่อใช้ต่อ เช่น แสดงสินค้ายอดนิยม)
  categories: Category[]; // รายการหมวดหมู่จาก state / localStorage (ข้อมูลล่าสุดที่ผู้ดูแลระบบจัดการ)
}; // ปิด type Props

const HomePage: React.FC<Props> = ({ products, categories }) => {
  // หมายเหตุ: ตอนนี้เราใช้เฉพาะ categories เพื่อเอาไปสร้างปุ่มและกริดรูปหมวดหมู่
  // ส่วน products สามารถนำมาใช้ต่อในอนาคต เช่น แสดงสินค้าแนะนำบนหน้าโฮม

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900 text-gray-900">
      {/* พื้นหลังทั้งหน้า: ไล่สีจากชมพู → ม่วง และกำหนดความสูงขั้นต่ำเต็ม viewport */}

      <section className="mx-auto w-full px-6 py-10 md:py-16">
        {/* โซนหลักของหน้าโฮม: จัดให้อยู่กลาง มี padding รอบ ๆ ทั้งแนวตั้งและแนวนอน */}

        <div className="grid max-w-[1200px] mx-auto grid-cols-1 gap-10 md:grid-cols-12">
          {/* ใช้ grid แบ่งหน้าเป็น 2 ส่วน:
              - มือถือ: 1 คอลัมน์ (เรียงจากบนลงล่าง)
              - md ขึ้นไป: มี 12 คอลัมน์ แล้วแบ่งซ้าย/ขวาตามสัดส่วน */}

          {/* ฝั่งซ้าย: Hero text + ปุ่มเลือกหมวดหมู่ */}
          <div className="md:col-span-6 lg:col-span-5">
            {/* ซ้ายกิน 6/12 คอลัมน์บน md และ 5/12 คอลัมน์บน lg */}

            <h1 className="text-5xl font-extrabold leading-tight text-black drop-shadow-sm md:text-6xl">
              {/* ข้อความหัวเรื่องหลักของหน้า (Hero Title) */}
              Top Guide !
            </h1>

            <p className="mt-4 text-lg text-black/90">
              {/* คำอธิบายสั้น ๆ ว่าเว็บนี้ช่วยอะไรผู้ใช้ */}
              ช่วยเลือกร้านค้าที่ดีที่สุดให้กับคุณ รวมสินค้าน่าสนใจ พร้อมพิกัดร้านค้า
            </p>

            <p className="mt-1 text-md text-black/80">
              {/* ข้อความเชิญชวนให้เริ่มจากการเลือกหมวดหมู่ */}
              เลือกหมวดหมู่ที่สนใจได้เลย !
            </p>

            {/* ปุ่มหมวดหมู่: ใช้ข้อมูลหมวดหมู่ล่าสุดจาก state/App */}
            {/* limit={6} = แสดงปุ่มสูงสุด 6 หมวด ถ้ามีมากกว่านี้จะโชว์เฉพาะ 6 ตัวแรก */}
            <CategoryButtonList categories={categories} limit={6} />
          </div>

          {/* ฝั่งขวา: กริดรูปภาพหมวดหมู่ */}
          <div className="md:col-span-6 lg:col-span-7">
            {/* ขวากิน 6/12 คอลัมน์บน md และ 7/12 คอลัมน์บน lg */}

            {/* กริดรูปหมวดหมู่:
                - รับ categories จาก state ซึ่งแต่ละหมวดอาจมี image เป็น URL ปกติ หรือ DataURL จากการอัปโหลด
                - เมื่อคลิกแต่ละการ์ดหมวดหมู่ จะลิงก์ไปหน้าสินค้าของหมวดนั้น */}
            <CategoryImageGrid categories={categories} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; // export หน้า HomePage ให้ App/Router นำไปใช้งาน
