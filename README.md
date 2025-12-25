# 🚀 Auto Fill Quiz Extension

Extension Chrome/Edge giúp tự động điền đáp án trắc nghiệm nhanh chóng, chính xác với giao diện **Glassmorphism** hiện đại.

![Auto Fill Quiz UI](https://github.com/user-attachments/assets/placeholder)

## ✨ Tính Năng Nổi Bật

- ✅ **Giao Diện Premium**: Thiết kế kính mờ (Glassmorphism) sang trọng, gọn gàng.
- ✅ **Hỗ Trợ Đa Dạng**: Tự động nhận diện và điền **Radio Button** (chọn 1) và **Checkbox** (chọn nhiều).
- ✅ **Nhập Liệu Thông Minh**: Hỗ trợ nhập chuỗi đáp án liên tiếp (`A,B,C...` hoặc `AB,CD...`).
- ✅ **Hỗ Trợ Iframe**: Tích hợp nút mở nhanh iframe ra tab mới để xử lý các trang nhúng.
- ✅ **Phím Tắt Tiện Lợi**: Thao tác cực nhanh với bàn phím.
- ✅ **Tự Động Lưu**: Ghi nhớ đáp án lần trước, không cần nhập lại.

## 📦 Cài Đặt

1. **Clone/Download** repository này về máy.
2. Mở trình duyệt (Chrome/Edge/Cốc Cốc) và truy cập trang quản lý Extension:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. Bật chế độ **Developer mode** (Góc trên bên phải).
4. Chọn **Load unpacked** (Tải tiện ích đã giải nén).
5. Trỏ đến thư mục chứa source code.
6. ✅ Xong! Ghim extension lên thanh công cụ để dùng nhanh.

## 📖 Hướng Dẫn Sử Dụng

### 1. Điền Đáp Án Thủ Công

Đây là chế độ mặc định, giúp bạn điền hàng loạt câu hỏi trong tích tắc.

1. **Mở Extension**: Click vào icon trên thanh công cụ.
2. **Nhập Đáp Án**:
   - Nhập chuỗi ký tự tương ứng với đáp án của các câu hỏi.
   - Các đáp án cách nhau bởi dấu phẩy (`,`).
   - Ví dụ: `A, B, C, D, A` (Câu 1 chọn A, Câu 2 chọn B...).
3. **Thực Thi**:
   - Nhấn nút **"✨ Điền Đáp Án"**.
   - Hoặc nhấn phím tắt **`Ctrl + Enter`**.
4. **Kết Quả**:
   - Tool sẽ tự động tìm và tick vào các ô tương ứng.
   - Hiển thị thông báo kết quả (Số câu thành công/thất bại).

### 2. Định Dạng Đáp Án

Tool hỗ trợ linh hoạt nhiều kiểu nhập liệu:

- **Câu hỏi 1 đáp án (Radio)**:
  - Nhập: `A, B, C` hoặc `a, b, c` hoặc `1, 2, 3` (1=A, 2=B...).
- **Câu hỏi nhiều đáp án (Checkbox)**:
  - Nhập: `AB, CD, ABC` (Câu đó sẽ chọn cả A và B...).
- **Ví dụ tổng hợp**:
  ```text
  A, AB, C, D
  ```
  -> Câu 1: A, Câu 2: A và B, Câu 3: C, Câu 4: D.

### 3. Xử Lý Trang Có Iframe

Nếu trang web nhúng bài thi trong một khung nhỏ (iframe) và tool không tìm thấy câu hỏi:
1. Mở Extension.
2. Click nút **"📂 Mở Iframe"**.
3. Trang bài thi sẽ được mở ra một tab riêng biệt.
4. Sử dụng tool như bình thường trên tab mới đó.

## ⌨️ Phím Tắt

| Phím Tắt | Chức Năng |
| :--- | :--- |
| **Ctrl + Enter** | Nhấn nút "Điền Đáp Án" ngay lập tức |

## 🎨 Thông Tin Giao Diện

- **Font**: Inter (Google Fonts).
- **Style**: Glassmorphism (Hiệu ứng kính mờ).
- **Icons**: Emoji chuẩn.
- **Tương thích**: Light/Dark mode nền tảng Windows/macOS.

## 📞 Hỗ Trợ

Nếu gặp lỗi hoặc có góp ý, vui lòng liên hệ hoặc tạo Issue trên GitHub.

---

**Made with ❤️ by [trahoangdev](https://github.com/trahoangdev)**
