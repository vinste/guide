import { db } from "./db";
import {
  users, testimonials, blogPosts, tours, inquiries,
  type User, type InsertUser, type Testimonial, type InsertTestimonial,
  type BlogPost, type InsertBlogPost, type Tour, type InsertTour,
  type Inquiry, type InsertInquiry
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: InsertUser): Promise<User>;

  // Testimonials
  getPublicTestimonials(): Promise<Testimonial[]>;
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, approved: boolean): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<void>;

  // Blog
  getPublicBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<void>;

  // Tours
  getTours(region?: string): Promise<Tour[]>;
  getTour(id: number): Promise<Tour | undefined>;
  createTour(tour: InsertTour): Promise<Tour>;
  updateTour(id: number, tour: Partial<InsertTour>): Promise<Tour | undefined>;
  deleteTour(id: number): Promise<void>;

  // Inquiries
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiries(): Promise<Inquiry[]>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods delegated to authStorage
  async getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }
  async upsertUser(user: InsertUser): Promise<User> {
    return authStorage.upsertUser(user);
  }

  // Testimonials
  async getPublicTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).where(eq(testimonials.isApproved, true)).orderBy(desc(testimonials.createdAt));
  }
  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  }
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [entry] = await db.insert(testimonials).values(testimonial).returning();
    return entry;
  }
  async updateTestimonial(id: number, approved: boolean): Promise<Testimonial | undefined> {
    const [entry] = await db.update(testimonials)
      .set({ isApproved: approved })
      .where(eq(testimonials.id, id))
      .returning();
    return entry;
  }
  async deleteTestimonial(id: number): Promise<void> {
    await db.delete(testimonials).where(eq(testimonials.id, id));
  }

  // Blog
  async getPublicBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(desc(blogPosts.createdAt));
  }
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [entry] = await db.insert(blogPosts).values(post).returning();
    return entry;
  }
  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [entry] = await db.update(blogPosts).set(post).where(eq(blogPosts.id, id)).returning();
    return entry;
  }
  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Tours
  async getTours(region?: string): Promise<Tour[]> {
    if (region) {
      return await db.select().from(tours).where(eq(tours.region, region));
    }
    return await db.select().from(tours);
  }
  async getTour(id: number): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    return tour;
  }
  async createTour(tour: InsertTour): Promise<Tour> {
    const [entry] = await db.insert(tours).values(tour).returning();
    return entry;
  }
  async updateTour(id: number, tour: Partial<InsertTour>): Promise<Tour | undefined> {
    const [entry] = await db.update(tours).set(tour).where(eq(tours.id, id)).returning();
    return entry;
  }
  async deleteTour(id: number): Promise<void> {
    await db.delete(tours).where(eq(tours.id, id));
  }

  // Inquiries
  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [entry] = await db.insert(inquiries).values(inquiry).returning();
    return entry;
  }
  async getInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  }
}

export const storage = new DatabaseStorage();
