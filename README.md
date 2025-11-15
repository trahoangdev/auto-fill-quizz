# 🚀 Auto Fill Quiz Extension - AI Powered

Extension Chrome/Edge tự động điền đáp án trắc nghiệm với **AI Gemini** - Đơn giản, nhanh chóng, thông minh.

## ✨ Tính Năng

### 🤖 AI Helper (MỚI!)
- ✅ **Hỏi AI từng câu** - Paste câu hỏi → AI trả lời ngay
- ✅ **Tự động ghép đáp án** - Không cần nhập thủ công
- ✅ **Tự động lưu** - Đóng extension không lo mất dữ liệu
- ✅ **Gemini 2.5 Flash** - Model mới nhất, trả lời chính xác
- ✅ **Miễn phí** - Dùng Gemini API key miễn phí

### 📝 Manual Mode
- ✅ **Nhập đáp án thủ công** - Nhanh chóng khi đã có đáp án
- ✅ **Hỗ trợ Radio + Checkbox** - Chọn 1 hoặc nhiều đáp án
- ✅ **Chọn nhiều đáp án** - Cú pháp: AB, CD, ABC...
- ✅ **Hỗ trợ iframe** - Tự động mở iframe ra tab mới
- ✅ **Lưu đáp án tự động** - Không cần nhập lại
- ✅ **Highlight đáp án** - Đáp án được tô màu xanh
- ✅ **Phím tắt** - Ctrl+Enter để điền nhanh

## 📦 Cài Đặt

### Bước 1: Tải Extension
```bash
git clone <repository-url>
cd auto-fill-quiz
```

### Bước 2: Cài vào Chrome/Edge
1. Mở Chrome/Edge
2. Vào `chrome://extensions/` hoặc `edge://extensions/`
3. Bật **Developer mode** (góc trên bên phải)
4. Click **Load unpacked**
5. Chọn thư mục chứa extension
6. ✅ Xong!

### Bước 3: Ghim Extension (Khuyên dùng)
- Click icon puzzle 🧩 trên toolbar
- Tìm "Auto Fill Quiz"
- Click ghim 📌

## 🤖 Cách Sử Dụng AI Helper (Khuyên Dùng!)

### Bước 1: Lấy Gemini API Key (Miễn phí)
1. Truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập Google
3. Click **"Create API Key"**
4. Copy API key

### Bước 2: Sử Dụng AI Helper
1. Mở trang bài thi
2. Click icon extension
3. Chuyển sang tab **"🤖 AI Helper"**
4. Nhập API Key (chỉ cần 1 lần)
5. **Paste câu hỏi đầu tiên** vào ô "Paste câu hỏi"
6. Click **"🤖 Hỏi AI Câu Này"** (hoặc Ctrl+Enter)
7. AI trả lời ngay, đáp án tự động thêm vào ô bên dưới
8. **Lặp lại bước 5-7** cho các câu tiếp theo
9. Khi đủ đáp án, click **"✨ Điền Đáp Án"**
10. ✅ Xong!

### Ưu điểm AI Helper:
- ✅ **Xử lý từng câu** - Không bị lỗi MAX_TOKENS
- ✅ **Kiểm soát được** - Xem từng đáp án trước khi ghép
- ✅ **Tự động lưu** - Đóng extension không lo mất dữ liệu
- ✅ **Chính xác hơn** - AI nhận đủ thông tin để trả lời đúng
- ⚠️ AI có thể sai, nên **kiểm tra lại** trước khi submit

### Lưu ý:
- ⚠️ Gemini API miễn phí có giới hạn: **60 requests/phút**
- ✅ API key được lưu local, an toàn
- ✅ Đáp án tự động lưu, không lo mất

## 💡 Cách Sử Dụng Manual Mode

### Trường hợp 1: Trang có iframe (apps.lms.hutech.edu.vn)

**Bước 1: Mở iframe**
1. Mở trang bài thi
2. Click icon extension
3. Tab **"📝 Manual"**
4. Click **"📂 Mở Iframe Ra Tab Mới"**

