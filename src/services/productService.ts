/**
 * นำเข้าข้อมูลผลิตภัณฑ์เริ่มต้นจากไฟล์ JSON
 * ใช้เป็นข้อมูลตั้งต้นเมื่อไม่มีข้อมูลใน localStorage
 */
import productsData from '../data/products.json';

/**
 * Interface กำหนดโครงสร้างข้อมูลผลิตภัณฑ์
 * @interface Product
 * @property {number} id - รหัสเฉพาะของผลิตภัณฑ์ (Primary Key)
 * @property {string} name - ชื่อผลิตภัณฑ์
 * @property {number} price - ราคาผลิตภัณฑ์ (บาท)
 * @property {string} [image] - URL ของรูปภาพผลิตภัณฑ์ (ไม่บังคับ)
 */
export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
}

/**
 * คีย์สำหรับเก็บข้อมูลใน localStorage
 * ใช้เป็นตัวระบุข้อมูลผลิตภัณฑ์ในเบราว์เซอร์
 */
const STORAGE_KEY = 'products_data';

/**
 * โหลดข้อมูลผลิตภัณฑ์จาก localStorage หรือใช้ข้อมูลเริ่มต้น
 * 
 * ฟังก์ชันนี้จะพยายามโหลดข้อมูลจาก localStorage ก่อน
 * หากไม่มีข้อมูลหรือเกิดข้อผิดพลาด จะใช้ข้อมูลเริ่มต้นจากไฟล์ JSON แทน
 * 
 * @returns {Product[]} อาร์เรย์ของผลิตภัณฑ์ทั้งหมด
 */
const loadProducts = (): Product[] => {
    // ดึงข้อมูลที่บันทึกไว้จาก localStorage
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    // หากมีข้อมูลที่บันทึกไว้ ให้แปลงจาก JSON string กลับเป็น Object
    if (savedData) {
        return JSON.parse(savedData);
    }
    
    // หากไม่มีข้อมูลใน localStorage ให้ใช้ข้อมูลเริ่มต้น
    // ใช้ spread operator เพื่อสร้าง array ใหม่ (ไม่ใช่ reference)
    return [...productsData];
};

/**
 * บันทึกข้อมูลผลิตภัณฑ์ลง localStorage
 * 
 * ฟังก์ชันนี้จะแปลงข้อมูล array ของผลิตภัณฑ์เป็น JSON string
 * แล้วบันทึกลงใน localStorage เพื่อให้ข้อมูลคงอยู่ระหว่างการใช้งาน
 * 
 * @param {Product[]} products - อาร์เรย์ของผลิตภัณฑ์ที่ต้องการบันทึก
 * @returns {void}
 */
