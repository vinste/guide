import { Router } from 'express';
import { db } from './db';
import { analyticsPageviews, analyticsEvents } from '../shared/schema';
import { sql, count, countDistinct, desc, and, gte, isNotNull, ne } from 'drizzle-orm';
import crypto from 'crypto';
import geoip from 'geoip-lite';

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
 * Détecte le pays à partir d'une adresse IP
 */
function detectCountry(ip: string): string | null {
  // Ignorer les IPs locales
  if (ip === 'unknown' || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return null;
  }
  
  const geo = geoip.lookup(ip);
  return geo?.country || null;
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
    const country = detectCountry(ip);

    // Insertion dans la base de données
    await db.insert(analyticsPageviews).values({
      url,
      referrer: referrer || null,
      title: title || null,
      screen: screen || null,
      language: language || null,
      country: country || null,
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
        COUNT(DISTINCT DATE(created_at)) as active_days,
        ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT visitor_hash), 0), 2) as avg_pages_per_visitor
      FROM ${analyticsPageviews}
      WHERE created_at >= ${daysAgo}
    `;
    
    const statsResult = await db.execute(statsQuery);
    const stats = statsResult.rows[0] || { 
      total_pageviews: 0, 
      unique_visitors: 0, 
      active_days: 0,
      avg_pages_per_visitor: 0
    };

    // Nouveaux vs retournants (visiteurs qui ont visité avant la période)
    const visitorTypesQuery = sql`
      WITH period_visitors AS (
        SELECT DISTINCT visitor_hash
        FROM ${analyticsPageviews}
        WHERE created_at >= ${daysAgo}
      ),
      previous_visitors AS (
        SELECT DISTINCT visitor_hash
        FROM ${analyticsPageviews}
        WHERE created_at < ${daysAgo}
      )
      SELECT 
        COUNT(CASE WHEN pv.visitor_hash NOT IN (SELECT visitor_hash FROM previous_visitors) THEN 1 END) as new_visitors,
        COUNT(CASE WHEN pv.visitor_hash IN (SELECT visitor_hash FROM previous_visitors) THEN 1 END) as returning_visitors
      FROM period_visitors pv
    `;
    
    const visitorTypesResult = await db.execute(visitorTypesQuery);
    const visitorTypes = visitorTypesResult.rows[0] || { new_visitors: 0, returning_visitors: 0 };

    // Tendance quotidienne (visiteurs uniques par jour)
    const dailyTrendQuery = sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT visitor_hash) as visitors,
        COUNT(*) as pageviews
      FROM ${analyticsPageviews}
      WHERE created_at >= ${daysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    
    const dailyTrendResult = await db.execute(dailyTrendQuery);
    const dailyTrend = dailyTrendResult.rows;

    // Pages les plus visitées
    const topPagesQuery = sql`
      SELECT 
        url,
        title,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_hash) as unique_visitors
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
        COUNT(*) as visits,
        COUNT(DISTINCT visitor_hash) as unique_visitors
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

    // Top navigateurs (user agents simplifiés)
    const browsersQuery = sql`
      SELECT 
        CASE 
          WHEN user_agent LIKE '%Chrome%' AND user_agent NOT LIKE '%Edg%' THEN 'Chrome'
          WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
          WHEN user_agent LIKE '%Safari%' AND user_agent NOT LIKE '%Chrome%' THEN 'Safari'
          WHEN user_agent LIKE '%Edg%' THEN 'Edge'
          WHEN user_agent LIKE '%OPR%' OR user_agent LIKE '%Opera%' THEN 'Opera'
          ELSE 'Autre'
        END as browser,
        COUNT(DISTINCT visitor_hash) as visitors
      FROM ${analyticsPageviews}
      WHERE created_at >= ${daysAgo}
      GROUP BY browser
      ORDER BY visitors DESC
    `;
    
    const browsersResult = await db.execute(browsersQuery);
    const browsers = browsersResult.rows;

    // Top pays
    const countriesQuery = sql`
      SELECT 
        country,
        COUNT(DISTINCT visitor_hash) as visitors,
        COUNT(*) as pageviews
      FROM ${analyticsPageviews}
      WHERE created_at >= ${daysAgo}
        AND country IS NOT NULL
      GROUP BY country
      ORDER BY visitors DESC
      LIMIT 15
    `;
    
    const countriesResult = await db.execute(countriesQuery);
    const countries = countriesResult.rows;

    res.json({
      period: `${days} days`,
      stats: {
        total_pageviews: Number(stats.total_pageviews),
        unique_visitors: Number(stats.unique_visitors),
        active_days: Number(stats.active_days),
        avg_pages_per_visitor: Number(stats.avg_pages_per_visitor) || 0,
        new_visitors: Number(visitorTypes.new_visitors),
        returning_visitors: Number(visitorTypes.returning_visitors),
      },
      dailyTrend: dailyTrend.map((day: any) => ({
        date: day.date,
        visitors: Number(day.visitors),
        pageviews: Number(day.pageviews),
      })),
      topPages: topPages.map((page: any) => ({
        url: page.url,
        title: page.title,
        views: Number(page.views),
        unique_visitors: Number(page.unique_visitors),
      })),
      topReferrers: topReferrers.map((ref: any) => ({
        referrer: ref.referrer,
        visits: Number(ref.visits),
        unique_visitors: Number(ref.unique_visitors),
      })),
      browsers: browsers.map((b: any) => ({
        browser: b.browser,
        visitors: Number(b.visitors),
      })),
      countries: countries.map((c: any) => ({
        country: c.country,
        visitors: Number(c.visitors),
        pageviews: Number(c.pageviews),
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
