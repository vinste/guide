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
  language: text("language").notNull().default("fr"),
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
  language: text("language").notNull().default("fr"),
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
  language: text("language").notNull().default("fr"),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isRead: boolean("is_read").default(false),
});

// === UMAMI ANALYTICS TABLES ===

export const analyticsPageviews = pgTable("analytics_pageviews", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  referrer: text("referrer"),
  title: text("title"),
  screen: varchar("screen", { length: 20 }),
  language: varchar("language", { length: 10 }),
  country: varchar("country", { length: 2 }), // Code pays ISO (ex: FR, US, DE)
  visitorHash: varchar("visitor_hash", { length: 64 }).notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventName: text("event_name").notNull(),
  eventData: text("event_data"), // JSON string
  url: text("url").notNull(),
  visitorHash: varchar("visitor_hash", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === SCHEMAS ===

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true, createdAt: true, isApproved: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true });
export const insertTourSchema = createInsertSchema(tours).omit({ id: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true, isRead: true });

export const insertAnalyticsPageviewSchema = createInsertSchema(analyticsPageviews).omit({ id: true, createdAt: true });
export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({ id: true, createdAt: true });

// === TYPES ===

export type Testimonial = typeof testimonials.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Tour = typeof tours.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type AnalyticsPageview = typeof analyticsPageviews.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type InsertTour = z.infer<typeof insertTourSchema>;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type InsertAnalyticsPageview = z.infer<typeof insertAnalyticsPageviewSchema>;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
