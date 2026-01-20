import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertTour } from "@shared/schema";

export function useTours(region?: string, lang?: string) {
  return useQuery({
    queryKey: [api.tours.list.path, region, lang],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (region) params.append("region", region);
      if (lang) params.append("lang", lang);
      
      const path = params.toString() ? `${api.tours.list.path}?${params.toString()}` : api.tours.list.path;
      
      const res = await fetch(path);
      if (!res.ok) throw new Error("Failed to fetch tours");
      return api.tours.list.responses[200].parse(await res.json());
    },
  });
}

export function useTour(id: number) {
  return useQuery({
    queryKey: [api.tours.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tours.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch tour");
      return api.tours.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTour) => {
      const res = await fetch(api.tours.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create tour");
      return api.tours.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tours.list.path] }),
  });
}

export function useUpdateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertTour>) => {
      const url = buildUrl(api.tours.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update tour");
      return api.tours.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tours.list.path] }),
  });
}

export function useDeleteTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tours.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete tour");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tours.list.path] }),
  });
}
