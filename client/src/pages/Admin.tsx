import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useAllTestimonials, useApproveTestimonial, useDeleteTestimonial } from "@/hooks/use-testimonials";
import { useInquiries } from "@/hooks/use-inquiries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, Check, X, Trash2, Mail } from "lucide-react";

export default function Admin() {
  const { user, isLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) return <div className="h-screen flex items-center justify-center">Chargement...</div>;

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-body">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="font-display text-xl font-bold text-primary">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Bonjour, {user.firstName || user.email}</span>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                <LogOut size={16} className="mr-2" /> Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="inquiries" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl shadow-sm">
            <TabsTrigger value="inquiries" className="rounded-lg px-6">Messagerie</TabsTrigger>
            <TabsTrigger value="testimonials" className="rounded-lg px-6">Témoignages</TabsTrigger>
            <TabsTrigger value="tours" className="rounded-lg px-6">Visites</TabsTrigger>
            <TabsTrigger value="blog" className="rounded-lg px-6">Blog</TabsTrigger>
          </TabsList>

          <TabsContent value="inquiries">
            <InquiriesPanel />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialsPanel />
          </TabsContent>

          <TabsContent value="tours">
            <div className="bg-white p-12 rounded-xl text-center shadow-sm">
              <h3 className="text-xl text-gray-500 mb-4">Gestion des visites</h3>
              <p>Fonctionnalité à venir : Création, modification et suppression des fiches visites.</p>
            </div>
          </TabsContent>

          <TabsContent value="blog">
            <div className="bg-white p-12 rounded-xl text-center shadow-sm">
              <h3 className="text-xl text-gray-500 mb-4">Gestion du blog</h3>
              <p>Fonctionnalité à venir : Éditeur d'articles avec téléchargement d'images.</p>
            </div>
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
                    {new Date(inquiry.createdAt!).toLocaleDateString()}
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
  const approveMutation = useApproveTestimonial();
  const deleteMutation = useDeleteTestimonial();

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modération des témoignages</CardTitle>
      </CardHeader>
      <CardContent>
        {testimonials?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun témoignage à modérer.</p>
        ) : (
          <div className="space-y-4">
            {testimonials?.map((t) => (
              <div key={t.id} className={`border rounded-lg p-6 transition-colors ${t.isApproved ? 'bg-white border-green-100' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-bold">{t.author}</span>
                      <span className="text-yellow-500 text-sm">★ {t.rating}/5</span>
                      {!t.isApproved && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">En attente</span>}
                    </div>
                    <p className="text-gray-600 italic mb-4">"{t.content}"</p>
                  </div>
                  <div className="flex space-x-2">
                    {!t.isApproved && (
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => approveMutation.mutate({ id: t.id, isApproved: true })}
                        disabled={approveMutation.isPending}
                      >
                        <Check size={16} className="mr-1" /> Approuver
                      </Button>
                    )}
                    {t.isApproved && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                        onClick={() => approveMutation.mutate({ id: t.id, isApproved: false })}
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
