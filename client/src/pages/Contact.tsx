import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { insertInquirySchema, type InsertInquiry } from "@shared/routes";
import { useCreateInquiry } from "@/hooks/use-inquiries";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function Contact() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const subject = searchParams.get("subject") || "";
  
  const { toast } = useToast();
  const mutation = useCreateInquiry();

  const form = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      message: subject ? `Bonjour, je souhaite des informations concernant : ${subject}` : "",
    },
  });

  const onSubmit = (data: InsertInquiry) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Message envoyé !",
          description: "Merci pour votre demande. Je vous répondrai dans les plus brefs délais.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'envoi du message.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50">
      <Navbar />
      
      <div className="bg-primary py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{t("contact.title")}</h1>
          <p className="text-teal-100 text-xl max-w-2xl mx-auto">
            {t("contact.subtitle")}
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-display font-bold text-secondary mb-8">Envoyez-moi un message</h2>
            <Card className="p-8 shadow-lg border-t-4 border-t-accent">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Votre nom</label>
                  <Input 
                    {...form.register("name")} 
                    className="h-12 text-lg"
                    placeholder="Jean Dupont"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Votre email</label>
                  <Input 
                    {...form.register("email")} 
                    type="email"
                    className="h-12 text-lg"
                    placeholder="jean@exemple.fr"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Votre message</label>
                  <Textarea 
                    {...form.register("message")} 
                    className="min-h-[150px] text-lg p-4"
                    placeholder="Décrivez votre projet..."
                  />
                  {form.formState.errors.message && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.message.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full text-lg h-12 bg-primary hover:bg-teal-800"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Envoi...
                    </>
                  ) : "Envoyer ma demande"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Info & Pricing */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-secondary mb-8">Coordonnées</h2>
              <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-teal-50 p-3 rounded-full text-primary">
                    <Mail size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <a href="mailto:contact@amandine-guide.fr" className="text-lg font-bold text-gray-900 hover:text-primary">
                      contact@amandine-guide.fr
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-teal-50 p-3 rounded-full text-primary">
                    <Phone size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Téléphone</div>
                    <a href="tel:+33600000000" className="text-lg font-bold text-gray-900 hover:text-primary">
                      +33 6 00 00 00 00
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-teal-50 p-3 rounded-full text-primary">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Zone d'intervention</div>
                    <div className="text-lg font-bold text-gray-900">
                      Lyon, Beaujolais, Bourgogne du Sud
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-display font-bold text-secondary mb-8">Tarifs indicatifs</h2>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Prestation</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-500 uppercase tracking-wider">Prix à partir de</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-6 py-4">Visite guidée (2h)</td>
                      <td className="px-6 py-4 text-right font-bold text-primary">180 €</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">Demi-journée (4h)</td>
                      <td className="px-6 py-4 text-right font-bold text-primary">250 €</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">Journée complète (8h)</td>
                      <td className="px-6 py-4 text-right font-bold text-primary">400 €</td>
                    </tr>
                  </tbody>
                </table>
                <div className="bg-gray-50 px-6 py-4 text-sm text-gray-500 italic">
                  * Tarifs donnés à titre indicatif pour un groupe jusqu'à 30 personnes. 
                  Majoration dimanches et jours fériés. Demandez un devis personnalisé.
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
