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
    <main className="px-4 py-6 md:px-6">
      
      {/* Top Featured Section */}
      <section className="mb-10">
        {featured.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Hero */}
            {heroLead && (
              <div className="flex-1 lg:w-[65%] group">
                <Link href={`/bai-viet/${heroLead.slug}`} className="block relative overflow-hidden bg-slate-100 rounded-sm">
                  {heroLead.cover_image ? (
                    
                      <img
                      src={heroLead.cover_image}
                      alt={heroLead.title}
                      className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full aspect-[16/10] bg-slate-200" />
                  )}
                </Link>
                <div className="mt-4">
                  <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold leading-[1.25] text-[#222] group-hover:text-[#4062ff] transition-colors">
                    <Link href={`/bai-viet/${heroLead.slug}`}>
                      {heroLead.title}
                    </Link>
                  </h2>
                  {heroLead.excerpt && (
                    <p className="mt-3 text-base text-[#555] line-clamp-3 leading-relaxed">
                      {heroLead.excerpt}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Right List */}
            {heroSecondaries.length > 0 && (
              <div className="w-full lg:w-[35%] flex flex-col gap-5">
                {heroSecondaries.map((post) => (
                  <div key={post.id} className="group flex gap-4 lg:flex-row flex-row">
                    <Link href={`/bai-viet/${post.slug}`} className="shrink-0 w-[140px] sm:w-[160px] lg:w-[130px] xl:w-[150px] block overflow-hidden rounded-sm bg-slate-100">
                      {post.cover_image ? (
                        
                          <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full aspect-[4/3]" />
                      )}
                    </Link>
                    <div className="flex-1">
                      <h3 className="text-[15px] font-bold leading-snug text-[#222] group-hover:text-[#4062ff] transition-colors">
                        <Link href={`/bai-viet/${post.slug}`} className="line-clamp-4">
                          {post.title}
                        </Link>
                      </h3>
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
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Stream */}
        <div className="flex-1 lg:w-2/3">
          <div className="border-b-2 border-[#4062ff] mb-5">
            <h2 className="text-[18px] font-bold text-[#4062ff] uppercase tracking-wide py-1 inline-block">
              Mới nhất
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
                    <Link href={`/bai-viet/${post.slug}`} className="shrink-0 sm:w-[240px] block overflow-hidden rounded-sm bg-slate-100">
                      {post.cover_image ? (
                        
                          <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full aspect-[16/10] object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full aspect-[16/10]" />
                      )}
                    </Link>
                    <div className="flex-1 flex flex-col justify-start">
                      <h3 className="text-[20px] font-bold leading-snug text-[#222] group-hover:text-[#4062ff] transition-colors">
                        <Link href={`/bai-viet/${post.slug}`} className="line-clamp-2">
                          {post.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-3 mt-2 mb-2">
                        <Link href={`/chu-de/${categorySlug}`} className="text-[12px] font-bold uppercase text-[#4062ff] hover:underline">
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
          <div className="bg-[#f8f9fa] border border-gray-200 rounded-sm p-5">
            <h3 className="text-[16px] font-bold text-[#222] uppercase border-b border-gray-300 pb-2 mb-4">
              Đọc nhiều nhất
            </h3>
            <div className="flex flex-col gap-4">
              {popular.length > 0 ? (
                popular.map((post, index) => (
                  <div key={post.id} className="group flex items-start gap-3">
                    <span className="text-[24px] font-black text-[#ccc] italic leading-none w-6 text-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-bold leading-snug text-[#222] group-hover:text-[#4062ff] transition-colors">
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
      <div className="mt-10">
        {sections.map(({ category, posts }) => (
          <section key={category.id} className="mb-10">
            <div className="border-b-2 border-[#4062ff] mb-5 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#4062ff] uppercase tracking-wide py-1 inline-block">
                {category.name}
              </h2>
              <Link href={`/chu-de/${category.slug}`} className="text-[13px] font-bold text-gray-500 hover:text-[#4062ff]">
                Xem thêm
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="group flex flex-col">
                  <Link href={`/bai-viet/${post.slug}`} className="block overflow-hidden rounded-sm bg-slate-100 mb-3">
                    {post.cover_image ? (
                      
                        <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full aspect-[16/10] object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full aspect-[16/10]" />
                    )}
                  </Link>
                  <h3 className="text-[15px] font-bold leading-snug text-[#222] group-hover:text-[#4062ff] transition-colors">
                    <Link href={`/bai-viet/${post.slug}`} className="line-clamp-3">
                      {post.title}
                    </Link>
                  </h3>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

    </main>
  );
}
