# VN-OCR Desktop - Phần Mềm Nhận Dạng Chữ Tiếng Việt Offline Cho Windows

Phần mềm máy tính (Desktop Application) chạy **hoàn toàn OFFLINE 100% trên hệ điều hành Windows**, chuyên dụng để nhận dạng chữ tiếng Việt từ hình ảnh scan, tài liệu chụp, báo cáo, nghị quyết, công văn hành chính và trích xuất thành tệp **Microsoft Word (.docx)** theo thể thức chuẩn quốc gia.

---

## TÍNH NĂNG NỔI BẬT

1. **100% OFFLINE - BẢO MẬT TUYỆT ĐỐI**:
   - Engine OCR (Tesseract LSTM) và bộ từ điển dữ liệu tiếng Việt `vie.traineddata` được tích hợp sẵn bên trong phần mềm.
   - Không gọi bất kỳ API online nào (không Cloud Vision, không OpenAI, không Gemini API).
   - Rút dây mạng, tắt Wi-Fi máy tính vẫn nhận dạng, chỉnh sửa và xuất file Word bình thường.
   - Không lo rò rỉ văn bản mật, văn bản Đảng, tài liệu nội bộ ra Internet.

2. **XỬ LÝ HÀNG LOẠT ẢNH**:
   - Hỗ trợ chọn 1 ảnh, nhiều ảnh cùng lúc, hoặc chọn cả thư mục ảnh.
   - Hỗ trợ kéo thả (Drag & Drop) ảnh trực tiếp vào giao diện.
   - Hỗ trợ các định dạng: **JPG, JPEG, PNG, WEBP, BMP**.
   - Bảng quản lý danh sách: Đổi thứ tự trang linh hoạt (kéo thả hoặc bấm nút mũi tên Lên/Xuống), xóa từng ảnh, xóa tất cả.

3. **GIAO DIỆN XEM VÀ CHỈNH SỬA SONG SONG (SIDE-BY-SIDE)**:
   - **Bên trái**: Trình xem ảnh sắc nét, hỗ trợ Phóng to (Zoom In), Thu nhỏ (Zoom Out), Cuộn chuột, Kéo rê (Pan), Xoay 90° / 180° / 270°.
   - **Bên phải**: Trình soạn thảo văn bản nhận dạng cho phép người dùng kiểm tra, gõ thêm, sửa chữa, định dạng không bị khóa.

4. **BỘ LỌC CẢI THIỆN CHẤT LƯỢNG ẢNH TRƯỚC KHI OCR**:
   - Chuyển ảnh sang đen trắng (Grayscale).
   - Cân bằng độ sáng và tương phản (Contrast & Brightness).
   - **Tẩy trắng nền (Binarization)**: Ứng dụng thuật toán **Otsu** tự động tách chữ mực đen khỏi nền giấy vàng ố, bóng mờ khi scan.
   - Bộ lọc làm nét viền ký tự (Sharpen) và khử đốm nhiễu máy quét (Denoise Filter).
   - Cho phép áp dụng bộ lọc cho 1 ảnh hoặc hàng loạt tất cả các ảnh.

5. **TIẾN TRÌNH OCR THÔNG MINH - KHÔNG TREO MÁY**:
   - Nút **[OCR TẤT CẢ]** chạy ngầm bằng Worker đa luồng, giao diện vẫn mượt mà không bị "Not Responding".
   - Hiển thị thanh tiến trình trực quan: Đang xử lý trang bao nhiêu, phần trăm hoàn thành, thời gian xử lý và độ tin cậy (Confidence %).
   - Tự động bỏ qua lỗi và tiếp tục xử lý các trang tiếp theo. Có nút OCR lại riêng trang lỗi.

6. **GỘP TẤT CẢ VÀ XUẤT MICROSOFT WORD (.DOCX) CHUẨN HÀNH CHÍNH**:
   - Gộp tự động toàn bộ các trang theo đúng thứ tự.
   - Tùy chọn chèn tiêu đề phân trang hoặc không chèn.
   - Tùy chọn tự động ngắt trang (Page Break) để mỗi ảnh tương ứng một trang Word.
   - Cấu hình chuẩn Nghị định 30/2020/NĐ-CP:
     - Phông chữ mặc định: **Times New Roman** (hoặc Arial, Calibri).
     - Cỡ chữ: 13 pt hoặc 14 pt.
     - Căn lề chuẩn văn thư: Trên 2cm, Dưới 2cm, Trái 3cm (đóng gáy), Phải 1.5cm.
     - Đánh số trang tự động ở chân trang (Footer: Trang X / Y).
     - Giãn dòng 1.2 - 1.5 line.
   - Tên file chuẩn: `OCR_TaiLieu_YYYYMMDD_HHMM.docx`.

