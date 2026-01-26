import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import analyticsRouter from "./analytics";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // === ANALYTICS ROUTES (Public) ===
  app.use('/api/analytics', analyticsRouter);

  // === PUBLIC ROUTES ===

  // Testimonials (Public List)
  app.get(api.testimonials.listPublic.path, async (req, res) => {
    const lang = req.query.lang as string | undefined;
    const items = await storage.getPublicTestimonials(lang);
    res.json(items);
  });

  // Testimonials (Create - Public)
  app.post(api.testimonials.create.path, async (req, res) => {
    try {
      const input = api.testimonials.create.input.parse(req.body);
      const item = await storage.createTestimonial(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Blog (Public List)
  app.get(api.blog.listPublic.path, async (req, res) => {
    const lang = req.query.lang as string | undefined;
    const items = await storage.getPublicBlogPosts(lang);
    res.json(items);
  });

  // Blog (Public Get One)
  app.get(api.blog.get.path, async (req, res) => {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const item = await storage.getBlogPostBySlug(slug);
    if (!item) return res.status(404).json({ message: "Post not found" });
    res.json(item);
  });

  // Tours (Public List)
  app.get(api.tours.list.path, async (req, res) => {
    const region = req.query.region as string | undefined;
    const lang = req.query.lang as string | undefined;
    const items = await storage.getTours(region, lang);
    res.json(items);
  });
  
  // Tours (Public Get One)
  app.get(api.tours.get.path, async (req, res) => {
    const item = await storage.getTour(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Tour not found" });
    res.json(item);
  });

  // Contact (Public Submit)
  app.post(api.inquiries.create.path, async (req, res) => {
    try {
      const input = api.inquiries.create.input.parse(req.body);
      const item = await storage.createInquiry(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });


  // === ADMIN ROUTES (Protected) ===
  
  // Helper middleware for admin routes
  // For this MVP, if ADMIN_EMAIL is set, only that email is allowed.
  // Otherwise, any logged in user is considered an admin (for development/demo).
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userEmail = req.user?.claims?.email;
    const adminEmail = process.env.ADMIN_EMAIL;
    
    // If ADMIN_EMAIL is configured, enforce it
    if (adminEmail && userEmail !== adminEmail) {
      return res.status(403).json({ message: "Forbidden: Admin access only" });
    }
    
    next();
  };

  // Testimonials (Admin List)
  app.get(api.testimonials.listAll.path, requireAdmin, async (req, res) => {
    const items = await storage.getAllTestimonials();
    res.json(items);
  });

  // Testimonials (Admin Update/Approve)
  app.patch(api.testimonials.update.path, requireAdmin, async (req, res) => {
    const item = await storage.updateTestimonial(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  // Testimonials (Admin Delete)
  app.delete(api.testimonials.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteTestimonial(Number(req.params.id));
    res.status(204).send();
  });

  // Blog (Admin Create)
  app.post(api.blog.create.path, requireAdmin, async (req, res) => {
    const input = api.blog.create.input.parse(req.body);
    const item = await storage.createBlogPost(input);
    res.status(201).json(item);
  });

  // Blog (Admin Update)
  app.put(api.blog.update.path, requireAdmin, async (req, res) => {
    const item = await storage.updateBlogPost(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  // Blog (Admin Delete)
  app.delete(api.blog.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteBlogPost(Number(req.params.id));
    res.status(204).send();
  });

  // Tours (Admin Create)
  app.post(api.tours.create.path, requireAdmin, async (req, res) => {
    const input = api.tours.create.input.parse(req.body);
    const item = await storage.createTour(input);
    res.status(201).json(item);
  });

  // Tours (Admin Update)
  app.put(api.tours.update.path, requireAdmin, async (req, res) => {
    const item = await storage.updateTour(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  // Tours (Admin Delete)
  app.delete(api.tours.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteTour(Number(req.params.id));
    res.status(204).send();
  });

  // Inquiries (Admin List)
  app.get(api.inquiries.list.path, requireAdmin, async (req, res) => {
    const items = await storage.getInquiries();
    res.json(items);
  });

  // SEED DATA
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const tours = await storage.getTours();
  if (tours.length === 0) {
    console.log("Seeding database...");
    
    // Seed Tours
    await storage.createTour({
      title: "Vieux Lyon & Traboules",
      description: "Découvrez les secrets du Vieux Lyon, ses traboules renaissance et son histoire fascinante.",
      region: "Lyon",
      price: "150€ / groupe",
      duration: "2h",
      imageUrl: "https://images.unsplash.com/photo-1621516086687-353683f23789",
      isFeatured: true
    });
    
    await storage.createTour({
      title: "Route des Vins du Beaujolais",
      description: "Une journée au cœur des vignes, avec dégustation dans les meilleurs domaines.",
      region: "Beaujolais",
      price: "250€ / groupe",
      duration: "Demi-journée",
      imageUrl: "https://images.unsplash.com/photo-1599313260717-b0e6e7d6928e",
      isFeatured: true
    });

    await storage.createTour({
      title: "Cluny et le Sud Bourgogne",
      description: "Visite de l'abbaye de Cluny et des paysages bucoliques de la Bourgogne du sud.",
      region: "Bourgogne du Sud",
      price: "300€ / groupe",
      duration: "Journée",
      imageUrl: "https://images.unsplash.com/photo-1632314818788-29724128038b",
      isFeatured: true
    });

    // Seed Blog
    await storage.createBlogPost({
      title: "Bienvenue sur mon nouveau site !",
      slug: "bienvenue",
      content: "Je suis ravie de vous présenter mon nouveau site web. Vous y trouverez toutes mes visites...",
      summary: "Lancement du nouveau site d'Amandine Guide Conférencière.",
      imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
      isPublished: true
    });

    // Seed Testimonial
    await storage.createTestimonial({
      author: "Marie et Pierre",
      content: "Une visite inoubliable ! Amandine est passionnée et passionnante.",
      rating: 5,
      language: "fr"
    });
    
    // Auto-approve seeded testimonial
    const testimonials = await storage.getAllTestimonials();
    if (testimonials.length > 0) {
      await storage.updateTestimonial(testimonials[0].id, true);
    }
  }
}
