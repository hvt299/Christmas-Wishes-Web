<div align="center">

  <h1>Christmas Wishes Web</h1>
  <h3>Nền tảng Gửi tặng và Khám phá Hộp quà Giáng Sinh Bí mật</h3>

  <p>
    Một ứng dụng Web hiện đại mang không khí Giáng Sinh ấm áp lên không gian số. 
    Hệ thống cho phép người dùng tự tay "đóng gói" những hộp quà ảo với lời chúc ý nghĩa, tùy chỉnh màu sắc, đính kèm âm nhạc và gửi tặng người thân yêu thông qua các đường link chia sẻ độc đáo.
  </p>

  <p>
    <strong>Hệ sinh thái Lễ hội & SSO:</strong> Dự án này là một phần của <em>Festive Ecosystem</em>, chia sẻ chung hệ thống tài khoản (Single Sign-On - SSO) và cơ sở dữ liệu với dự án Tết Countdown. Người dùng chỉ cần đăng ký một lần để trải nghiệm xuyên suốt các mùa lễ hội.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.4.3-black?logo=next.js&logoColor=white" alt="Next.js">
    <img src="https://img.shields.io/badge/React-19.2.6-61DAFB?logo=react&logoColor=black" alt="React 19">
    <img src="https://img.shields.io/badge/TailwindCSS-v4.3.3-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Zustand-v5.0.16-brown?logo=react&logoColor=white" alt="Zustand">
    <img src="https://img.shields.io/badge/Axios-1.20.0-5A29E4?logo=axios&logoColor=white" alt="Axios">
    <img src="https://img.shields.io/badge/status-Active_Development-success" alt="Status">
  </p>

</div>

<br />

# FRONTEND WEB APPLICATION

Đây là Repository chứa mã nguồn **Frontend**, cung cấp giao diện tương tác trực quan, hiệu ứng tuyết rơi lãng mạn, các chuyển động 3D mở hộp quà chân thực và hệ thống phát nhạc nền toàn cục.

---

## Mục lục

