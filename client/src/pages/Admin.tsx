import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAllTestimonials, useApproveTestimonial, useDeleteTestimonial } from "@/hooks/use-testimonials";
import { useInquiries } from "@/hooks/use-inquiries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, Check, X, Trash2, Mail, BarChart3 } from "lucide-react";
import { BlogPanel } from "@/components/admin/BlogPanel";
import { ToursPanel } from "@/components/admin/ToursPanel";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";

export default function Admin() {
  const { user, isLoading, logout, isLoggingOut } = useAuth();
  const [, setLocation] = useLocation();
  const [activeLang, setActiveLang] = useState<"fr" | "de">("fr");

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) return <div className="h-screen flex items-center justify-center">Chargement...</div>;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-body">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <span className="font-display text-xl font-bold text-primary">Admin Dashboard</span>
              <div className="flex items-center bg-gray-100 rounded-lg p-1 ml-4">
                <button 
                  onClick={() => setActiveLang("fr")}
                  className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${activeLang === "fr" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  FR
                </button>
                <button 
                  onClick={() => setActiveLang("de")}
                  className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${activeLang === "de" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  DE
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Bonjour, {(user as any).firstName || (user as any).email || (user as any).username}</span>
              <Button variant="outline" size="sm" onClick={() => logout()} disabled={isLoggingOut}>
                {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut size={16} className="mr-2" />} Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl shadow-sm">
            <TabsTrigger value="analytics" className="rounded-lg px-6">
              <BarChart3 size={16} className="mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-lg px-6">Messagerie</TabsTrigger>
            <TabsTrigger value="testimonials" className="rounded-lg px-6">Témoignages</TabsTrigger>
            <TabsTrigger value="tours" className="rounded-lg px-6">Visites</TabsTrigger>
            <TabsTrigger value="blog" className="rounded-lg px-6">Blog</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsPanel />
          </TabsContent>

          <TabsContent value="inquiries">
            <InquiriesPanel />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialsPanel />
          </TabsContent>

          <TabsContent value="tours">
            <ToursPanel activeLang={activeLang} />
          </TabsContent>

          <TabsContent value="blog">
            <BlogPanel activeLang={activeLang} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function InquiriesPanel() {
  const { data: inquiries, isLoading } = useInquiries();

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages reçus</CardTitle>
      </CardHeader>
      <CardContent>
        {inquiries?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun message pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {inquiries?.map((inquiry) => (
              <div key={inquiry.id} className="border border-gray-100 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-lg text-primary flex items-center">
                    <Mail size={16} className="mr-2 text-gray-400" />
                    {inquiry.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : ""}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-3">{inquiry.email}</div>
                <p className="text-gray-700 bg-white p-4 rounded-md border border-gray-100">
                  {inquiry.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TestimonialsPanel() {
  const { data: testimonials, isLoading } = useAllTestimonials();
  const updateMutation = useApproveTestimonial();
  const deleteMutation = useDeleteTestimonial();

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modération des témoignages</CardTitle>
      </CardHeader>
      <CardContent>
        {testimonials?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun témoignage pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {testimonials?.map((t) => (
              <div key={t.id} className={`border rounded-lg p-6 transition-colors ${t.isApproved ? 'bg-white border-green-100' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-bold">{t.author}</span>
                      <span className="text-yellow-500 text-sm">★ {t.rating}/5</span>
                      {!t.isApproved && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">En attente</span>}
                    </div>
                    <p className="text-gray-600 italic mb-4">"{t.content}"</p>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Langue :</span>
                      <div className="flex bg-gray-100 p-0.5 rounded-md">
                        {["fr", "de", "other"].map((l) => (
                          <button
                            key={l}
                            onClick={() => updateMutation.mutate({ id: t.id, language: l })}
                            className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${t.language === l ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                          >
                            {l.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {!t.isApproved && (
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateMutation.mutate({ id: t.id, isApproved: true })}
                        disabled={updateMutation.isPending}
                      >
                        <Check size={16} className="mr-1" /> Approuver
                      </Button>
                    )}
                    {t.isApproved && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                        onClick={() => updateMutation.mutate({ id: t.id, isApproved: false })}
                        disabled={updateMutation.isPending}
                      >
                        <X size={16} className="mr-1" /> Masquer
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(t.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
