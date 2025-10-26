/**
 * Cloudinary Image Upload Service
 * 
 * บริการสำหรับอัปโหลดรูปภาพไปยัง Cloudinary Cloud Storage
 * Cloudinary เป็นบริการจัดการไฟล์รูปภาพและวิดีโอบนคลาวด์
 * ที่ให้บริการ CDN, การปรับขนาด, และการจัดการรูปภาพอัตโนมัติ
 */

/**
 * URL ของ Cloudinary API สำหรับการอัปโหลดรูปภาพ
 * รูปแบบ: https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
 * *** สำคัญ: ต้องแก้ไข 'dlx86njpw' เป็น Cloud Name ของตัวเอง ***
 */
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dadyyrajs/image/upload'; // แก้ไขเป็นของตัวเอง

/**
 * Upload Preset สำหรับการกำหนดค่าการอัปโหลด
 * ต้องสร้างใน Cloudinary Dashboard ก่อนการใช้งาน
 * Upload Preset จะกำหนดการตั้งค่าต่างๆ เช่น:
 * - ขนาดรูปภาพที่อนุญาต
 * - รูปแบบไฟล์ที่รับ
 * - การปรับขนาดอัตโนมัติ
 * - โฟลเดอร์ที่จะเก็บไฟล์
 */
const UPLOAD_PRESET = 'products'; // สร้างใน Cloudinary Dashboard

/**
 * อัปโหลดรูปภาพไปยัง Cloudinary
 * 
 * ฟังก์ชันนี้จะรับไฟล์รูปภาพจากผู้ใช้และอัปโหลดไปยัง Cloudinary
 * เพื่อรับ URL ของรูปภาพที่สามารถใช้แสดงผลได้ทันที
 * 
 * การทำงาน:
 * 1. สร้าง FormData เพื่อส่งไฟล์แบบ multipart/form-data
 * 2. ส่งคำขอ POST ไปยัง Cloudinary API
 * 3. รับ URL ของรูปภาพที่อัปโหลดเรียบร้อยแล้ว
 * 
 * @param {File} file - ไฟล์รูปภาพที่จะอัปโหลด (จาก input type="file")
 * @returns {Promise<string | null>} URL ของรูปภาพที่อัปโหลดสำเร็จ หรือ null หากล้มเหลว
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0]; // จาก input file
 * const imageUrl = await uploadImageToCloudinary(file);
 * if (imageUrl) {
 *   console.log('อัปโหลดสำเร็จ:', imageUrl);
 * }
 * ```
 */
export const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
    try {
        // สร้าง FormData object เพื่อจัดเตรียมข้อมูลสำหรับการส่งไฟล์
        // FormData ใช้สำหรับการส่งข้อมูลแบบ multipart/form-data
        const formData = new FormData();
        
        // เพิ่มไฟล์รูปภาพเข้าไปใน FormData
        // 'file' เป็นชื่อ field ที่ Cloudinary API คาดหวัง
        formData.append('file', file);
        
        // เพิ่ม upload preset เพื่อระบุการตั้งค่าการอัปโหลด
        // upload_preset จะกำหนดว่าไฟล์จะถูกจัดการอย่างไรใน Cloudinary
        formData.append('upload_preset', UPLOAD_PRESET);

        // ส่งคำขอ HTTP POST ไปยัง Cloudinary API
        // ใช้ fetch API เพื่อส่งข้อมูลแบบ asynchronous
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',        // ใช้ method POST สำหรับการอัปโหลดไฟล์
            body: formData,        // ส่ง FormData ที่เตรียมไว้
        });

        // แปลง response เป็น JSON เพื่อดึงข้อมูลผลลัพธ์
        // Cloudinary จะส่งข้อมูลรูปภาพที่อัปโหลดกลับมาในรูปแบบ JSON
        const data = await response.json();
        
        // ตรวจสอบว่าการอัปโหลดสำเร็จหรือไม่
        // secure_url คือ URL ของรูปภาพที่ใช้ HTTPS (ปลอดภัย)
        if (data.secure_url) {
            // คืนค่า URL ของรูปภาพที่อัปโหลดสำเร็จ
            return data.secure_url;
        }
        
        // หากไม่มี secure_url หมายความว่าการอัปโหลดล้มเหลว
        return null;
        
    } catch (error) {
        // จัดการข้อผิดพลาดที่อาจเกิดขึ้นระหว่างการอัปโหลด
        // เช่น การเชื่อมต่อเครือข่ายล้มเหลว, ไฟล์ใหญ่เกินไป, หรือ API key ผิด
        console.error('Upload failed:', error);
        
        // คืนค่า null เพื่อแสดงว่าการอัปโหลดล้มเหลว
        return null;
    }
};