- [1. Công nghệ & Thư viện Cốt lõi](#1-công-nghệ--thư-viện-cốt-lõi)
  - [Khung Giao diện & Nền tảng Ứng dụng](#khung-giao-diện--nền-tảng-ứng-dụng)
  - [Thiết kế Giao diện, Biểu tượng & Trải nghiệm](#thiết-kế-giao-diện-biểu-tượng--trải-nghiệm)
  - [Mạng, Xác thực & Trạng thái Toàn cục](#mạng-xác-thực--trạng-thái-toàn-cục)
  - [Hoạt họa & Hiệu ứng Thị giác](#hoạt-họa--hiệu-ứng-thị-giác)
- [2. Tính năng Giao diện & Trải nghiệm Người dùng](#2-tính-năng-giao-diện--trải-nghiệm-người-dùng)
  - [2.1. Đóng Gói Quà (Create Gift)](#21-đóng-gói-quà-create-gift)
  - [2.2. Mở Quà Tương Tác (Open Gift)](#22-mở-quà-tương-tác-open-gift)
  - [2.3. Hiệu Ứng Bầu Không Khí Lễ Hội (Atmosphere)](#23-hiệu-ứng-bầu-không-khí-lễ-hội-atmosphere)
  - [2.4. Quản lý Âm thanh Toàn cục (Global State)](#24-quản-lý-âm-thanh-toàn-cục-global-state)
  - [2.5. Xác thực & Định danh Liên thông (SSO)](#25-xác-thực--định-danh-liên-thông-sso)
  - [2.6. Trang Tùy Chỉnh Concept Lễ Hội (Custom 404)](#26-trang-tùy-chỉnh-concept-lễ-hội-custom-404)
- [3. Demo Giao diện Người dùng](#3-demo-giao-diện-người-dùng)
- [4. Hướng dẫn Cài đặt & Khởi chạy](#4-hướng-dẫn-cài-đặt--khởi-chạy)
  - [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
  - [Quy trình cài đặt](#quy-trình-cài-đặt)
  - [Cấu hình biến môi trường (.env)](#cấu-hình-biến-môi-trường-env)
  - [Các lệnh thực thi (Scripts)](#các-lệnh-thực-thi-scripts)
- [5. Cấu trúc Thư mục Dự án](#5-cấu-trúc-thư-mục-dự-án)
- [6. Kết nối Backend API Service](#6-kết-nối-backend-api-service)
- [7. Tác giả](#7-tác-giả)

---

## 1. Công nghệ & Thư viện Cốt lõi

Dự án được xây dựng với các công nghệ hiện đại trong hệ sinh thái React và Next.js, cập nhật các bản vá an ninh mới nhất:

### Khung Giao diện & Nền tảng Ứng dụng

| Công nghệ / Thư viện | Phiên bản | Vai trò Kỹ thuật |
| :--- | :--- | :--- |
| **[Next.js](https://nextjs.org/)** | `16.4.3` | Framework React App Router, Server Components và trình biên dịch Turbopack |
| **[React](https://react.dev/)** | `19.2.6` | Thư viện UI cốt lõi, kiến trúc Component-based |
| **[react-dom](https://react.dev/learn/rendering-elements)** | `19.2.6` | Thư viện kết xuất DOM cho React |
| **[TypeScript](https://www.typescriptlang.org/)** | `^5.0.0` | Đảm bảo an toàn kiểu dữ liệu tĩnh trên toàn bộ dự án |

---

### Thiết kế Giao diện, Biểu tượng & Trải nghiệm

| Công nghệ / Thư viện | Phiên bản | Vai trò Kỹ thuật |
| :--- | :--- | :--- |
| **[Tailwind CSS](https://tailwindcss.com/)** | `^4.3.3` | Framework CSS Utility-first thế hệ v4 với kiến trúc CSS-first |
| **[@tailwindcss/postcss](https://tailwindcss.com/)** | `^4.3.3` | Tích hợp xử lý Tailwind CSS qua PostCSS |
| **[PostCSS](https://postcss.org/)** | `^8.5.31` | Công cụ chuyển đổi phong cách CSS với các bản vá bảo mật |
| **[lucide-react](https://lucide.dev/)** | `^0.562.0` | Bộ biểu tượng SVG đồng bộ, sắc nét cho giao diện |
| **[emoji-picker-react](https://github.com/eprints/emoji-picker-react)** | `^4.19.1` | Bộ công cụ chọn Emoji phong phú để cá nhân hóa lời chúc |

---

### Mạng, Xác thực & Trạng thái Toàn cục

| Công nghệ / Thư viện | Phiên bản | Vai trò Kỹ thuật |
| :--- | :--- | :--- |
| **[Axios](https://axios-http.com/)** | `^1.20.0` | Tầng giao tiếp HTTP Client có Interceptors tự động đính kèm Token và xử lý lỗi |
| **[@react-oauth/google](https://github.com/MomenSherif/react-oauth)** | `^0.13.5` | Provider và Hooks xử lý quy trình đăng nhập nhanh Google OAuth 2.0 |
| **[js-cookie](https://github.com/js-cookie/js-cookie)** | `^3.0.8` | Quản lý lưu trữ Token an toàn dưới dạng Cookie phục vụ Middleware |
| **[Zustand](https://zustand.docs.pmnd.rs/)** | `^5.0.16` | Quản lý trạng thái Client tập trung (`useMusicStore`) |

---

### Hoạt họa & Hiệu ứng Thị giác

| Công nghệ / Thư viện | Phiên bản | Vai trò Kỹ thuật |
| :--- | :--- | :--- |
| **[framer-motion](https://www.framer.com/motion/)** | `^12.43.0` | Xử lý hoạt họa mượt mà cho hiệu ứng rung, lơ lửng và mở nắp hộp quà |
| **[react-snowfall](https://github.com/cahilfoley/react-snowfall)** | `^2.4.0` | Hiệu ứng tuyết rơi toàn màn hình tối ưu hiệu năng render |
| **[canvas-confetti](https://www.npmjs.com/package/canvas-confetti)** | `^1.9.4` | Hiệu ứng pháo giấy tung bay khi người nhận mở món quà |

---

## 2. Tính năng Giao diện & Trải nghiệm Người dùng

### 2.1. Đóng Gói Quà (Create Gift)
* Giao diện biểu mẫu nhập liệu trực quan với tính năng tìm kiếm người nhận (Autocomplete) theo thời gian thực.
* Tích hợp bộ chọn Emoji thông minh (`emoji-picker-react`), giúp lời chúc sinh động và mang đậm dấu ấn cá nhân.
* Lựa chọn màu sắc hộp quà (Red Box, Green Box, Gold Box) làm thay đổi toàn bộ chủ đề giao diện tương ứng của món quà.

### 2.2. Mở Quà Tương Tác (Open Gift)
* Hộp quà không gian 3D lơ lửng kèm thẻ tên người gửi đính kèm.
* Ứng dụng `framer-motion` tạo hiệu ứng mở nắp hộp mượt mà kết hợp `canvas-confetti` bắn pháo giấy đồng bộ theo tông màu hộp quà.
* Tự động kích hoạt bản nhạc nền đặc trưng khi người nhận mở thiệp chúc mừng.

### 2.3. Hiệu Ứng Bầu Không Khí Lễ Hội (Atmosphere)
* Đồng hồ đếm ngược Giáng sinh tự động thay đổi lời chào khi bước vào Tuần lễ Giáng sinh.
* Thành phần Tuyết rơi (`react-snowfall`) chạy nền mượt mà, không gây cản trở thao tác tương tác của người dùng.
* Hộp thoại mời đăng nhập tinh tế xuất hiện tại Trang chủ nhằm tối ưu trải nghiệm người dùng mới.

### 2.4. Quản lý Âm thanh Toàn cục (Global State)
* Ứng dụng Zustand duy trì trạng thái âm nhạc xuyên suốt quá trình chuyển trang (`useMusicStore`).
* Nút điều khiển âm thanh thông minh đặt tại góc giao diện cho phép bật/tắt nhạc linh hoạt.

### 2.5. Xác thực & Định danh Liên thông (SSO)
* Tích hợp đăng nhập nhanh qua Google OAuth 2.0.
* Hệ thống tài khoản liên thông với nền tảng Tết Countdown thông qua JWT Token lưu trữ tại Cookies và LocalStorage.

### 2.6. Trang Tùy Chỉnh Concept Lễ Hội (Custom 404)
* Giao diện trang 404 thiết kế riêng theo concept Giáng sinh ấm áp với đồ họa lễ hội và điều hướng người dùng quay lại trang chủ tiện lợi.

---

## 3. Demo Giao diện Người dùng

### 1. Trang Chủ & Đếm Ngược Giáng Sinh
![Trang Chủ & Đếm Ngược](public/demo/home.png)

### 2. Không Gian Đóng Gói Quà Mới
![Gói Quà Mới](public/demo/create.png)

### 3. Khoảnh Khắc Mở Quà Tương Tác
![Khoảnh Khắc Mở Quà](public/demo/open.png)

### 4. Bảng Quản Lý Hồ Sơ Cá Nhân
![Quản Lý Cài Đặt](public/demo/profile.png)

---

## 4. Hướng dẫn Cài đặt & Khởi chạy

### Yêu cầu hệ thống
Dự án được xây dựng trên **Next.js 16** và **React 19**, yêu cầu môi trường:
* **Node.js:** Phiên bản `>= 20.0.0` (Khuyến nghị Node.js 20.x hoặc 22.x LTS).
* **Trình quản lý gói:** `npm` (>= 9.0.0), `yarn`, `pnpm` hoặc `bun`.

### Quy trình cài đặt

```bash
# 1. Tải mã nguồn Frontend về máy cục bộ
git clone https://github.com/hvt299/Christmas-Wishes-Web.git
cd Christmas-Wishes-Web

# 2. Cài đặt các gói phụ thuộc
npm install
```

### Cấu hình biến môi trường (.env)

Tạo tệp `.env` tại thư mục gốc của dự án:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YourSecretKeyHere
```

### Các lệnh thực thi (Scripts)

```bash
# Khởi chạy môi trường phát triển (Dev Server tại port 3000)
npm run dev

# Biên dịch bản phát hành sản phẩm (Production Build)
npm run build

# Khởi chạy bản production đã biên dịch
npm run start

# Kiểm tra quy chuẩn mã nguồn (ESLint)
npm run lint
```

Sau khi khởi chạy thành công, truy cập ứng dụng trên trình duyệt tại:
```text
http://localhost:3000
```

---

## 5. Cấu trúc Thư mục Dự án

```text
Christmas-Wishes-Web/
├── app/                 # Next.js App Router (Pages, Layouts, Dynamic Routes)
├── components/          # Reusable UI Components (MusicPlayer, Snowfall, Countdown, Gift Box)
├── lib/                 # Tầng gọi API và cấu hình Axios Interceptors
├── store/               # Quản lý trạng thái toàn cục với Zustand (useMusicStore)
├── utils/               # Các hàm tiện ích bổ trợ (christmasHelper, formatters)
├── public/              # Tài nguyên tệp tĩnh (Audio, Demo Screenshots, Images)
├── middleware.ts        # Lớp trung gian kiểm tra xác thực và điều hướng Route
├── package.json         # Cấu hình gói thư viện và scripts dự án
└── tsconfig.json        # Cấu hình TypeScript
```

---

## 6. Kết nối Backend API Service

Ứng dụng Frontend được thiết kế để kết nối trực tiếp với **Christmas Wishes Backend API** (chạy tại cổng mặc định `3001`):
* Các thao tác xác thực, đăng nhập Google, lưu trữ hộp quà và gửi email thông báo đều giao tiếp qua RESTful API.
* Đảm bảo cập nhật chính xác địa chỉ API trong tệp cấu hình: `NEXT_PUBLIC_API_URL=http://localhost:3001`.

---

## 7. Tác giả

Được phát triển bởi **Mr.T (hvt299)**  
GitHub: [https://github.com/hvt299](https://github.com/hvt299)