**Bước 2: Điền đáp án**
1. Ở tab mới, click icon extension
2. Nhập đáp án: `AB,C,BD,A`
3. Nhấn **Enter** (hoặc click nút)
4. ✅ Xong!

### Trường hợp 2: Trang thường

1. Click icon extension
2. Tab **"📝 Manual"**
3. Nhập đáp án: `AB,C,BD,A`
4. Nhấn **Ctrl + Enter**
5. ✅ Xong!

## 📝 Định Dạng Đáp Án

### Chọn 1 đáp án (Radio Button):
```
A,C,B,D
a,c,b,d
0,2,1,3
```

### Chọn nhiều đáp án (Checkbox):
```
AB,C,BD,A      ← Câu 1: chọn A và B, Câu 2: chọn C, Câu 3: chọn B và D, Câu 4: chọn A
01,2,13,0      ← Tương tự với số (0=A, 1=B, 2=C, 3=D)
ABC,D,AB,BCD   ← Có thể chọn 3-4 đáp án
```

### Lưu ý:
- **Radio button** (chọn 1): Nếu nhập nhiều ký tự (AB), chỉ chọn ký tự đầu tiên (A)
- **Checkbox** (chọn nhiều): Có thể nhập nhiều ký tự (AB, CD, ABC...)
- Extension tự động nhận diện loại câu hỏi

## ⚡ Workflow Siêu Nhanh

### Với AI Helper (Khuyên dùng):
1. Click icon extension → Tab **"🤖 AI Helper"**
2. Paste câu hỏi 1 → **Ctrl+Enter**
3. Paste câu hỏi 2 → **Ctrl+Enter**
4. ... (lặp lại cho các câu tiếp theo)
5. Click **"✨ Điền Đáp Án"**
6. ✅ Xong! (10-30 giây tùy số câu)

### Với Manual Mode:
1. Click icon extension → Tab **"📝 Manual"**
2. **Ctrl+V** (paste đáp án)
3. **Ctrl+Enter**
4. ✅ Xong trong 2 giây!

## 🎯 Ví Dụ

### Ví dụ 1: Dùng AI Helper

```
Bước 1: Mở trang bài thi
→ Vào: apps.lms.hutech.edu.vn/courses/...

Bước 2: Chuyển sang AI Helper
→ Click icon extension
→ Tab "🤖 AI Helper"
→ Nhập API Key (nếu chưa có)

Bước 3: Hỏi AI từng câu
→ Copy câu hỏi 1 → Paste → Ctrl+Enter → AI trả lời "A"
→ Copy câu hỏi 2 → Paste → Ctrl+Enter → AI trả lời "D"
→ Copy câu hỏi 3 → Paste → Ctrl+Enter → AI trả lời "B"
→ ... (lặp lại)
→ Đáp án tự động ghép: A,D,B,C,A,B...

Bước 4: Điền đáp án
→ Click "✨ Điền Đáp Án"
→ ✅ Hoàn thành!
```

### Ví dụ 2: Thủ công với Checkbox

```
Câu hỏi:
1. Ngôn ngữ OOP? (Chọn nhiều)
   ☐ A. Java
   ☐ B. Python
   ☐ C. HTML
   ☐ D. CSS

2. HTTP là gì?
   ○ A. Program
   ○ B. Package
   ○ C. Protocol
   ○ D. Transmission

Đáp án: AB,C
→ Câu 1: Chọn A và B (Java + Python)
→ Câu 2: Chọn C (Protocol)
```

## 🎨 Giao Diện

### Tab 1: 📝 Manual Mode
```
┌─────────────────────────────────┐
│ [📝 Manual] [🤖 AI Helper]      │
├─────────────────────────────────┤
│ 📝 Nhập Đáp Án Thủ Công         │
│                                 │
│ Đáp án:                         │
│ ┌─────────────────────────────┐ │
│ │ A,C,B,D,A,B                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📂 Mở Iframe Ra Tab Mới     │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ✨ Điền Đáp Án              │ │
│ └─────────────────────────────┘ │
│                                 │
│ 💡 Ctrl+Enter để điền nhanh     │
└─────────────────────────────────┘
```

