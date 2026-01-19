import { useRoute, Link } from "wouter";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBlogPost } from "@/hooks/use-blog";
import { Button } from "@/components/ui/button";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  const { data: post, isLoading } = useBlogPost(slug);

  if (isLoading) return <div className="h-screen flex items-center justify-center text-primary">Chargement...</div>;

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center">
          <h1 className="text-3xl font-display font-bold mb-4">Article non trouvé</h1>
          <Link href="/blog"><Button>Retour au journal</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-body bg-white">
      <Navbar />
      
      <article className="flex-grow">
        <div className="h-[50vh] relative overflow-hidden">
          <img 
            src={post.imageUrl || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&auto=format&fit=crop&q=80"} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white max-w-4xl">
            <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft size={20} className="mr-2" /> Retour au journal
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 leading-tight text-shadow">
              {post.title}
            </h1>
            <div className="text-lg text-white/90">
              Publié le {post.createdAt && format(new Date(post.createdAt), "d MMMM yyyy", { locale: fr })}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <div className="prose prose-lg prose-teal mx-auto font-body text-gray-700 leading-loose">
            {/* Simple rendering of content - in a real app, use a markdown renderer or HTML parser */}
            {post.content.split('\n').map((paragraph, idx) => (
              paragraph ? <p key={idx} className="mb-6">{paragraph}</p> : <br key={idx} />
            ))}
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
            <Link href="/blog">
              <Button variant="outline">Voir les autres articles</Button>
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
