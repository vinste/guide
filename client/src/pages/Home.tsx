import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Star, Map, Calendar, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useTours } from "@/hooks/use-tours";
import { useTestimonials } from "@/hooks/use-testimonials";

export default function Home() {
  const { data: tours } = useTours();
  const { data: testimonials } = useTestimonials();

  const featuredTours = tours?.filter(t => t.isFeatured).slice(0, 3) || [];
  const displayTestimonials = testimonials?.slice(0, 3) || [];

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Navbar />
      
      {/* Hero Section */}
      <header className="relative bg-teal-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center">
          
          <div className="w-full lg:w-1/2 z-10 space-y-8 text-center lg:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary leading-tight"
            >
              Découvrez l'histoire <br/>
              <span className="text-secondary">au cœur de nos régions</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0"
            >
              Guide conférencière germanophone passionnée, je vous accompagne à travers Lyon, le Beaujolais et la Bourgogne du Sud.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/tours">
                <Button size="lg" className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                  Voir mes visites
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 rounded-xl hover:bg-teal-50 hover:text-primary transition-all">
                  Me contacter
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 mt-12 lg:mt-0 relative"
          >
            <div className="absolute inset-0 bg-secondary rounded-full opacity-10 blur-3xl transform translate-x-10 translate-y-10"></div>
            {/* Scenic Lyon landscape placeholder */}
            <img 
              src="https://images.unsplash.com/photo-1621849400072-f554417f7051?w=800&auto=format&fit=crop&q=60" 
              alt="Vue panoramique de Lyon" 
              className="relative rounded-2xl shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500"
            />
          </motion.div>
        </div>
      </header>

      {/* Introduction */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-6">Bienvenue en terres de patrimoine</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Bonjour, je suis Amandine. Que vous soyez un particulier curieux ou une agence de voyage à la recherche d'une expertise locale, je crée pour vous des itinéraires sur-mesure. Mon objectif ? Vous faire vivre l'histoire, la gastronomie et les paysages de notre belle région avec authenticité et convivialité.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 bg-teal-50 rounded-xl">
              <Users className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Pour tous</h3>
              <p className="text-gray-600">Adapté aux séniors, familles et groupes professionnels.</p>
            </div>
            <div className="p-6 bg-fuchsia-50 rounded-xl">
              <Map className="w-10 h-10 text-accent mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Sur-mesure</h3>
              <p className="text-gray-600">Des circuits personnalisés selon vos envies et votre rythme.</p>
            </div>
            <div className="p-6 bg-indigo-50 rounded-xl">
              <Calendar className="w-10 h-10 text-secondary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Toute l'année</h3>
              <p className="text-gray-600">Découvrez les charmes de chaque saison.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      {featuredTours.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">Visites à la une</h2>
                <p className="text-gray-600 mt-2">Une sélection de mes coups de cœur</p>
              </div>
              <Link href="/tours">
                <Button variant="ghost" className="hidden sm:flex items-center text-secondary hover:text-primary hover:bg-transparent p-0 font-bold">
                  Voir tout le catalogue <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours.map((tour) => (
                <Link key={tour.id} href={`/tours/${tour.id}`} className="group block h-full">
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100">
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={tour.imageUrl || "https://images.unsplash.com/photo-1594910086877-c371f49646b9?w=800&auto=format&fit=crop&q=60"} 
                        alt={tour.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                        {tour.region}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-display font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                        {tour.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{tour.description}</p>
                      <div className="flex justify-between items-center text-sm font-medium pt-4 border-t border-gray-100">
                        <span className="text-secondary">{tour.duration || "Demi-journée"}</span>
                        <span className="text-primary font-bold">{tour.price || "Sur devis"}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 text-center sm:hidden">
              <Link href="/tours">
                <Button variant="outline" className="w-full">Voir tout le catalogue</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary text-center mb-16">
            Ce qu'ils disent de moi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-8 rounded-2xl shadow-sm relative">
                <div className="text-accent text-6xl font-serif absolute top-4 left-4 opacity-20">"</div>
                <div className="flex mb-4 text-yellow-400">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6 relative z-10">{testimonial.content}</p>
                <div className="font-bold text-primary font-display">— {testimonial.author}</div>
              </div>
            ))}
            {/* Add placeholder testimonials if none exist */}
            {displayTestimonials.length === 0 && (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-8 rounded-2xl shadow-sm relative">
                    <div className="text-accent text-6xl font-serif absolute top-4 left-4 opacity-20">"</div>
                    <div className="flex mb-4 text-yellow-400">
                      {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                    </div>
                    <p className="text-gray-600 italic mb-6 relative z-10">
                      "Une visite exceptionnelle ! Amandine connait Lyon comme sa poche et ses anecdotes ont rendu l'histoire vivante."
                    </p>
                    <div className="font-bold text-primary font-display">— Client heureux</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
