import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertBlogPost } from "@shared/routes";

export function useBlogPosts(lang?: string) {
  return useQuery({
    queryKey: [api.blog.listPublic.path, lang],
    queryFn: async () => {
      const path = lang ? `${api.blog.listPublic.path}?lang=${lang}` : api.blog.listPublic.path;
      const res = await fetch(path);
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return api.blog.listPublic.responses[200].parse(await res.json());
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: [api.blog.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.blog.get.path, { slug });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch blog post");
      return api.blog.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBlogPost) => {
      const res = await fetch(api.blog.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create blog post");
      return api.blog.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.blog.listPublic.path] }),
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertBlogPost>) => {
      const url = buildUrl(api.blog.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update blog post");
      return api.blog.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.blog.listPublic.path] });
      queryClient.invalidateQueries({ queryKey: [api.blog.get.path] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.blog.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete blog post");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.blog.listPublic.path] }),
  });
}
