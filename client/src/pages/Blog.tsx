import { Link } from "wouter";
import { format } from "date-fns";
import { fr, de } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/use-blog";
import { useLanguage } from "@/hooks/use-language";

export default function Blog() {
  const { language, t } = useLanguage();
  const { data: posts, isLoading } = useBlogPosts(language);

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50">
      <Navbar />
      
      <div className="bg-teal-900 py-20 text-white pattern-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display text-gray-200 font-bold mb-4">{t("blog.title")}</h1>
          <p className="text-teal-100 text-xl max-w-2xl mx-auto">
            {t("blog.subtitle")}
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-grow">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl text-gray-500">{t("blog.empty")}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {posts?.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group cursor-pointer">
                <article className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={post.imageUrl || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format&fit=crop&q=60"} 
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="text-sm text-accent font-bold mb-2 uppercase tracking-wide">
                      {post.createdAt && format(new Date(post.createdAt), "d MMMM yyyy", { locale: language === "fr" ? fr : de })}
                    </div>
                    <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed flex-grow">
                      {post.summary || post.content.substring(0, 150) + "..."}
                    </p>
                    <div className="mt-6 font-bold text-primary flex items-center">
                      {t("blog.readmore")} <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