const saveProducts = (products: Product[]): void => {
    // แปลงข้อมูล JavaScript Object เป็น JSON string แล้วบันทึกลง localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

/**
 * ดึงข้อมูลผลิตภัณฑ์ทั้งหมด
 * 
 * ฟังก์ชันนี้ใช้สำหรับการแสดงรายการผลิตภัณฑ์ทั้งหมด
 * เช่น ในหน้าแสดงสินค้าหรือหน้าจัดการสินค้า
 * 
 * @returns {Product[]} อาร์เรย์ของผลิตภัณฑ์ทั้งหมดที่มีอยู่ในระบบ
 */
export const getAllProducts = (): Product[] => {
    // เรียกใช้ฟังก์ชัน loadProducts เพื่อโหลดข้อมูลจาก localStorage หรือข้อมูลเริ่มต้น
    return loadProducts();
};

/**
 * ค้นหาผลิตภัณฑ์จากรหัสเฉพาะ (ID)
 * 
 * ฟังก์ชันนี้ใช้สำหรับการดึงข้อมูลผลิตภัณฑ์รายการเดียว
 * เช่น ในหน้าแสดงรายละเอียดสินค้าหรือหน้าแก้ไขสินค้า
 * 
 * @param {number} id - รหัสเฉพาะของผลิตภัณฑ์ที่ต้องการค้นหา
 * @returns {Product | undefined} ผลิตภัณฑ์ที่ตรงกับ ID หรือ undefined หากไม่พบ
 */
export const getProductById = (id: number): Product | undefined => {
    // โหลดข้อมูลผลิตภัณฑ์ทั้งหมด
    const products = loadProducts();
    
    // ใช้ method find() เพื่อค้นหาผลิตภัณฑ์ที่มี ID ตรงกับที่ต้องการ
    // หากพบจะคืนค่าผลิตภัณฑ์นั้น หากไม่พบจะคืนค่า undefined
    return products.find(product => product.id === id);
};

/**
 * เพิ่มผลิตภัณฑ์ใหม่เข้าสู่ระบบ
 * 
 * ฟังก์ชันนี้จะสร้าง ID ใหม่อัตโนมัติและเพิ่มผลิตภัณฑ์เข้าไปในรายการ
 * ใช้สำหรับการเพิ่มสินค้าใหม่ในระบบ เช่น ในฟอร์มเพิ่มสินค้า
 * 
 * @param {Omit<Product, 'id'>} productData - ข้อมูลผลิตภัณฑ์ใหม่ (ไม่รวม ID)
 * @returns {Product} ผลิตภัณฑ์ที่เพิ่งสร้างใหม่พร้อม ID
 */
export const createProduct = (productData: Omit<Product, 'id'>): Product => {
    // โหลดข้อมูลผลิตภัณฑ์ทั้งหมดที่มีอยู่
    const products = loadProducts();
    
    // สร้าง ID ใหม่โดยหาค่า ID สูงสุดจากผลิตภัณฑ์ที่มีอยู่แล้วบวก 1
    // ใช้ Math.max() กับ spread operator เพื่อหาค่าสูงสุด
    // กรณีที่ไม่มีผลิตภัณฑ์ใดเลย ให้ใช้ 0 + 1 = 1 เป็น ID แรก
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    
    // สร้างออบเจ็กต์ผลิตภัณฑ์ใหม่โดยรวม ID ที่สร้างขึ้นกับข้อมูลที่รับมา
    const newProduct: Product = {
        id: newId,
        ...productData // ใช้ spread operator เพื่อคัดลอกคุณสมบัติทั้งหมด
    };
    
    // เพิ่มผลิตภัณฑ์ใหม่เข้าไปในอาร์เรย์
    products.push(newProduct);
    
    // บันทึกข้อมูลที่อัปเดตแล้วลง localStorage
    saveProducts(products);
    
    // คืนค่าผลิตภัณฑ์ที่เพิ่งสร้างใหม่
    return newProduct;
};

/**
 * แก้ไขข้อมูลผลิตภัณฑ์ที่มีอยู่
 * 
 * ฟังก์ชันนี้จะค้นหาผลิตภัณฑ์จาก ID แล้วอัปเดตข้อมูลตามที่ส่งมา
 * สามารถอัปเดตเฉพาะฟิลด์ที่ต้องการได้ (Partial Update)
 * ใช้สำหรับการแก้ไขข้อมูลสินค้า เช่น ในฟอร์มแก้ไขสินค้า
 * 
 * @param {number} id - รหัสเฉพาะของผลิตภัณฑ์ที่ต้องการแก้ไข
 * @param {Partial<Omit<Product, 'id'>>} productData - ข้อมูลที่ต้องการอัปเดต (บางฟิลด์เท่านั้น)
 * @returns {Product | null} ผลิตภัณฑ์ที่อัปเดตแล้ว หรือ null หากไม่พบ ID
 */
export const updateProduct = (id: number, productData: Partial<Omit<Product, 'id'>>): Product | null => {
    // โหลดข้อมูลผลิตภัณฑ์ทั้งหมด
    const products = loadProducts();
    
    // ค้นหา index ของผลิตภัณฑ์ที่ต้องการแก้ไข
    const index = products.findIndex(product => product.id === id);
    
    // หากไม่พบผลิตภัณฑ์ที่ต้องการ (index = -1) ให้คืนค่า null
    if (index === -1) return null;
    
    // อัปเดตข้อมูลผลิตภัณฑ์โดยรวมข้อมูลเก่ากับข้อมูลใหม่
    // ใช้ spread operator เพื่อคงข้อมูลเก่าไว้และเขียนทับด้วยข้อมูลใหม่
    products[index] = { ...products[index], ...productData };
    
    // บันทึกข้อมูลที่อัปเดตแล้วลง localStorage
    saveProducts(products);
    
    // คืนค่าผลิตภัณฑ์ที่อัปเดตแล้ว
    return products[index];
};

/**
 * ลบผลิตภัณฑ์จากระบบ
 * 
 * ฟังก์ชันนี้จะค้นหาและลบผลิตภัณฑ์ที่ตรงกับ ID ที่ระบุ
 * ใช้สำหรับการลบสินค้า เช่น ในหน้าจัดการสินค้าหรือการยืนยันการลบ
 * 
 * @param {number} id - รหัสเฉพาะของผลิตภัณฑ์ที่ต้องการลบ
 * @returns {boolean} true หากลบสำเร็จ, false หากไม่พบผลิตภัณฑ์
 */
export const deleteProduct = (id: number): boolean => {
    // โหลดข้อมูลผลิตภัณฑ์ทั้งหมด
    const products = loadProducts();
    
    // ค้นหา index ของผลิตภัณฑ์ที่ต้องการลบ
    const index = products.findIndex(product => product.id === id);
    
    // หากไม่พบผลิตภัณฑ์ที่ต้องการ (index = -1) ให้คืนค่า false
    if (index === -1) return false;
    
    // ลบผลิตภัณฑ์ออกจากอาร์เรย์โดยใช้ splice()
    // splice(index, 1) หมายถึงลบ 1 รายการเริ่มจาก index ที่ระบุ
    products.splice(index, 1);
    
    // บันทึกข้อมูลที่อัปเดตแล้วลง localStorage
    saveProducts(products);
    
    // คืนค่า true เพื่อแสดงว่าลบสำเร็จ
    return true;
};

/**
 * รีเซ็ตข้อมูลผลิตภัณฑ์กลับเป็นค่าเริ่มต้น
 * 
 * ฟังก์ชันนี้จะเคลียร์ข้อมูลทั้งหมดที่มีใน localStorage 
 * และโหลดข้อมูลเริ่มต้นจากไฟล์ JSON กลับมาใช้ใหม่
 * ใช้สำหรับการรีเซ็ตระบบหรือกรณีที่ต้องการเริ่มต้นใหม่
 * 
 * @returns {void}
 */
export const resetProducts = (): void => {
    // บันทึกข้อมูลเริ่มต้นลง localStorage โดยสร้าง array ใหม่
    // ใช้ spread operator เพื่อหลีกเลี่ยงการแก้ไขข้อมูลต้นฉบับ
    saveProducts([...productsData]);
};