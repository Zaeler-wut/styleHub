import React from "react";
import CategoryButtonList from "../components/CategoryButtonList";
import CategoryImageGrid from "../components/CategoryImageGrid"; // ของคุณที่ดึงรูปจาก data/categorys.json เช่นกัน

const HomePage: React.FC = () => {
  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900 text-gray-900">
      <section className="mx-auto w-full px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 max-w-[1200px] mx-auto">
          {/* ซ้าย: Hero + ปุ่มหมวดหมู่ */}
          <div className="md:col-span-6 lg:col-span-5">
            <h1 className="text-5xl font-extrabold leading-tight text-black drop-shadow-sm md:text-6xl">
              Top Guide !
            </h1>
            <p className="mt-4 text-lg text-black/90">
              ช่วยเลือกร้านค้าที่ดีที่สุดให้กับคุณ รวมสินค้าน่าสนใจ พร้อมพิกัดร้านค้า
            </p>
            <p className="text-md mt-1 text-black/80">เลือกหมวดหมู่ที่สนใจได้เลย !</p>

            {/* ปุ่มหมวดหมู่จากไฟล์จริง */}
            <CategoryButtonList limit={6} />
          </div>

          {/* ขวา: กริดรูปหมวดหมู่ */}
          <div className="md:col-span-6 lg:col-span-7">
            <CategoryImageGrid />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