### Tab 2: 🤖 AI Helper (MỚI!)
```
┌─────────────────────────────────┐
│ [📝 Manual] [🤖 AI Helper]      │
├─────────────────────────────────┤
│ 🤖 AI Trợ Giúp                  │
│                                 │
│ 🔑 Gemini API Key:              │
│ ┌─────────────────────────────┐ │
│ │ ••••••••••••••••••••••••••  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ❓ Paste câu hỏi:               │
│ ┌─────────────────────────────┐ │
│ │ Câu 1: Java là gì?          │ │
│ │ A. Ngôn ngữ                 │ │
│ │ B. Framework...             │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 🤖 Hỏi AI Câu Này           │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Đáp án: A                   │ │ ← Hiển thị ngay
│ └─────────────────────────────┘ │
│                                 │
│ 📝 Đáp án (tự động ghép):       │
│ ┌─────────────────────────────┐ │
│ │ A,D,B,C...                  │ │ ← Tự động thêm
│ └─────────────────────────────┘ │
│ ✅ Tự động lưu - không lo mất   │
│ ┌─────────────────────────────┐ │
│ │ 🗑️ Xóa Đáp Án               │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ✨ Điền Đáp Án              │ │
│ └─────────────────────────────┘ │
│                                 │
│ 💡 Ctrl+Enter để hỏi AI nhanh   │
└─────────────────────────────────┘
```

## 📊 Hiệu Suất

| Metric | Giá trị |
|--------|---------|
| AI Response Time | 2-5 giây/câu |
| Manual Fill Time | 2 giây |
| Code size | ~600 dòng |
| Memory | ~3MB |
| Accuracy (AI) | ~85-95% |
| Accuracy (Manual) | 100% |

## 🔧 Tính Năng Nâng Cao

### 1. Lưu API Key Tự Động
- Extension tự động lưu API key
- Không cần nhập lại mỗi lần
- Lưu local, an toàn

### 2. Lưu Đáp Án Tự Động
- Extension tự động lưu đáp án lần trước
- Mở lại extension → Đáp án đã có sẵn
- Không cần nhập lại

### 3. Auto-Select Text
- Mở extension → Text tự động được select
- Paste (Ctrl+V) → Ghi đè luôn
- Không cần xóa text cũ

### 4. Phím Tắt
- **Ctrl+Enter**: Điền đáp án ngay
- **Enter**: Submit (sau khi paste)

### 5. AI Helper Thông Minh
- Xử lý từng câu một (tránh lỗi MAX_TOKENS)
- Tự động ghép đáp án
- Tự động lưu (không lo mất dữ liệu)
- Gemini 2.5 Flash (model mới nhất)

## 🐛 Xử Lý Lỗi

### Lỗi: "Không tìm thấy iframe"
**Nguyên nhân:** Trang không có iframe

**Giải pháp:** Bỏ qua nút "Mở Iframe", dùng trực tiếp nút "Điền Đáp Án"

### Lỗi: "Không tìm thấy câu hỏi"
**Nguyên nhân:** Trang chưa load xong hoặc AI không quét được

**Giải pháp:**
1. Đợi trang load hoàn toàn
2. Cuộn xuống xem câu hỏi
3. Thử lại hoặc dùng thủ công

### Lỗi: "AI không thể trả lời"
**Nguyên nhân:** API key sai hoặc hết quota

**Giải pháp:**
1. Kiểm tra API key
2. Tạo API key mới
3. Đợi 1 phút (rate limit)
4. Hoặc dùng thủ công

### Extension không mở tab mới
**Nguyên nhân:** Trình duyệt chặn popup

**Giải pháp:**
- Cho phép popup từ extension
- Hoặc mở iframe thủ công: Chuột phải → "Open frame in new tab"

## 💡 Tips & Tricks

### Tip 1: Dùng AI Helper cho bài khó
- AI Helper phù hợp cho bài có nhiều câu
- Paste từng câu → AI trả lời ngay
- Kiểm soát được từng đáp án
- Nhớ kiểm tra lại trước khi submit!

