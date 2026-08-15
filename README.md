# NOVA//TECH

**NOVA//TECH** là cổng tin tức công nghệ được xây dựng bằng **Next.js App Router, TypeScript, Tailwind CSS và Supabase**. Project có giao diện public responsive, metadata SEO, tìm kiếm, phân trang, hệ thống bài viết/chuyên mục/thẻ và khu vực `/admin` được kiểm tra quyền ở phía server.

> Giao diện được thiết kế độc lập theo định hướng “tín hiệu thay vì nhiễu”: nền navy, điểm nhấn electric blue/lime và nhịp typography biên tập. Không sao chép mã nguồn, ảnh hoặc nội dung từ website tham khảo.

## Tính năng

| Nhóm | Nội dung đã triển khai |
| --- | --- |
| Public | Trang chủ, danh sách bài viết, chuyên mục, tìm kiếm theo tiêu đề/nội dung/chuyên mục/thẻ, phân trang và responsive mobile-first. |
| Bài viết | URL slug, ảnh đại diện, tác giả, ngày xuất bản, lượt xem, tags, bài liên quan, nút chia sẻ, breadcrumbs và JSON-LD Article. |
| SEO | Metadata động, canonical URL, Open Graph, Twitter Card, sitemap và robots.txt. |
| Admin | Dashboard, đăng nhập Supabase email/password, kiểm tra role server-side, CRUD bài viết/chuyên mục, quản lý thẻ, lưu nháp/xuất bản và editor TipTap. |
| Media | Upload ảnh tới bucket `media` của Supabase Storage qua endpoint chỉ dành cho admin. |
| Security | RLS policies, `is_admin()` database function, service role chỉ ở server, HTML editor được làm sạch trước khi lưu. |

## Kiến trúc

```text
app/                         # Next.js App Router
  (site)/                    # Các route public
  admin/                     # Khu vực quản trị đã được bảo vệ
  api/                       # Upload media và ghi nhận view
  actions.ts                 # Server Actions CRUD
components/
  admin/                     # Sidebar, manager, editor
  site/                      # Header, footer, card, pagination
lib/
  auth.ts                    # Kiểm tra Supabase session + role
  data/posts.ts              # Truy vấn Supabase có phân trang
  supabase/                  # Browser, server, proxy, admin client
supabase/
  migrations/                # SQL schema, RLS và Storage policy
  seed.sql                   # Chuyên mục, thẻ và bài starter
tests/                       # Vitest unit tests
```

## Cài đặt local

Yêu cầu Node.js 20+ và pnpm 10+.

```bash
pnpm install
pnpm dev
```

Truy cập `http://localhost:3000`. Các lệnh kiểm tra cần chạy trước khi mở pull request:

```bash
pnpm typecheck
pnpm test
NODE_ENV=production pnpm build
```

## Biến môi trường

Tạo tệp `.env.local` ở thư mục gốc dự án. **Không commit tệp này lên GitHub.**

```dotenv
# Public: có thể xuất hiện trong browser; dữ liệu vẫn được bảo vệ bằng RLS.
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Server-only: tuyệt đối không có tiền tố NEXT_PUBLIC.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Chỉ dùng cho tác vụ seed bảo mật nếu bạn tự bổ sung script.
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` và `NEXT_PUBLIC_SITE_URL` là biến public. `SUPABASE_SERVICE_ROLE_KEY` chỉ được đọc trong `lib/supabase/admin.ts` và API upload; không truyền key này xuống client, không đưa vào code, không log ra terminal.

## Thiết lập Supabase

| Bước | Thao tác |
| --- | --- |
| 1 | Tạo một project trên Supabase. Trong **Authentication → Providers**, bật Email provider. |
| 2 | Mở **SQL Editor**, dán và chạy toàn bộ `supabase/migrations/20260815103000_initial_schema.sql`. Migration tạo bảng, foreign keys, indexes, triggers, RLS, RPC và bucket `media`. |
| 3 | Trong **Authentication → Users**, tạo user email/password dành cho quản trị viên. Không đặt mật khẩu trong source code. |
| 4 | Sửa `admin@example.com` trong `supabase/seed.sql` thành email admin vừa tạo, rồi chạy file này trong SQL Editor. Bước này gán `role = 'admin'`, thêm dữ liệu starter và hai bài mẫu trung tính. |
| 5 | Sao chép Project URL, anon key và service_role key từ **Project Settings → API** vào `.env.local` hoặc biến môi trường của Vercel. |
| 6 | Đăng nhập tại `/login`. Proxy yêu cầu session và layout `/admin` kiểm tra `profiles.role = 'admin'` ở phía server trước khi render giao diện quản trị. |

### Mô hình quyền

Người dùng public chỉ đọc bài có `status = 'published'`. Người đã đăng nhập chỉ đọc được profile cần thiết. Mọi ghi/sửa/xóa post, category, tag và media đều cần `public.is_admin()` trong RLS, do đó việc ẩn nút ở client không phải lớp bảo mật duy nhất.

## Upload hình ảnh

Migration tạo bucket public `media` với giới hạn 5 MB và chỉ chấp nhận JPEG, PNG, WebP, GIF. Endpoint `POST /api/admin/upload` xác thực Supabase user và `role = admin` trước khi dùng server-only client để upload. Database chỉ lưu public URL/path trong `posts.cover_image`; file không được lưu trong database.

## GitHub

Sau khi kiểm thử local, khởi tạo repository và đẩy source:

```bash
git init
git add .
git commit -m "Initial commit: NOVA TECH news portal"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY
git push -u origin main
```

Kiểm tra `.gitignore` trước khi push để chắc chắn `.env.local` không xuất hiện trong staged files.

## Vercel

Import GitHub repository trên Vercel. Vercel tự nhận diện Next.js; không cần cấu hình build command riêng. Trong **Settings → Environment Variables**, khai báo bốn biến runtime:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
```

Đặt `NEXT_PUBLIC_SITE_URL` bằng domain production, ví dụ `https://news.example.com`, rồi redeploy. Sau khi gắn domain, sitemap, canonical URL và Open Graph sẽ tạo URL theo domain đó.

## Lưu ý vận hành

Việc chuyển tài khoản thành admin là thao tác có đặc quyền. Hãy chỉ thực hiện qua Supabase Dashboard/SQL Editor với người dùng đã được xác minh; không tạo endpoint client để tự nâng quyền. Với dữ liệu lớn hơn, ưu tiên pagination hiện tại, giữ index migration và chỉ bổ sung full-text search chuyên biệt sau khi đo lường truy vấn thực tế.
