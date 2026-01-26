import { Router } from 'express';
import { db } from './db';
import { analyticsPageviews, analyticsEvents } from '../shared/schema';
import { sql, count, countDistinct, desc, and, gte, isNotNull, ne } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

/**
 * Hash une adresse IP avec un salt pour anonymiser les visiteurs
 * tout en permettant de compter les visiteurs uniques
 */
function hashVisitor(ip: string, userAgent: string): string {
  const salt = process.env.ANALYTICS_SALT || 'default-salt-change-me';
  const hash = crypto.createHash('sha256');
  hash.update(`${ip}-${userAgent}-${salt}`);
  return hash.digest('hex');
}

/**
 * Endpoint pour collecter les pages vues
 * POST /api/analytics/pageview
 */
router.post('/pageview', async (req, res) => {
  try {
    const { url, referrer, title, screen, language } = req.body;
    
    // Validation basique
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Récupération de l'IP (en tenant compte des proxies)
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
               (req.headers['x-real-ip'] as string) || 
               req.socket.remoteAddress || 
               'unknown';
    
    const userAgent = req.headers['user-agent'] || 'unknown';
    const visitorHash = hashVisitor(ip, userAgent);

    // Insertion dans la base de données
    await db.insert(analyticsPageviews).values({
      url,
      referrer: referrer || null,
      title: title || null,
      screen: screen || null,
      language: language || null,
      visitorHash,
      userAgent,
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error recording pageview:', error);
    res.status(500).json({ error: 'Failed to record pageview' });
  }
});

/**
 * Endpoint pour collecter les événements personnalisés
 * POST /api/analytics/event
 */
router.post('/event', async (req, res) => {
  try {
    const { eventName, eventData, url } = req.body;
    
    if (!eventName || !url) {
      return res.status(400).json({ error: 'eventName and url are required' });
    }

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
               (req.headers['x-real-ip'] as string) || 
               req.socket.remoteAddress || 
               'unknown';
    
    const userAgent = req.headers['user-agent'] || 'unknown';
    const visitorHash = hashVisitor(ip, userAgent);

    await db.insert(analyticsEvents).values({
      eventName,
      eventData: eventData ? JSON.stringify(eventData) : null,
      url,
      visitorHash,
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error recording event:', error);
    res.status(500).json({ error: 'Failed to record event' });
  }
});

/**
 * Endpoint pour récupérer des statistiques basiques
 * GET /api/analytics/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));

    // Statistiques générales avec SQL brut pour compatibilité
    const statsQuery = sql`
      SELECT 
        COUNT(*) as total_pageviews,
        COUNT(DISTINCT visitor_hash) as unique_visitors,
        COUNT(DISTINCT DATE(created_at)) as active_days
      FROM ${analyticsPageviews}
      WHERE created_at >= ${daysAgo}
    `;
    
    const statsResult = await db.execute(statsQuery);
    const stats = statsResult.rows[0] || { 
      total_pageviews: 0, 
      unique_visitors: 0, 
      active_days: 0 
    };

    // Pages les plus visitées
    const topPagesQuery = sql`
      SELECT 
        url,
        title,
        COUNT(*) as views
      FROM ${analyticsPageviews}
      WHERE created_at >= ${daysAgo}
      GROUP BY url, title
      ORDER BY views DESC
      LIMIT 10
    `;
    
    const topPagesResult = await db.execute(topPagesQuery);
    const topPages = topPagesResult.rows;

    // Referrers principaux
    const topReferrersQuery = sql`
      SELECT 
        referrer,
        COUNT(*) as visits
      FROM ${analyticsPageviews}
      WHERE created_at >= ${daysAgo} 
        AND referrer IS NOT NULL 
        AND referrer != ''
      GROUP BY referrer
      ORDER BY visits DESC
      LIMIT 10
    `;
    
    const topReferrersResult = await db.execute(topReferrersQuery);
    const topReferrers = topReferrersResult.rows;

    res.json({
      period: `${days} days`,
      stats: {
        total_pageviews: Number(stats.total_pageviews),
        unique_visitors: Number(stats.unique_visitors),
        active_days: Number(stats.active_days),
      },
      topPages: topPages.map((page: any) => ({
        url: page.url,
        title: page.title,
        views: Number(page.views),
      })),
      topReferrers: topReferrers.map((ref: any) => ({
        referrer: ref.referrer,
        visits: Number(ref.visits),
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      message: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Vérifiez que les tables analytics_pageviews et analytics_events existent dans la base de données'
    });
  }
});

export default router;
