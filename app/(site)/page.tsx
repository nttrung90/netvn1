/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { EmptyState } from "@/components/site/EmptyState";
import { getHomeFeedData } from "@/lib/data/posts";
import { formatViDate } from "@/lib/utils";

export default async function HomePage() {
  const { featured, latest, popular, sections } = await getHomeFeedData();

  const heroLead = featured[0];
  const heroSecondaries = featured.slice(1, 4);

  return (
    <main className="container py-6 md:py-8">
      
      {/* Top Featured Section */}
      <section className="mb-12">
        {featured.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Hero */}
            {heroLead && (
              <div className="flex-1 lg:w-[65%] group">
                <Link href={`/bai-viet/${heroLead.slug}`} className="block relative overflow-hidden bg-slate-100 rounded-md aspect-[16/10] lg:aspect-[16/9]">
                  {heroLead.cover_image ? (
                    <img
                      src={heroLead.cover_image}
                      alt={heroLead.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full aspect-[16/9] bg-slate-200" />
                  )}
                </Link>
                <div className="mt-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.2] text-[#222] group-hover:text-[#d72626] transition-colors">
                    <Link href={`/bai-viet/${heroLead.slug}`}>
                      {heroLead.title}
                    </Link>
                  </h2>
                  {heroLead.excerpt && (
                    <p className="mt-3 text-[17px] text-[#444] line-clamp-3 leading-relaxed">
                      {heroLead.excerpt}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Right List */}
            {heroSecondaries.length > 0 && (
              <div className="w-full lg:w-[35%] flex flex-col gap-6">
                {heroSecondaries.map((post) => (
                  <div key={post.id} className="group flex gap-4">
                    <Link href={`/bai-viet/${post.slug}`} className="shrink-0 w-[140px] block overflow-hidden rounded-sm bg-slate-100 aspect-[4/3]">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full aspect-[4/3]" />
                      )}
                    </Link>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold leading-[1.3] text-[#222] group-hover:text-[#d72626] transition-colors">
                        <Link href={`/bai-viet/${post.slug}`} className="line-clamp-3">
                          {post.title}
                        </Link>
                      </h3>
                      {post.category && (
                        <Link href={`/chu-de/${post.category.slug}`} className="text-[12px] font-bold uppercase text-[#d72626] hover:underline mt-2 inline-block">
                          {post.category.name}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        ) : (
          <EmptyState
            title="Tòa soạn đang chuẩn bị những bài viết đầu tiên"
            description="Các phân tích và bản tin công nghệ mới sẽ được cập nhật sớm."
          />
        )}
      </section>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Stream */}
        <div className="flex-1 lg:max-w-[850px]">
          <div className="border-b-2 border-[#d72626] mb-6">
            <h2 className="text-[18px] font-bold text-[#d72626] uppercase tracking-wide py-1 inline-block">
              Dòng tin mới nhất
            </h2>
          </div>
          
          <div className="flex flex-col">
            {latest.length > 0 ? (
              latest.map((post) => {
                const categorySlug = post.category?.slug || "tin-cong-nghe";
                const categoryName = post.category?.name || "Công nghệ";
                const date = post.published_at ? formatViDate(post.published_at) : "";

                return (
                  <div key={post.id} className="group flex flex-col sm:flex-row gap-5 py-5 border-b border-gray-200 last:border-0">
                    <Link href={`/bai-viet/${post.slug}`} className="shrink-0 sm:w-[260px] block overflow-hidden rounded-sm bg-slate-100 aspect-[16/10]">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full aspect-[16/10]" />
                      )}
                    </Link>
                    <div className="flex-1 flex flex-col justify-start">
                      <h3 className="text-[20px] font-bold leading-snug text-[#222] group-hover:text-[#d72626] transition-colors">
                        <Link href={`/bai-viet/${post.slug}`} className="line-clamp-2">
                          {post.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-3 mt-2 mb-2">
                        <Link href={`/chu-de/${categorySlug}`} className="text-[12px] font-bold uppercase text-[#d72626] hover:underline">
                          {categoryName}
                        </Link>
                        <span className="text-[12px] text-[#999]">{date}</span>
                      </div>
                      {post.excerpt && (
                        <p className="text-[14px] text-[#555] line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState title="Chưa có bài viết mới" description="Hãy khám phá các chuyên đề bên dưới." />
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-[320px] shrink-0">
          <div className="bg-[#f8f9fa] border border-gray-200 rounded-sm p-5 sticky top-24">
            <h3 className="text-[16px] font-bold text-[#222] uppercase border-b border-gray-300 pb-2 mb-4">
              Đọc nhiều nhất
            </h3>
            <div className="flex flex-col gap-4">
              {popular.length > 0 ? (
                popular.map((post, index) => (
                  <div key={post.id} className="group flex items-start gap-3">
                    <span className="text-[24px] font-black text-[#ccc] italic leading-none w-6 text-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-bold leading-[1.4] text-[#222] group-hover:text-[#d72626] transition-colors">
                        <Link href={`/bai-viet/${post.slug}`} className="line-clamp-3">
                          {post.title}
                        </Link>
                      </h4>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-4 text-center">Đang cập nhật dữ liệu</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Sections */}
      <div className="mt-12">
        {sections.map(({ category, posts }) => (
          <section key={category.id} className="mb-12">
            <div className="border-b-2 border-[#d72626] mb-6 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#d72626] uppercase tracking-wide py-1 inline-block">
                {category.name}
              </h2>
              <Link href={`/chu-de/${category.slug}`} className="text-[13px] font-bold text-gray-500 hover:text-[#d72626]">
                Xem thêm &rsaquo;
              </Link>
            </div>
            
            {/* GenK style editorial section: 1 main large, 2-3 small */}
            <div className="flex flex-col lg:flex-row gap-8">
              {posts[0] && (
                <div className="flex-1 lg:w-1/2 group">
                  <Link href={`/bai-viet/${posts[0].slug}`} className="block overflow-hidden rounded-sm bg-slate-100 mb-3 aspect-[16/10]">
                    {posts[0].cover_image ? (
                      <img
                        src={posts[0].cover_image}
                        alt={posts[0].title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full aspect-[16/10]" />
                    )}
                  </Link>
                  <h3 className="text-[20px] font-bold leading-snug text-[#222] group-hover:text-[#d72626] transition-colors mt-3">
                    <Link href={`/bai-viet/${posts[0].slug}`} className="line-clamp-3">
                      {posts[0].title}
                    </Link>
                  </h3>
                  {posts[0].excerpt && (
                    <p className="mt-2 text-[14px] text-[#555] line-clamp-3 leading-relaxed">
                      {posts[0].excerpt}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex-1 lg:w-1/2 flex flex-col gap-5">
                {posts.slice(1, 4).map((post) => (
                  <div key={post.id} className="group flex gap-4">
                    <Link href={`/bai-viet/${post.slug}`} className="shrink-0 w-[140px] block overflow-hidden rounded-sm bg-slate-100 aspect-[4/3]">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full aspect-[4/3]" />
                      )}
                    </Link>
                    <div className="flex-1">
                      <h3 className="text-[15px] font-bold leading-snug text-[#222] group-hover:text-[#d72626] transition-colors">
                        <Link href={`/bai-viet/${post.slug}`} className="line-clamp-3">
                          {post.title}
                        </Link>
                      </h3>
                      <span className="text-[12px] text-[#999] mt-2 block">
                        {post.published_at ? formatViDate(post.published_at) : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </section>
        ))}
      </div>

    </main>
  );
}
