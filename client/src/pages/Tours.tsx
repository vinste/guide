import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Clock, Users, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useTours } from "@/hooks/use-tours";

const REGIONS = ["Tout", "Lyon", "Beaujolais", "Bourgogne"];

export default function Tours() {
  const [activeRegion, setActiveRegion] = useState("Tout");
  const { data: tours, isLoading } = useTours(activeRegion === "Tout" ? undefined : activeRegion);

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-primary py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Visites & Excursions</h1>
          <p className="text-teal-100 text-xl max-w-2xl mx-auto">
            Explorez notre patrimoine à travers des itinéraires conçus pour vous émerveiller.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-grow">
        
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`px-6 py-3 rounded-full font-medium transition-all text-lg shadow-sm ${
                activeRegion === region
                  ? "bg-secondary text-white shadow-md transform scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {region === "Bourgogne" ? "Bourgogne du Sud" : region}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-96 animate-pulse shadow-sm"></div>
            ))}
          </div>
        ) : tours?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <h3 className="text-2xl font-bold text-gray-400 mb-4">Aucune visite trouvée pour cette région</h3>
            <p className="text-gray-500">Essayez une autre catégorie ou contactez-moi pour du sur-mesure.</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {tours?.map((tour) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={tour.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={tour.imageUrl || "https://images.unsplash.com/photo-1594910086877-c371f49646b9?w=800&auto=format&fit=crop&q=60"} 
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm uppercase tracking-wider">
                    {tour.region}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-display font-bold text-gray-900 group-hover:text-primary transition-colors mb-3">
                    {tour.title}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">{tour.description}</p>
                  
                  <div className="flex flex-col space-y-3 mb-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-secondary" />
                      <span>{tour.duration || "Durée flexible"}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2 text-accent" />
                      <span>{tour.region}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{tour.price || "Sur devis"}</span>
                    <Link href={`/contact?subject=${encodeURIComponent(tour.title)}`}>
                      <Button size="sm" variant="outline" className="rounded-lg hover:bg-primary hover:text-white transition-colors">
                        Réserver
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
