import productsData from '../data/products.json'; // ข้อมูลสินค้าเริ่มต้น

export interface Product { // โครงสร้างสินค้า
  id: number;              // ไอดีสินค้า
  name: string;            // ชื่อสินค้า
  price: number;           // ราคา
  image?: string;          // รูป (ไม่บังคับ)
}

const STORAGE_KEY = 'products_data'; // key สำหรับ localStorage

const loadProducts = (): Product[] => {          // โหลดสินค้า
    const savedData = localStorage.getItem(STORAGE_KEY); // ดึงข้อมูลที่เคยบันทึก
    if (savedData) return JSON.parse(savedData);         // ถ้ามี → ใช้ข้อมูลที่เก็บไว้
    return [...productsData];                            // ถ้าไม่มีก็ใช้ seed จากไฟล์
};

const saveProducts = (products: Product[]): void => {               // บันทึกสินค้า
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));   // เขียนลง localStorage
};

export const getAllProducts = (): Product[] => { // ดึงสินค้าทั้งหมด
    return loadProducts();                       // โหลดจาก storage
};

export const getProductById = (id: number): Product | undefined => { // ดึงสินค้าตาม id
    const products = loadProducts();                                   // โหลดทั้งหมด
    return products.find(product => product.id === id);                // หา id ที่ตรงกัน
};

export const createProduct = (productData: Omit<Product, 'id'>): Product => { // เพิ่มสินค้าใหม่
    const products = loadProducts();                                    // โหลดทั้งหมด
    const newId = Math.max(...products.map(p => p.id), 0) + 1;          // สร้างไอดีใหม่
    const newProduct: Product = { id: newId, ...productData };          // ประกอบสินค้าใหม่
    products.push(newProduct);                                          // เพิ่มลง list
    saveProducts(products);                                             // บันทึก
    return newProduct;                                                  // คืนค่า
};

export const updateProduct = ( // อัปเดตสินค้า
  id: number,                                                // ไอดีที่ต้องการแก้
  productData: Partial<Omit<Product, 'id'>>                  // ฟิลด์ที่แก้ไข
): Product | null => {
    const products = loadProducts();                         // โหลดทั้งหมด
    const index = products.findIndex(product => product.id === id); // หา index
    if (index === -1) return null;                           // ไม่พบ
    products[index] = { ...products[index], ...productData }; // รวมข้อมูลเก่า+ใหม่
    saveProducts(products);                                   // บันทึก
    return products[index];                                   // คืนสินค้าใหม่
};

export const deleteProduct = (id: number): boolean => {       // ลบสินค้า
    const products = loadProducts();                           // โหลดทั้งหมด
    const index = products.findIndex(product => product.id === id); // หา index
    if (index === -1) return false;                            // ไม่พบ
    products.splice(index, 1);                                 // ลบ
    saveProducts(products);                                     // บันทึก
    return true;                                               // สำเร็จ
};

export const resetProducts = (): void => {        // ล้างกลับค่าเริ่มต้น
    saveProducts([...productsData]);              // เซฟ seed ใหม่
};
