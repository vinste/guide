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
      message: subject ? `${t("contact.form.subject")}: ${subject}` : "",
    },
  });

  const onSubmit = (data: InsertInquiry) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: t("contact.form.success.title"),
          description: t("contact.form.success.desc"),
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: t("contact.form.error.title"),
          description: t("contact.form.error.desc"),
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
            <h2 className="text-3xl font-display font-bold text-secondary mb-8">{t("contact.form.title")}</h2>
            <Card className="p-8 shadow-lg border-t-4 border-t-accent">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{t("contact.form.name")}</label>
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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t("contact.form.email")}</label>
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
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">{t("contact.form.message")}</label>
                  <Textarea 
                    {...form.register("message")} 
                    className="min-h-[150px] text-lg p-4"
                    placeholder={t("contact.form.message.placeholder")}
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
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("contact.form.sending")}
                    </>
                  ) : t("contact.form.submit")}
                </Button>
              </form>
            </Card>
          </div>

          {/* Info & Pricing */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-secondary mb-8">{t("contact.info.title")}</h2>
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
                    <div className="text-sm text-gray-500">{t("contact.info.phone")}</div>
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
                    <div className="text-sm text-gray-500">{t("contact.info.area")}</div>
                    <div className="text-lg font-bold text-gray-900">
                      {t("contact.info.area.desc")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-display font-bold text-secondary mb-8">{t("contact.pricing.title")}</h2>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">{t("contact.pricing.service")}</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-500 uppercase tracking-wider">{t("contact.pricing.price")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-6 py-4">{t("contact.pricing.service.1")}</td>
                      <td className="px-6 py-4 text-right font-bold text-primary">180 €</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">{t("contact.pricing.service.2")}</td>
                      <td className="px-6 py-4 text-right font-bold text-primary">250 €</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">{t("contact.pricing.service.3")}</td>
                      <td className="px-6 py-4 text-right font-bold text-primary">400 €</td>
                    </tr>
                  </tbody>
                </table>
                <div className="bg-gray-50 px-6 py-4 text-sm text-gray-500 italic">
                  {t("contact.pricing.note")}
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