### Tip 2: Dùng thủ công cho bài đơn giản
- Nhanh hơn nếu đã có đáp án
- Chính xác 100%
- Không cần API key

### Tip 3: Keyboard Only
```
1. Click icon (hoặc phím tắt)
2. Ctrl+V (paste)
3. Enter
→ Không cần chuột!
```

### Tip 4: Lưu Đáp Án Trong Notepad
- Lưu đáp án các bài trong file text
- Copy/paste nhanh khi cần
- Ví dụ:
  ```
  Bài 1: AB,C,BD,A
  Bài 2: B,C,A,B
  Bài 3: C,D,B,A
  ```

## �  Cấu Trúc Files

```
📁 auto-fill-quiz/
├── 🔧 Extension Files:
│   ├── manifest.json          # Cấu hình extension
│   ├── popup.html             # Giao diện
│   ├── popup.js               # Logic + AI integration
│   └── icon.png               # Icon
│
├── 📜 Script Thủ Công (Backup):
│   ├── autofill-manual.js     # Script chạy trong Console
│   └── autofill-v2.js         # Script inject
│
├── 📖 Tài Liệu:
│   ├── README.md              # File này
│   ├── CHANGELOG.md           # Lịch sử cập nhật
│   └── HUONG-DAN-SU-DUNG.md   # Hướng dẫn chi tiết
│
└── 🧪 Test:
    ├── test.html              # File test local
    └── test-checkbox.html     # Test checkbox
```

## 🔄 Cập Nhật Extension

Sau khi cập nhật code:
1. Vào `chrome://extensions/`
2. Tìm "Auto Fill Quiz"
3. Click reload ⟳
4. Thử lại

## 🔒 Bảo Mật & Quyền Riêng Tư

- ✅ Extension chỉ chạy khi bạn click
- ✅ Không thu thập dữ liệu cá nhân
- ✅ API key lưu local (chrome.storage.local)
- ✅ Không gửi thông tin ra ngoài (trừ Gemini API)
- ✅ Chỉ hoạt động trên trang bạn đang mở
- ✅ Mã nguồn mở, có thể kiểm tra
- ⚠️ Câu hỏi được gửi đến Gemini API để xử lý

## 📞 Hỗ Trợ

### Nếu gặp vấn đề:
1. Đọc lại hướng dẫn
2. Kiểm tra Console (F12) để xem log
3. Reload extension
4. Thử script thủ công (autofill-manual.js)

### Debug:
- Mở Console (F12)
- Xem log bắt đầu bằng `[AI]` hoặc `[DEBUG]`
- Copy log để phân tích

## 📄 License

MIT License - Tự do sử dụng cho mục đích học tập.

## 🎉 Kết Luận

Extension **Auto Fill Quiz** với **AI Gemini** là giải pháp tối ưu nhất:

**Ưu điểm:**
- ✅ AI tự động trả lời (90% accuracy)
- ✅ Hỗ trợ đầy đủ Radio + Checkbox
- ✅ Chọn nhiều đáp án trong 1 câu
- ✅ Cực kỳ đơn giản (3-5 thao tác)
- ✅ Cực kỳ nhanh (5-10 giây với AI, 2 giây thủ công)
- ✅ Miễn phí (Gemini API free tier)
- ✅ Tự động lưu API key và đáp án
- ✅ Hỗ trợ iframe
- ✅ Keyboard-friendly

**Workflow với AI Helper:**
1. Click icon → Tab "🤖 AI Helper"
2. Paste câu hỏi → Ctrl+Enter (lặp lại cho mỗi câu)
3. Click "✨ Điền Đáp Án"
4. Xong!

**Workflow với Manual:**
1. Click icon → Tab "📝 Manual"
2. Paste đáp án → Ctrl+Enter
3. Xong!

---

**Chúc bạn làm bài tốt! 🎉**

**Made with ❤️ and 🤖 AI by trahoangdev**

**Version:** 3.0 (AI Helper + Manual Mode)
