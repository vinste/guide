import { Link, useLocation } from "wouter";
import { Menu, X, Facebook, Instagram, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/about", label: t("nav.about") },
    { href: "/tours", label: t("nav.tours") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/contact", label: t("nav.contact") },
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex flex-col">
              <span className="font-display text-2xl font-bold text-primary tracking-wide">Amandine Guide</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Lyon & Bourgogne</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-lg font-medium transition-colors hover:text-accent ${
                  isActive(link.href) ? "text-primary border-b-2 border-primary" : "text-gray-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="flex items-center bg-gray-100 rounded-lg p-1 ml-4">
              <button 
                onClick={() => setLanguage("fr")}
                className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${language === "fr" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                FR
              </button>
              <button 
                onClick={() => setLanguage("de")}
                className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${language === "de" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                DE
              </button>
            </div>

            <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
              <a href="#" className="text-primary hover:text-accent transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-primary hover:text-accent transition-colors">
                <Instagram size={20} />
              </a>
              <Link href="/admin">
                <Button size="sm" variant="ghost" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors">
                  <Lock size={16} />
                  <span>Admin</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
              <button 
                onClick={() => setLanguage("fr")}
                className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${language === "fr" ? "bg-white text-primary shadow-sm" : "text-gray-400"}`}
              >
                FR
              </button>
              <button 
                onClick={() => setLanguage("de")}
                className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${language === "de" ? "bg-white text-primary shadow-sm" : "text-gray-400"}`}
              >
                DE
              </button>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary hover:text-accent p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`block px-3 py-3 rounded-md text-lg font-medium ${
                  isActive(link.href) 
                    ? "bg-primary/5 text-primary" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center space-x-6 px-3 py-4 mt-4 border-t border-gray-100">
              <a href="#" className="flex items-center space-x-2 text-primary hover:text-accent">
                <Facebook size={24} /> <span>Facebook</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-primary hover:text-accent">
                <Instagram size={24} /> <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