7. **LƯU & PHỤC HỒI DỰ ÁN (.ocrproject)**:
   - Lưu toàn bộ danh sách ảnh, thứ tự, văn bản đã OCR và chỉnh sửa thành tệp `.ocrproject`.
   - Mở lại dự án bất kỳ lúc nào để tiếp tục làm việc.
   - Tự động lưu bản nháp vào bộ nhớ máy tính cục bộ (IndexedDB) để không bao giờ mất dữ liệu khi vô tình tắt phần mềm.

---

## HƯỚNG DẪN DÀNH CHO LẬP TRÌNH VIÊN ĐÓNG GÓI BẢN WINDOWS (.EXE)

> **LƯU Ý QUAN TRỌNG:**
> * **Môi trường phát triển / build:** Chỉ máy tính dùng để biên dịch phần mềm mới cần cài đặt Node.js.
> * **Người dùng cuối (cán bộ văn phòng, người sử dụng):** **KHÔNG CẦN CÀI ĐẶT** Node.js, Python, Git hay bất kỳ môi trường lập trình nào. Chỉ cần mở file cài đặt `.exe` cài như phần mềm Windows thông thường và sử dụng hoàn toàn Offline!

### Bước 1: Chuẩn bị công cụ trên máy tính Build (Lần đầu tiên)
1. Cài đặt **Node.js LTS** (khuyên dùng bản 18 hoặc 20 trở lên) từ trang chính thức: [https://nodejs.org](https://nodejs.org)
2. Kiểm tra cài đặt thành công bằng cách mở Command Prompt (cmd) hoặc PowerShell:
   ```bash
   node -v
   npm -v
   ```

### Bước 2: Cài đặt Dependencies
Trong thư mục mã nguồn của dự án, mở Terminal/Command Prompt và chạy:
```bash
npm install --legacy-peer-deps
```
Lệnh này sẽ tự động cài đặt toàn bộ thư viện cần thiết: Electron, Electron-Builder, Tesseract.js, Docx, React, TailwindCSS.

### Bước 3: Chạy thử ở chế độ Phát triển (Development)
Để xem và thao tác thử nghiệm trên trình duyệt hoặc dev server:
```bash
npm run dev
```
Sau đó truy cập: `http://localhost:3000`

Để chạy thử nghiệm trực tiếp trong cửa sổ Electron:
```bash
npm run electron:start
```

### Bước 4: Đóng gói thành phần mềm cài đặt Windows (.exe)
Chạy lệnh đóng gói tự động:
```bash
npm run build:win
```
Lệnh này sẽ:
1. Biên dịch toàn bộ mã nguồn giao diện React + Vite tối ưu hóa vào thư mục `dist/`.
2. Đóng gói mã nguồn cùng với dữ liệu OCR tiếng Việt offline `vie.traineddata` và Electron runtime.
3. Tạo ra tệp cài đặt Windows Setup chuẩn NSIS.

*(Nếu muốn tạo bản chạy ngay không cần cài đặt - Portable, chạy: `npm run package:win`)*

### Bước 5: Tìm tệp `.exe` sau khi đóng gói
Sau khi quá trình build kết thúc, tệp cài đặt Windows sẽ nằm tại:
```
dist-electron/
├── Setup_OCR_Offline_0.0.0.exe      <-- BỘ CÀI ĐẶT WINDOWS
└── win-unpacked/                     <-- Bản chạy trực tiếp không cài
    └── VN-OCR Desktop Offline.exe
```

---

## HƯỚNG DẪN DÀNH CHO NGƯỜI DÙNG CUỐI (CHẠY OFFLINE TRÊN WINDOWS)

### Bước 6: Cài đặt và sử dụng trên máy tính Windows (Không có mạng)
1. Chép tệp `Setup_OCR_Offline_0.0.0.exe` vào USB hoặc chuyển sang máy tính Windows của bạn.
2. **Bạn có thể rút dây mạng hoặc ngắt kết nối Wi-Fi hoàn toàn.**
3. Nhấp đúp vào `Setup_OCR_Offline_0.0.0.exe` để cài đặt. Trình cài đặt sẽ tự động tạo biểu tượng (shortcut) ngoài màn hình Desktop.
4. Mở phần mềm **VN-OCR Desktop**:
   - Bấm **"Thêm ảnh"** hoặc kéo thả các tệp ảnh tài liệu vào ứng dụng.
   - Bấm **"OCR TẤT CẢ"** để phần mềm tự động nhận dạng lần lượt từng trang.
   - Kiểm tra và chỉnh sửa nội dung văn bản bên khung bên phải.
   - Bấm **"XUẤT WORD (.DOCX)"** để lưu thành văn bản Word.

---

## CẤU TRÚC THƯ MỤC DỰ ÁN

```
VN-OCR-Desktop/
├── electron/
│   ├── main.cjs               # Xử lý cửa sổ và tệp hệ thống Native Electron
│   └── preload.cjs            # Cầu nối bảo mật giữa Electron và React
├── public/
│   └── tessdata/              # DỮ LIỆU OCR OFFLINE ĐÓNG GÓI SẴN
│       ├── vie.traineddata    # Mô hình ngôn ngữ nhận dạng Tiếng Việt
│       ├── vie.traineddata.gz # Bản nén dữ liệu tiếng Việt
│       ├── eng.traineddata    # Mô hình ngôn ngữ nhận dạng Tiếng Anh
│       ├── worker.min.js      # Luồng xử lý OCR Tesseract ngầm
│       └── tesseract-core*    # Bộ máy WebAssembly xử lý ảnh cục bộ
├── src/
│   ├── components/
│   │   ├── Header.tsx         # Thanh tiêu đề, nút lưu/mở dự án & xuất Word
│   │   ├── Toolbar.tsx        # Thanh công cụ thêm ảnh, chọn ngôn ngữ & PSM
│   │   ├── ImageList.tsx      # Danh sách ảnh, đổi thứ tự, trạng thái
│   │   ├── ImageViewer.tsx    # Trình xem ảnh phóng to, thu nhỏ, xoay
│   │   ├── TextEditor.tsx     # Soạn thảo, tìm kiếm & thay thế, chuẩn hóa dấu
│   │   ├── MergeModal.tsx     # Cửa sổ xem trước gộp tất cả các trang
│   │   ├── DocxSettingsModal.tsx # Cài đặt thể thức xuất Microsoft Word
│   │   ├── ImageEnhanceModal.tsx # Bộ lọc xử lý ảnh scan, Otsu binarize
│   │   └── StatusBar.tsx      # Thanh trạng thái tiến trình và bộ đếm
│   ├── services/
│   │   ├── imageProcessor.ts  # Thuật toán xử lý ảnh Canvas & Otsu Threshold
│   │   ├── ocrService.ts      # Khởi tạo và điều phối Worker Tesseract Offline
│   │   ├── docxExportService.ts # Tạo file .docx chuẩn thể thức Nghị định 30
│   │   └── projectStorage.ts  # Quản lý IndexedDB lưu nháp & file .ocrproject
│   ├── types/
│   │   └── ocr.ts             # Định nghĩa kiểu dữ liệu TypeScript
│   ├── utils/
│   │   ├── sampleDocuments.ts # Bộ tạo tài liệu hành chính mẫu thử nghiệm
│   │   └── textUtils.ts       # Tiện ích đếm từ, chuẩn hóa tiếng Việt NFC
│   ├── App.tsx                # Luồng xử lý trung tâm ứng dụng
│   ├── index.css              # Giao diện Tailwind CSS
│   └── main.tsx               # Điểm khởi chạy React
├── package.json               # Cấu hình dự án & electron-builder
├── vite.config.ts             # Cấu hình Vite đường dẫn tương đối (base: './')
└── README.md                  # Hướng dẫn chi tiết
```

---

## DANH SÁCH THƯ VIỆN CHÍNH (DEPENDENCIES)

- **tesseract.js**: Bộ máy OCR WebAssembly chạy trên luồng Web Worker không làm đơ giao diện.
- **docx**: Thư viện tạo file Word `.docx` 100% bằng JavaScript không cần cài Microsoft Office trên máy tính.
- **electron & electron-builder**: Khung phần mềm đóng gói ứng dụng Windows độc lập.
- **react & react-dom**: Giao diện người dùng hiện đại, phản hồi tức thời.
- **lucide-react**: Bộ biểu tượng ứng dụng văn phòng trực quan, chuẩn chỉ.
- **tailwindcss**: Định dạng phong cách giao diện Desktop cao cấp.
