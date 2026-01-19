import { Link } from "wouter";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-white">Amandine Guide</h3>
            <p className="text-teal-100 leading-relaxed max-w-sm">
              {t("footer.description")}
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-xl font-semibold text-white">Navigation</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-teal-100 hover:text-white transition-colors">{t("nav.about")}</Link></li>
              <li><Link href="/tours" className="text-teal-100 hover:text-white transition-colors">{t("nav.tours")}</Link></li>
              <li><Link href="/blog" className="text-teal-100 hover:text-white transition-colors">{t("nav.blog")}</Link></li>
              <li><Link href="/contact" className="text-teal-100 hover:text-white transition-colors">{t("nav.contact")}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-display text-xl font-semibold text-white">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 text-teal-100">
                <MapPin size={20} className="mt-1 flex-shrink-0" />
                <span>Lyon, France<br/>{t("contact.info.area.desc")}</span>
              </div>
              <div className="flex items-center space-x-3 text-teal-100">
                <Mail size={20} className="flex-shrink-0" />
                <a href="mailto:contact@amandine-guide.fr" className="hover:text-white">contact@amandine-guide.fr</a>
              </div>
              <div className="flex items-center space-x-3 text-teal-100">
                <Phone size={20} className="flex-shrink-0" />
                <a href="tel:+33600000000" className="hover:text-white">+33 6 00 00 00 00</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-teal-200 text-sm">
          <p>&copy; {new Date().getFullYear()} Amandine Guide Conférencière. {t("footer.rights")}.</p>
          <div className="mt-2 space-x-4">
            <Link href="/admin" className="hover:text-white transition-colors">Administration</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
