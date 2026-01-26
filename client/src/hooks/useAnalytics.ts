import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { analytics } from '../lib/analytics';

/**
 * Hook pour tracker automatiquement les changements de page
 * Utilise wouter pour détecter les changements de route
 */
export function useAnalytics() {
  const [location] = useLocation();

  useEffect(() => {
    // Track pageview on route change
    analytics.trackPageview();
  }, [location]);
}

/**
 * Hook pour tracker un événement personnalisé
 */
export function useTrackEvent() {
  return (eventName: string, eventData?: Record<string, any>) => {
    analytics.trackEvent(eventName, eventData);
  };
}
