/**
 * Client-side analytics tracking utility
 * Auto-hébergé, sans cookie, respectueux de la vie privée
 */

interface PageviewData {
  url: string;
  referrer?: string;
  title?: string;
  screen?: string;
  language?: string;
}

interface EventData {
  eventName: string;
  eventData?: Record<string, any>;
  url: string;
}

class Analytics {
  private baseUrl = '/api/analytics';
  private enabled = true;

  /**
   * Envoie une page vue au serveur
   */
  async trackPageview(customData?: Partial<PageviewData>) {
    if (!this.enabled) return;

    const data: PageviewData = {
      url: customData?.url || window.location.pathname + window.location.search,
      referrer: customData?.referrer || document.referrer || undefined,
      title: customData?.title || document.title || undefined,
      screen: customData?.screen || `${window.screen.width}x${window.screen.height}`,
      language: customData?.language || navigator.language || undefined,
    };

    try {
      await fetch(`${this.baseUrl}/pageview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to track pageview:', error);
    }
  }

  /**
   * Envoie un événement personnalisé au serveur
   */
  async trackEvent(eventName: string, eventData?: Record<string, any>) {
    if (!this.enabled) return;

    const data: EventData = {
      eventName,
      eventData,
      url: window.location.pathname + window.location.search,
    };

    try {
      await fetch(`${this.baseUrl}/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Active ou désactive le tracking
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Export d'une instance singleton
export const analytics = new Analytics();

/**
 * Hook React pour tracker automatiquement les changements de page
 */
export function usePageTracking() {
  // Track initial page load
  if (typeof window !== 'undefined') {
    analytics.trackPageview();
  }
}
