import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBlogPostSchema, type BlogPost } from "@shared/schema";
import { useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, useBlogPosts } from "@/hooks/use-blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl,FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Pencil, Trash2, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function BlogPanel({ activeLang }: { activeLang: string }) {
  const { data: posts, isLoading } = useBlogPosts(activeLang);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const deleteMutation = useDeleteBlogPost();

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPost(null);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestion du blog ({activeLang.toUpperCase()})</CardTitle>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={16} /> Nouvel article
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : posts?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun article pour cette langue.</p>
        ) : (
          <div className="space-y-4">
            {posts?.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 flex justify-between items-start hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="" className="w-20 h-20 object-cover rounded-md border" />
                  )}
                  <div>
                    <h4 className="font-bold text-lg">{post.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{post.summary}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${post.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {post.isPublished ? 'Publié' : 'Brouillon'}
                      </span>
                      <span className="text-xs text-gray-400">{post.slug}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(post)}>
                    <Pencil size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => deleteMutation.mutate(post.id)}>
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
              <DialogTitle>{editingPost ? "Modifier l'article" : "Créer un article"}</DialogTitle>
            </DialogHeader>
            <BlogForm 
              post={editingPost} 
              activeLang={activeLang} 
              onSuccess={() => setIsDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function BlogForm({ post, activeLang, onSuccess }: { post: BlogPost | null, activeLang: string, onSuccess: () => void }) {
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();

  const form = useForm({
    resolver: zodResolver(insertBlogPostSchema),
    defaultValues: post ? {
      title: post.title || "",
      slug: post.slug || "",
      content: post.content || "",
      summary: post.summary || "",
      imageUrl: post.imageUrl || "",
      isPublished: !!post.isPublished,
      language: post.language || activeLang
    } : {
      title: "",
      slug: "",
      content: "",
      summary: "",
      imageUrl: "",
      isPublished: false,
      language: activeLang
    }
  });

  const onSubmit = (data: any) => {
    const formattedData = {
      ...data,
      summary: data.summary || null,
      imageUrl: data.imageUrl || null,
    };
    if (post) {
      updateMutation.mutate({ id: post.id, ...formattedData }, { onSuccess });
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
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (URL)</FormLabel>
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
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Résumé</FormLabel>
              <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu (Markdown/HTML)</FormLabel>
              <FormControl><Textarea {...field} value={field.value || ""} className="min-h-[200px]" /></FormControl>
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
          name="isPublished"
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
              <FormLabel className="!mt-0">Publié</FormLabel>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
          {createMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
          {post ? "Mettre à jour" : "Créer l'article"}
        </Button>
      </form>
    </Form>
  );
}
