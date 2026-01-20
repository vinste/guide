import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTourSchema, type Tour } from "@shared/schema";
import { useCreateTour, useUpdateTour, useDeleteTour, useTours } from "@/hooks/use-tours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Pencil, Trash2, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ToursPanel({ activeLang }: { activeLang: string }) {
  const { data: tours, isLoading } = useTours(undefined, activeLang);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const deleteMutation = useDeleteTour();

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTour(null);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestion des visites ({activeLang.toUpperCase()})</CardTitle>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={16} /> Nouvelle visite
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : tours?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune visite pour cette langue.</p>
        ) : (
          <div className="space-y-4">
            {tours?.map((tour) => (
              <div key={tour.id} className="border rounded-lg p-4 flex justify-between items-start hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  {tour.imageUrl && (
                    <img src={tour.imageUrl} alt="" className="w-20 h-20 object-cover rounded-md border" />
                  )}
                  <div>
                    <h4 className="font-bold text-lg">{tour.title}</h4>
                    <p className="text-sm text-gray-500">{tour.region} • {tour.duration} • {tour.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {tour.isFeatured && (
                        <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          <Star size={10} fill="currentColor" /> Mis en avant
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(tour)}>
                    <Pencil size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => deleteMutation.mutate(tour.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTour ? "Modifier la visite" : "Créer une visite"}</DialogTitle>
            </DialogHeader>
            <TourForm 
              tour={editingTour} 
              activeLang={activeLang} 
              onSuccess={() => setIsDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function TourForm({ tour, activeLang, onSuccess }: { tour: Tour | null, activeLang: string, onSuccess: () => void }) {
  const createMutation = useCreateTour();
  const updateMutation = useUpdateTour();

  const form = useForm({
    resolver: zodResolver(insertTourSchema),
    defaultValues: tour ? {
      title: tour.title || "",
      description: tour.description || "",
      region: tour.region || "Lyon",
      price: tour.price || "",
      duration: tour.duration || "",
      imageUrl: tour.imageUrl || "",
      isFeatured: !!tour.isFeatured,
      language: tour.language || activeLang
    } : {
      title: "",
      description: "",
      region: "Lyon",
      price: "",
      duration: "",
      imageUrl: "",
      isFeatured: false,
      language: activeLang
    }
  });

  const onSubmit = (data: any) => {
    const formattedData = {
      ...data,
      price: data.price || null,
      duration: data.duration || null,
      imageUrl: data.imageUrl || null,
    };
    if (tour) {
      updateMutation.mutate({ id: tour.id, ...formattedData }, { onSuccess });
    } else {
      createMutation.mutate(formattedData, { onSuccess });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Région</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Langue</FormLabel>
                <FormControl>
                  <select {...field} className="w-full h-10 px-3 border rounded-md">
                    <option value="fr">Français</option>
                    <option value="de">Allemand</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée</FormLabel>
                <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix</FormLabel>
                <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea {...field} value={field.value || ""} className="min-h-[100px]" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de l'image</FormLabel>
              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <input 
                  type="checkbox" 
                  checked={!!field.value} 
                  onChange={field.onChange} 
                  className="w-4 h-4"
                />
              </FormControl>
              <FormLabel className="!mt-0">Mis en avant</FormLabel>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
          {createMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
          {tour ? "Mettre à jour" : "Créer la visite"}
        </Button>
      </form>
    </Form>
  );
}
