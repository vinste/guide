import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertTestimonial } from "@shared/schema";

export function useTestimonials(lang?: string) {
  return useQuery({
    queryKey: [api.testimonials.listPublic.path, lang],
    queryFn: async () => {
      const path = lang ? `${api.testimonials.listPublic.path}?lang=${lang}` : api.testimonials.listPublic.path;
      const res = await fetch(path);
      if (!res.ok) throw new Error("Failed to fetch testimonials");
      return api.testimonials.listPublic.responses[200].parse(await res.json());
    },
  });
}

export function useAllTestimonials() {
  return useQuery({
    queryKey: [api.testimonials.listAll.path],
    queryFn: async () => {
      const res = await fetch(api.testimonials.listAll.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch all testimonials");
      return api.testimonials.listAll.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTestimonial) => {
      const res = await fetch(api.testimonials.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit testimonial");
      return api.testimonials.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Don't invalidate public list immediately as it requires approval
      queryClient.invalidateQueries({ queryKey: [api.testimonials.listAll.path] });
    },
  });
}

export function useApproveTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isApproved }: { id: number; isApproved: boolean }) => {
      const url = buildUrl(api.testimonials.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update testimonial");
      return api.testimonials.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.testimonials.listPublic.path] });
      queryClient.invalidateQueries({ queryKey: [api.testimonials.listAll.path] });
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.testimonials.delete.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete testimonial");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.testimonials.listPublic.path] });
      queryClient.invalidateQueries({ queryKey: [api.testimonials.listAll.path] });
    },
  });
}
