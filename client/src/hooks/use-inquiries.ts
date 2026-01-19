import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertInquiry } from "@shared/routes";

export function useInquiries() {
  return useQuery({
    queryKey: [api.inquiries.list.path],
    queryFn: async () => {
      const res = await fetch(api.inquiries.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch inquiries");
      return api.inquiries.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateInquiry() {
  return useMutation({
    mutationFn: async (data: InsertInquiry) => {
      const res = await fetch(api.inquiries.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send inquiry");
      return api.inquiries.create.responses[201].parse(await res.json());
    },
  });
}
