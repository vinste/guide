import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  author: text("author").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").default(5),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  imageUrl: text("image_url"),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  region: text("region").notNull(), // 'Lyon', 'Beaujolais', 'Bourgogne'
  price: text("price"),
  duration: text("duration"),
  imageUrl: text("image_url"),
  isFeatured: boolean("is_featured").default(false),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isRead: boolean("is_read").default(false),
});

// === SCHEMAS ===

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true, createdAt: true, isApproved: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true });
export const insertTourSchema = createInsertSchema(tours).omit({ id: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true, isRead: true });

// === TYPES ===

export type Testimonial = typeof testimonials.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Tour = typeof tours.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type InsertTour = z.infer<typeof insertTourSchema>;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
