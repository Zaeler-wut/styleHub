import React from "react";
import categoriesData from "../data/categorys.json";

type Category = {
  id: string;
  name: string;
  image?: string;
  description?: string;
};

const CategoryImageGrid: React.FC = () => {
  const items = (categoriesData as Category[]).filter((c) => !!c.image);

  return (
    <div className="grid grid-cols-2 gap-6">
      {items.map((c) => (
        <div
          key={c.id}
          className="rounded-xl overflow-hidden bg-white/10 backdrop-blur shadow-lg"
          title={c.name}
        >
          {c.image ? (
            <img src={c.image} alt={c.name} className="w-full h-44 md:h-48 object-cover" />
          ) : (
            <div className="w-full h-44 md:h-48 flex items-center justify-center text-white/70">
              ไม่มีรูป
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryImageGrid;
