# Một vườn yêu thương

Website thiệp chúc mừng 20/10 lấy cảm hứng từ video tham khảo: một bông hồng, khu vườn pastel nở rộ và tấm thiệp dành tặng người nhận.

## Chạy dự án

Yêu cầu Node.js 20.19+ hoặc 22.12+ (đã kiểm tra với Node.js 24).

```sh
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5173
```

```sh
npm run build
npm run preview -- --port 4173
```

Triển khai thư mục `dist/` lên dịch vụ hosting tĩnh. Không cần backend hay API key. Hoa được vẽ bằng SVG: cánh tròn xếp xoáy, gradient tạo độ sâu, thân mảnh và lá nhỏ theo video tham khảo. Vườn hoa có 5 lớp xa–gần với chiều cao thân và kích thước bông độc lập: 132 bông trên máy tính, 98 bông trên điện thoại. Các cụm hoa cao–thấp xen kẽ tạo đường viền nhấp nhô; hoa phía xa nhỏ và nhạt hơn. Mỗi bông có 10 lớp cánh. Một canvas vẽ giai đoạn nở; sau đó các cụm hoa nhỏ đã được vẽ sẵn chuyển động bằng CSS transform với nhịp và hướng gió riêng, cả thân, lá và cánh đều đung đưa mà không cần vẽ lại liên tục. Vườn tạm ngừng vẽ khi tab ẩn hoặc đang mở thiệp; chế độ giảm chuyển động dùng các lớp tĩnh. Hình cánh hoa và thân/lá được lưu sẵn để tái sử dụng. Bông hoa chính chỉ di chuyển bằng transform để tránh thay đổi bố cục từng khung hình. Font được đóng gói cùng website. Âm thanh được tổng hợp bằng Web Audio và chỉ phát khi người xem bật.

## Tương tác

- Chạm bông hoa hoặc nút “Chạm để hoa nở” để mở khu vườn.
- Mở thiệp qua nút lời nhắn; đóng bằng nút ×, phím Escape hoặc chạm bên ngoài.
- Nút loa bật/tắt giai điệu nhẹ; nút “Ngắm hoa nở lại” bắt đầu lại.
- Hỗ trợ màn hình nhỏ và tùy chọn giảm chuyển động của hệ điều hành.

## Chỉnh nội dung

Sửa lời chúc, tiêu đề và ngày trong `index.html`; sửa bảng màu hoa trong `src/main.js`; chỉnh bố cục và thời gian hiệu ứng trong `src/style.css`.

Đã kiểm tra tự động trên Chromium ở kích thước 1440×1000 và 390×844: luồng hoa nở, thiệp, Escape, nút đóng, âm thanh, phát lại, không tràn ngang và giảm chuyển động.

## GitHub Pages

Tên repository: `from-HTA-with-love`.

1. Repository `Hataianh/from-HTA-with-love` sử dụng chế độ public.
2. Trong Settings → Pages → Build and deployment, chọn Source: **GitHub Actions**.
3. Workflow “Deploy greeting to GitHub Pages” tự chạy khi push lên `master`; có thể chạy lại bằng **Run workflow** trong Actions.
4. Chờ workflow thành công; lấy đường dẫn website trong Settings → Pages hoặc kết quả deployment.

Đường dẫn dự kiến sau khi đổi tên và deploy thành công:
`https://hataianh.github.io/from-HTA-with-love/`

`vite.config.js` dùng đường dẫn tài nguyên tương đối, vì vậy việc đổi tên repository không làm hỏng font, CSS và JavaScript.
