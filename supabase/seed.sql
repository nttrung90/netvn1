-- Run after creating a Supabase Auth user through Dashboard or auth.admin.createUser.
-- Promote the user without storing any password in source control.
update public.profiles set role = 'admin' where email = 'admin@example.com';

insert into public.categories (name, slug, description) values
  ('Tin công nghệ', 'tin-cong-nghe', 'Những chuyển động mới của thế giới công nghệ.'),
  ('AI & Dữ liệu', 'ai-du-lieu', 'Góc nhìn thực tiễn về trí tuệ nhân tạo và dữ liệu.'),
  ('Thiết bị', 'thiet-bi', 'Đánh giá và hướng dẫn lựa chọn thiết bị.'),
  ('Bảo mật', 'bao-mat', 'Kiến thức an toàn số dành cho mọi người.')
on conflict (slug) do nothing;
insert into public.tags (name, slug) values
  ('Trí tuệ nhân tạo', 'tri-tue-nhan-tao'), ('Năng suất', 'nang-suat'), ('Hướng dẫn', 'huong-dan'), ('Bảo mật số', 'bao-mat-so')
on conflict (slug) do nothing;

-- Sample editorial posts. They are neutral starter templates, not user-generated reviews.
insert into public.posts (title, slug, excerpt, content, author_id, category_id, status, published_at)
select
  'Thiết kế quy trình AI nhỏ gọn cho công việc hằng ngày',
  'thiet-ke-quy-trinh-ai-nho-gon',
  'Một khung tư duy ngắn gọn để chọn công việc phù hợp cho trợ lý AI.',
  '<p>AI tạo giá trị rõ nhất khi được đưa vào một quy trình nhỏ, có đầu vào và đầu ra cụ thể.</p><h2>Bắt đầu từ một điểm lặp lại</h2><p>Hãy chọn một tác vụ đang lặp lại, mô tả tiêu chuẩn đầu ra và giữ quyền phê duyệt cuối cùng cho con người.</p>',
  profile.id, category.id, 'published', now()
from public.profiles profile cross join public.categories category
where profile.email = 'admin@example.com' and category.slug = 'ai-du-lieu'
on conflict (slug) do nothing;

insert into public.posts (title, slug, excerpt, content, author_id, category_id, status, published_at)
select
  'Bảo mật số bắt đầu từ những thói quen có thể kiểm tra',
  'bao-mat-so-tu-thoi-quen',
  'Các bước cơ bản để giảm rủi ro mà không khiến trải nghiệm làm việc trở nên phức tạp.',
  '<p>Bảo mật không nhất thiết phải bắt đầu bằng công cụ phức tạp. Một mật khẩu riêng cho mỗi dịch vụ và xác thực hai lớp đã tạo khác biệt lớn.</p><blockquote>Ưu tiên những lớp bảo vệ dễ duy trì hơn là những thiết lập chỉ tồn tại trên giấy.</blockquote>',
  profile.id, category.id, 'published', now()
from public.profiles profile cross join public.categories category
where profile.email = 'admin@example.com' and category.slug = 'bao-mat'
on conflict (slug) do nothing;
