import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTestimonialSchema, type Testimonial } from "@shared/schema";
import { useCreateTestimonial, useTestimonials } from "@/hooks/use-testimonials";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2, Globe, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function About() {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<"all" | "current">("current");
  const { data: testimonials, isLoading } = useTestimonials(filter === "current" ? language : undefined);
  const { toast } = useToast();
  const createMutation = useCreateTestimonial();

  const form = useForm({
    resolver: zodResolver(insertTestimonialSchema),
    defaultValues: {
      author: "",
      content: "",
      rating: 5,
      language: language
    }
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({ ...data, language }, {
      onSuccess: () => {
        toast({
          title: t("testimonials.success.title"),
          description: t("testimonials.success.description"),
        });
        form.reset({
          author: "",
          content: "",
          rating: 5,
          language: language
        });
      }
    });
  };

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
              {t("about.title")}
            </motion.h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("about.subtitle")}
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
                src="https://colas.fr.nf/amandine.jpg?w=800&auto=format&fit=crop&q=80"
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
                <h2 className="text-3xl font-display font-bold text-secondary mb-4">
                  {t("about.journey")}
                </h2>
                <div className="prose prose-lg text-gray-600">
                  <p className="mb-4">
                    {t("about.journey.p1")}
                    {t("about.journey.p2")}
                  </p>
                  <p>{t("about.journey.p3")}</p>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-display font-bold text-secondary mb-4">
                  {t("about.philosophy")}
                </h2>
                <div className="prose prose-lg text-gray-600">
                  <p className="mb-4">{t("about.philosophy.p1")}</p>
                  <p>{t("about.philosophy.p2")}</p>
                </div>
              </div>

              <div className="bg-indigo-50 p-8 rounded-2xl border-l-4 border-secondary">
                <h3 className="text-xl font-bold text-primary mb-2">
                  {t("about.why")}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                    {t("about.why.1")}
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                    {t("about.why.2")}
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                    {t("about.why.3")}
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                    {t("about.why.4")}
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <Link href="/contact">
                  <Button size="lg" className="text-lg px-8">
                    {t("about.cta")}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Testimonials Management Section */}
        <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-primary mb-4">
                {t("testimonials.title")}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t("testimonials.subtitle")}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
              {/* Testimonials List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                    <Star className="text-accent fill-accent" size={20} />
                    {t("testimonials.list_title")}
                  </h3>
                  <div className="flex items-center bg-white rounded-lg p-1 border shadow-sm">
                    <Button
                      variant={filter === "current" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilter("current")}
                      className="gap-2"
                    >
                      <Languages size={16} />
                      {language.toUpperCase()}
                    </Button>
                    <Button
                      variant={filter === "all" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilter("all")}
                      className="gap-2"
                    >
                      <Globe size={16} />
                      {t("testimonials.filter_all")}
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-primary" size={32} />
                  </div>
                ) : testimonials?.length === 0 ? (
                  <Card className="bg-white/50 border-dashed">
                    <CardContent className="py-12 text-center text-gray-500">
                      {t("testimonials.no_results")}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {testimonials?.map((t: Testimonial) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                      >
                        <Card className="h-full hover-elevate transition-all border-none shadow-sm">
                          <CardContent className="pt-6">
                            <div className="flex text-accent mb-4">
                              {[...Array(t.rating || 5)].map((_, i) => (
                                <Star key={i} size={16} fill="currentColor" />
                              ))}
                            </div>
                            <p className="text-gray-700 italic mb-6">"{t.content}"</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-primary">{t.author}</span>
                              <span className="text-xs font-bold text-gray-400 uppercase">{t.language}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Form */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 shadow-lg border-none">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-primary">
                      {t("testimonials.form_title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("testimonials.form.name")}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Marie L." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("testimonials.form.rating")}</FormLabel>
                              <FormControl>
                                <select 
                                  {...field} 
                                  className="w-full h-10 px-3 border rounded-md"
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                >
                                  {[5,4,3,2,1].map(n => (
                                    <option key={n} value={n}>{n} {t("testimonials.form.stars")}</option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("testimonials.form.content")}</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder={t("testimonials.form.placeholder")}
                                  className="min-h-[120px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full font-bold h-12"
                          disabled={createMutation.isPending}
                        >
                          {createMutation.isPending ? (
                            <Loader2 className="animate-spin mr-2" size={18} />
                          ) : null}
                          {t("testimonials.form.submit")}
                        </Button>
                        <p className="text-[10px] text-gray-400 text-center italic mt-2">
                          {t("testimonials.form.notice")}
                        </p>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
