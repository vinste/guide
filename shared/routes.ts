import { z } from 'zod';
import { insertTestimonialSchema, insertBlogPostSchema, insertTourSchema, insertInquirySchema, testimonials, blogPosts, tours, inquiries } from './schema';

export { insertTestimonialSchema, insertBlogPostSchema, insertTourSchema, insertInquirySchema };

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  testimonials: {
    listPublic: {
      method: 'GET' as const,
      path: '/api/testimonials',
      responses: {
        200: z.array(z.custom<typeof testimonials.$inferSelect>()),
      },
    },
    listAll: { // Admin only
      method: 'GET' as const,
      path: '/api/admin/testimonials',
      responses: {
        200: z.array(z.custom<typeof testimonials.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/testimonials',
      input: insertTestimonialSchema,
      responses: {
        201: z.custom<typeof testimonials.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: { // Admin only (approve)
      method: 'PATCH' as const,
      path: '/api/admin/testimonials/:id',
      input: z.object({ isApproved: z.boolean() }),
      responses: {
        200: z.custom<typeof testimonials.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: { // Admin only
      method: 'DELETE' as const,
      path: '/api/admin/testimonials/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  blog: {
    listPublic: {
      method: 'GET' as const,
      path: '/api/blog',
      responses: {
        200: z.array(z.custom<typeof blogPosts.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/blog/:slug',
      responses: {
        200: z.custom<typeof blogPosts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: { // Admin only
      method: 'POST' as const,
      path: '/api/admin/blog',
      input: insertBlogPostSchema,
      responses: {
        201: z.custom<typeof blogPosts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: { // Admin only
      method: 'PUT' as const,
      path: '/api/admin/blog/:id',
      input: insertBlogPostSchema.partial(),
      responses: {
        200: z.custom<typeof blogPosts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: { // Admin only
      method: 'DELETE' as const,
      path: '/api/admin/blog/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  tours: {
    list: {
      method: 'GET' as const,
      path: '/api/tours',
      input: z.object({ region: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof tours.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tours/:id',
      responses: {
        200: z.custom<typeof tours.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: { // Admin only
      method: 'POST' as const,
      path: '/api/admin/tours',
      input: insertTourSchema,
      responses: {
        201: z.custom<typeof tours.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: { // Admin only
      method: 'PUT' as const,
      path: '/api/admin/tours/:id',
      input: insertTourSchema.partial(),
      responses: {
        200: z.custom<typeof tours.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: { // Admin only
      method: 'DELETE' as const,
      path: '/api/admin/tours/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  inquiries: {
    create: {
      method: 'POST' as const,
      path: '/api/contact',
      input: insertInquirySchema,
      responses: {
        201: z.custom<typeof inquiries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: { // Admin only
      method: 'GET' as const,
      path: '/api/admin/inquiries',
      responses: {
        200: z.array(z.custom<typeof inquiries.$inferSelect>()),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
