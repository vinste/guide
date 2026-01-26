import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, Users, Eye, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface AnalyticsStats {
  period: string;
  stats: {
    total_pageviews: number;
    unique_visitors: number;
    active_days: number;
  };
  topPages: Array<{
    url: string;
    title: string | null;
    views: number;
  }>;
  topReferrers: Array<{
    referrer: string;
    visits: number;
  }>;
}

export function AnalyticsPanel() {
  const [period, setPeriod] = useState<7 | 30 | 90>(7);

  const { data: stats, isLoading, error } = useQuery<AnalyticsStats>({
    queryKey: ['analytics', period],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/stats?days=${period}`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }
      return response.json();
    },
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Erreur lors du chargement des statistiques
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Période de temps */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <Tabs value={period.toString()} onValueChange={(v) => setPeriod(Number(v) as 7 | 30 | 90)} className="w-auto">
          <TabsList className="bg-white">
            <TabsTrigger value="7">7 jours</TabsTrigger>
            <TabsTrigger value="30">30 jours</TabsTrigger>
            <TabsTrigger value="90">90 jours</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Statistiques principales */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Pages vues"
              value={stats?.stats.total_pageviews || 0}
              icon={<Eye className="h-4 w-4 text-muted-foreground" />}
              description="Nombre total de pages visitées"
            />
            <StatCard
              title="Visiteurs uniques"
              value={stats?.stats.unique_visitors || 0}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              description="Visiteurs distincts identifiés"
            />
            <StatCard
              title="Jours actifs"
              value={stats?.stats.active_days || 0}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              description="Jours avec au moins une visite"
            />
          </div>

          {/* Pages les plus visitées */}
          <Card>
            <CardHeader>
              <CardTitle>Pages les plus visitées</CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.topPages || stats.topPages.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Aucune donnée disponible
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.topPages.map((page, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono text-gray-500">#{index + 1}</span>
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline flex items-center truncate"
                          >
                            {page.title || page.url}
                            <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                          </a>
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-1">{page.url}</p>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">{page.views}</div>
                          <div className="text-xs text-gray-400">vues</div>
                        </div>
                        <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{
                              width: `${(page.views / (stats.topPages[0]?.views || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sources de trafic */}
          <Card>
            <CardHeader>
              <CardTitle>Sources de trafic</CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.topReferrers || stats.topReferrers.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Aucune source externe détectée (trafic direct uniquement)
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.topReferrers.map((referrer, index) => {
                    const domain = extractDomain(referrer.referrer);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-mono text-gray-500">#{index + 1}</span>
                            <a
                              href={referrer.referrer}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-primary hover:underline flex items-center"
                            >
                              {domain}
                              <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                            </a>
                          </div>
                          <p className="text-xs text-gray-400 font-mono mt-1 truncate">
                            {referrer.referrer}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">{referrer.visits}</div>
                            <div className="text-xs text-gray-400">visites</div>
                          </div>
                          <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-green-500 h-full rounded-full transition-all"
                              style={{
                                width: `${(referrer.visits / (stats.topReferrers[0]?.visits || 1)) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Note de confidentialité */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Analytics respectueux de la vie privée
                  </h4>
                  <p className="text-xs text-blue-700">
                    Ces statistiques sont collectées de manière anonyme, sans cookies ni tracking
                    inter-sites. Les adresses IP sont hashées et ne sont jamais stockées. Conforme RGPD.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value.toLocaleString('fr-FR')}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}
