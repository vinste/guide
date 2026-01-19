import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "fr" | "de";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    "nav.home": "Accueil",
    "nav.about": "Qui je suis",
    "nav.tours": "Visites & Excursions",
    "nav.blog": "Journal de bord",
    "nav.contact": "Contact & Tarifs",
    "hero.title": "Découvrez l'histoire au cœur de nos régions",
    "hero.subtitle": "Guide conférencière germanophone passionnée, je vous accompagne à travers Lyon, le Beaujolais et la Bourgogne du Sud.",
    "hero.cta.tours": "Voir mes visites",
    "hero.cta.contact": "Me contacter",
    "home.welcome": "Bienvenue en terres de patrimoine",
    "home.intro": "Bonjour, je suis Amandine. Que vous soyez un particulier curieux ou une agence de voyage à la recherche d'une expertise locale, je crée pour vous des itinéraires sur-mesure. Mon objectif ? Vous faire vivre l'histoire, la gastronomie et les paysages de notre belle région avec authenticité et convivialité.",
    "home.feature.all": "Pour tous",
    "home.feature.all.desc": "Adapté aux séniors, familles et groupes professionnels.",
    "home.feature.custom": "Sur-mesure",
    "home.feature.custom.desc": "Des circuits personnalisés selon vos envies et votre rythme.",
    "home.feature.anytime": "Toute l'année",
    "home.feature.anytime.desc": "Découvrez les charmes de chaque saison.",
    "home.featured.title": "Visites à la une",
    "home.featured.subtitle": "Une sélection de mes coups de cœur",
    "home.featured.all": "Voir tout le catalogue",
    "home.testimonials.title": "Ce qu'ils disent de moi",
    "about.title": "Qui je suis",
    "about.subtitle": "Plus qu'un métier, une vocation : partager l'histoire et la culture.",
    "about.journey": "Mon parcours",
    "about.journey.p1": "Passionnée par l'histoire de l'art et les langues étrangères depuis mon plus jeune âge, j'ai fait de ma passion mon métier.",
    "about.journey.p2": "Diplômée en Histoire de l'Art et titulaire de la carte de Guide-Conférencier national, je sillonne les routes de France depuis plus de 15 ans.",
    "about.journey.p3": "Ma spécialité ? L'accueil de la clientèle germanophone. Ayant vécu plusieurs années en Allemagne, je maîtrise non seulement la langue de Goethe, mais je comprends aussi les attentes culturelles de mes visiteurs d'outre-Rhin.",
    "about.philosophy": "Ma philosophie",
    "about.philosophy.p1": "Je conçois mes visites comme des moments d'échange et de convivialité. L'Histoire ne doit pas être une succession de dates arides, mais un récit vivant, incarné par ceux qui l'ont faite.",
    "about.philosophy.p2": "J'aime particulièrement faire découvrir les petits détails cachés, les anecdotes savoureuses et les artisans locaux qui font vivre le patrimoine aujourd'hui.",
    "about.why": "Pourquoi me choisir ?",
    "about.why.1": "Guide conférencière agréée par l'État",
    "about.why.2": "Bilingue Français / Allemand",
    "about.why.3": "Spécialiste du public sénior",
    "about.why.4": "Connaissance pointue du terroir local",
    "about.cta": "Discutons de votre projet",
    "tours.title": "Visites & Excursions",
    "tours.subtitle": "Explorez notre patrimoine à travers des itinéraires conçus pour vous émerveiller.",
    "tours.empty": "Aucune visite trouvée pour cette région",
    "tours.empty.desc": "Essayez une autre catégorie ou contactez-moi pour du sur-mesure.",
    "tours.reserve": "Réserver",
    "blog.title": "Journal de bord",
    "blog.subtitle": "Actualités, découvertes et anecdotes historiques.",
    "blog.empty": "Aucun article pour le moment.",
    "blog.readmore": "Lire la suite",
    "contact.title": "Contact & Tarifs",
    "contact.subtitle": "Une question ? Un projet de visite ? N'hésitez pas à me contacter.",
  },
  de: {
    "nav.home": "Startseite",
    "nav.about": "Über mich",
    "nav.tours": "Führungen & Ausflüge",
    "nav.blog": "Logbuch",
    "nav.contact": "Kontakt & Preise",
    "hero.title": "Entdecken Sie die Geschichte im Herzen unserer Regionen",
    "hero.subtitle": "Als leidenschaftliche deutschsprachige Gästeführerin begleite ich Sie durch Lyon, das Beaujolais und Südburgund.",
    "hero.cta.tours": "Führungen ansehen",
    "hero.cta.contact": "Kontaktieren Sie mich",
    "home.welcome": "Willkommen im Land des Kulturerbes",
    "home.intro": "Guten Tag, ich bin Amandine. Ob Sie eine neugierige Privatperson oder ein Reisebüro auf der Suche nach lokaler Expertise sind, ich erstelle für Sie maßgeschneiderte Reiserouten. Mein Ziel? Sie die Geschichte, die Gastronomie und die Landschaften unserer schönen Region authentisch und gesellig erleben zu lassen.",
    "home.feature.all": "Für alle",
    "home.feature.all.desc": "Geeignet für Senioren, Familien und professionelle Gruppen.",
    "home.feature.custom": "Maßgeschneidert",
    "home.feature.custom.desc": "Individuelle Touren nach Ihren Wünschen und Ihrem Tempo.",
    "home.feature.anytime": "Ganzjährig",
    "home.feature.anytime.desc": "Entdecken Sie den Charme jeder Jahreszeit.",
    "home.featured.title": "Top-Führungen",
    "home.featured.subtitle": "Eine Auswahl meiner Favoriten",
    "home.featured.all": "Gesamten Katalog ansehen",
    "home.testimonials.title": "Was sie über mich sagen",
    "about.title": "Wer ich bin",
    "about.subtitle": "Mehr als ein Beruf, eine Berufung: Geschichte und Kultur teilen.",
    "about.journey": "Mein Werdegang",
    "about.journey.p1": "Schon in jungen Jahren begeisterte ich mich für Kunstgeschichte und Fremdsprachen und habe meine Leidenschaft zum Beruf gemacht.",
    "about.journey.p2": "Als diplomierte Kunsthistorikerin und Inhaberin des staatlichen Ausweises als Gästeführerin bereise ich seit über 15 Jahren die Straßen Frankreichs.",
    "about.journey.p3": "Meine Spezialität? Die Betreuung deutschsprachiger Gäste. Da ich mehrere Jahre in Deutschland gelebt habe, beherrsche ich nicht nur die Sprache Goethes, sondern verstehe auch die kulturellen Erwartungen meiner Besucher von jenseits des Rheins.",
    "about.philosophy": "Meine Philosophie",
    "about.philosophy.p1": "Ich verstehe meine Führungen als Momente des Austauschs und der Geselligkeit. Geschichte sollte keine Abfolge trockener Daten sein, sondern eine lebendige Erzählung, verkörpert durch diejenigen, die sie geschrieben haben.",
    "about.philosophy.p2": "Besonders gerne zeige ich die kleinen verborgenen Details, die amüsanten Anekdoten und die lokalen Handwerker, die das Erbe heute lebendig halten.",
    "about.why": "Warum mich wählen?",
    "about.why.1": "Staatlich anerkannte Gästeführerin",
    "about.why.2": "Zweisprachig Französisch / Deutsch",
    "about.why.3": "Spezialistin für Senioren",
    "about.why.4": "Fundierte Kenntnis der lokalen Region",
    "about.cta": "Lassen Sie uns über Ihr Projekt sprechen",
    "tours.title": "Führungen & Ausflüge",
    "tours.subtitle": "Erkunden Sie unser Erbe durch Routen, die Sie begeistern werden.",
    "tours.empty": "Keine Führungen für diese Region gefunden",
    "tours.empty.desc": "Versuchen Sie eine andere Kategorie oder kontaktieren Sie mich für ein individuelles Angebot.",
    "tours.reserve": "Buchen",
    "blog.title": "Logbuch",
    "blog.subtitle": "Neuigkeiten, Entdeckungen und historische Anekdoten.",
    "blog.empty": "Zur Zeit keine Artikel vorhanden.",
    "blog.readmore": "Weiterlesen",
    "contact.title": "Kontakt & Preise",
    "contact.subtitle": "Haben Sie eine Frage? Ein Besichtigungsprojekt? Zögern Sie nicht, mich zu kontaktieren.",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "fr" || saved === "de") ? saved : "fr";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations["fr"]] || key;
  };

  return (
    <LanguageContext.Provider value={ { language, setLanguage, t } }>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
