import React from "react";
import { useParams } from "react-router-dom";
import CategorySidebar from "../components/CategorySidebar";
import ProductCard, { type ProductCardProps } from "../components/ProductCard";
import productsData from "../data/products.json";
import rawCategories from "../data/categorys.json";

const ProductPage: React.FC = () => {
  const { id: selectedKey } = useParams(); // "bags" | "accessories" | ... | undefined
  const products: ProductCardProps[] = (productsData as any[]).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    images: Array.isArray(p.images) ? p.images : [p.image].filter(Boolean),
    storeLink: p.storeLink,
    description: p.description,
    authentic: p.authentic,
  }));

  // หมวดจากไฟล์ (string[])
  const categories = Array.from(
    new Set((rawCategories as Array<{ id?: string }>).map((r) => r.id).filter(Boolean))
  ) as string[];

  // กรองสินค้า: ถ้าไม่มีพารามิเตอร์ (= /product) ให้แสดงทั้งหมด
  const list =
    !selectedKey ? products : products.filter((p) => p.category === selectedKey);

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900">
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-6 py-10 md:py-16 md:grid-cols-[240px_1fr]">
        <CategorySidebar categories={categories} selectedKey={selectedKey} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => <ProductCard key={p.id} {...p} />)}

          {list.length === 0 && (
            <div className="col-span-full rounded-2xl bg-white/70 p-8 text-center text-black/70 shadow">
              ไม่มีสินค้าในหมวดนี้
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductPage;
