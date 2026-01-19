import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col font-body bg-white">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header */}
        <div className="bg-teal-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-display font-bold text-primary mb-4"
            >
              Qui je suis
            </motion.h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Plus qu'un métier, une vocation : partager l'histoire et la culture.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            
            {/* Image Column */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full lg:w-1/3 relative"
            >
              <div className="absolute inset-0 bg-accent rounded-2xl transform translate-x-4 translate-y-4"></div>
              {/* Professional woman placeholder */}
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80" 
                alt="Amandine" 
                className="relative rounded-2xl shadow-xl w-full h-auto object-cover aspect-[3/4]"
              />
            </motion.div>

            {/* Content Column */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full lg:w-2/3 space-y-8"
            >
              <div>
                <h2 className="text-3xl font-display font-bold text-secondary mb-4">Mon parcours</h2>
                <div className="prose prose-lg text-gray-600">
                  <p className="mb-4">
                    Passionnée par l'histoire de l'art et les langues étrangères depuis mon plus jeune âge, j'ai fait de ma passion mon métier.
                    Diplômée en Histoire de l'Art et titulaire de la carte de Guide-Conférencier national, je sillonne les routes de France depuis plus de 15 ans.
                  </p>
                  <p>
                    Ma spécialité ? L'accueil de la clientèle germanophone. Ayant vécu plusieurs années en Allemagne, je maîtrise non seulement la langue de Goethe, 
                    mais je comprends aussi les attentes culturelles de mes visiteurs d'outre-Rhin.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-display font-bold text-secondary mb-4">Ma philosophie</h2>
                <div className="prose prose-lg text-gray-600">
                  <p className="mb-4">
                    Je conçois mes visites comme des moments d'échange et de convivialité. L'Histoire ne doit pas être une succession de dates arides, 
                    mais un récit vivant, incarné par ceux qui l'ont faite.
                  </p>
                  <p>
                    J'aime particulièrement faire découvrir les petits détails cachés, les anecdotes savoureuses et les artisans locaux qui font vivre le patrimoine aujourd'hui.
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50 p-8 rounded-2xl border-l-4 border-secondary">
                <h3 className="text-xl font-bold text-primary mb-2">Pourquoi me choisir ?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center"><span className="w-2 h-2 bg-accent rounded-full mr-3"></span>Guide conférencière agréée par l'État</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-accent rounded-full mr-3"></span>Bilingue Français / Allemand</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-accent rounded-full mr-3"></span>Spécialiste du public sénior</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-accent rounded-full mr-3"></span>Connaissance pointue du terroir local</li>
                </ul>
              </div>

              <div className="pt-4">
                <Link href="/contact">
                  <Button size="lg" className="text-lg px-8">Discutons de votre projet</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
