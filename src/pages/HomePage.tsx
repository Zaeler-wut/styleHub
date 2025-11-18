// src/pages/HomePage.tsx
import React from "react"; // นำเข้า React เพื่อใช้ประกาศคอมโพเนนต์แบบ React.FC
import CategoryButtonList from "../components/CategoryButtonList"; // ปุ่มหมวดหมู่แบบเป็นแคปซูล ใช้กดไปหน้า products ตามหมวด
import CategoryImageGrid from "../components/CategoryImageGrid"; // กริดรูปภาพหมวดหมู่สำหรับแสดงฝั่งขวา
import { type Product } from "../types/product"; // type Product เผื่อใช้กับ props ในอนาคต
import { type Category } from "../types/category"; // type Category ใช้ระบุชนิดของ categories ที่รับจาก App

type Props = {                // กำหนดชนิดของ props ที่หน้า HomePage จะรับ
  products: Product[];        // รายการสินค้า (ยังไม่ได้ใช้ตอนนี้ แต่เผื่อใช้ต่อ)
  categories: Category[];     // รายการหมวดหมู่จาก state/localStorage ที่อัปเดตล่าสุด
};                            // ปิด type Props

const HomePage: React.FC<Props> = ({ products, categories }) => { // ประกาศคอมโพเนนต์ HomePage แบบ React.FC และ destructure props
  return ( // เริ่ม JSX ของหน้าโฮม
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900 text-gray-900"> {/* พื้นหลังไล่สีชมพู→ม่วง สูงอย่างน้อยเต็มจอ */}
      <section className="mx-auto w-full px-6 py-10 md:py-16"> {/* ส่วนหลักของหน้า มี padding รอบด้านและจัดให้อยู่กลาง */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 max-w-[1200px] mx-auto"> {/* กำหนดเป็น grid 1 คอลัมน์บนมือถือ และ 12 คอลัมน์บนจอใหญ่ จำกัดความกว้างที่ 1200px */}
          {/* ซ้าย: Hero + ปุ่มหมวดหมู่ */}
          <div className="md:col-span-6 lg:col-span-5"> {/* ฝั่งซ้ายกิน 6 คอลัมน์บน md และ 5 คอลัมน์บน lg */}
            <h1 className="text-5xl font-extrabold leading-tight text-black drop-shadow-sm md:text-6xl"> {/* หัวข้อใหญ่ของหน้า (Hero title) */}
              Top Guide !
            </h1>
            <p className="mt-4 text-lg text-black/90"> {/* ข้อความอธิบายสั้น ๆ ใต้หัวเรื่อง */}
              ช่วยเลือกร้านค้าที่ดีที่สุดให้กับคุณ รวมสินค้าน่าสนใจ พร้อมพิกัดร้านค้า
            </p>
            <p className="text-md mt-1 text-black/80">เลือกหมวดหมู่ที่สนใจได้เลย !</p> {/* ข้อความเชิญชวนให้เลือกหมวดหมู่ */}

            {/* ปุ่มหมวดหมู่ → ใช้ categories จาก state */}
            <CategoryButtonList categories={categories} limit={6} /> {/* แสดงปุ่มหมวดหมู่สูงสุด 6 หมวด โดยใช้ข้อมูลจาก categories สด */}
          </div>

          {/* ขวา: กริดรูปหมวดหมู่ → ใช้ categories จาก state (รองรับ DataURL) */}
          <div className="md:col-span-6 lg:col-span-7"> {/* ฝั่งขวากิน 6 คอลัมน์บน md และ 7 คอลัมน์บน lg */}
            <CategoryImageGrid categories={categories} /> {/* แสดงกริดรูปภาพหมวดหมู่จาก categories ซึ่งอาจเป็น URL หรือ DataURL ก็ได้ */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; // ส่งออกคอมโพเนนต์ HomePage เป็น default ให้ไฟล์อื่น import ไปใช้
