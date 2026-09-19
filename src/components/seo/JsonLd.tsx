"use client";

const BASE_URL = "https://aieducademy.org";
const GBP_OFFERS = [
  {
    "@type": "Offer",
    name: "Free preview lesson",
    price: "0",
    priceCurrency: "GBP",
    availability: "https://schema.org/InStock",
    category: "free",
  },
  {
    "@type": "Offer",
    name: "Pro monthly",
    price: "3.99",
    priceCurrency: "GBP",
    availability: "https://schema.org/InStock",
    category: "subscription",
  },
  {
    "@type": "Offer",
    name: "Pro annual",
    price: "29.99",
    priceCurrency: "GBP",
    availability: "https://schema.org/InStock",
    category: "subscription",
  },
  {
    "@type": "Offer",
    name: "Pro lifetime",
    price: "49.99",
    priceCurrency: "GBP",
    availability: "https://schema.org/InStock",
    category: "lifetime",
  },
];
const SUPPORTED_LANGUAGES = [
  "en", "fr", "nl", "hi", "te", "es", "pt", "de", "ja", "zh", "ar",
];

function proficiencyLevel(level: number): string {
  return level <= 1 ? "Beginner" : level <= 3 ? "Intermediate" : "Advanced";
}

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Organization", "WebSite"],
    "@id": `${BASE_URL}/#website`,
    name: "AI Educademy",
    url: BASE_URL,
    description:
      "Multilingual AI education platform with interactive lessons and a Pro subscription",
    inLanguage: SUPPORTED_LANGUAGES,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/icon-512.png`,
    },
    founder: {
      "@type": "Person",
      name: "Ramesh Reddy Adutla",
      url: "https://github.com/rameshreddy-adutla",
    },
    publisher: {
      "@type": "Organization",
      name: "AI Educademy",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon-512.png`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/programs?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function CourseJsonLd({
  locale,
  name,
  description,
  slug,
  level,
  estimatedHours,
  provider = "AI Educademy",
}: {
  locale: string;
  name: string;
  description: string;
  slug: string;
  level: number;
  estimatedHours?: number;
  provider?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url: `${BASE_URL}${locale === "en" ? "" : `/${locale}`}/programs/${slug}`,
    provider: {
      "@type": "Organization",
      name: provider,
      url: BASE_URL,
    },
    inLanguage: locale,
    isAccessibleForFree: false,
    educationalLevel: proficiencyLevel(level),
    numberOfCredits: 0,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${estimatedHours ?? 2}H`,
    },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "49.99",
      priceCurrency: "GBP",
      offerCount: GBP_OFFERS.length,
      offers: GBP_OFFERS,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function CourseListJsonLd({
  courses,
  locale,
}: {
  courses: { name: string; description: string; slug: string; level: number }[];
  locale: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: course.name,
        description: course.description,
        provider: {
          "@type": "Organization",
          name: "AI Educademy",
          url: BASE_URL,
        },
        isAccessibleForFree: false,
        inLanguage: locale,
        educationalLevel: proficiencyLevel(course.level),
        url: `${BASE_URL}${locale === "en" ? "" : `/${locale}`}/programs/${course.slug}`,
        offers: {
          "@type": "AggregateOffer",
          lowPrice: "0",
          highPrice: "49.99",
          priceCurrency: "GBP",
          offerCount: GBP_OFFERS.length,
          offers: GBP_OFFERS,
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function LearningResourceJsonLd({
  name,
  description,
  educationalLevel,
  duration,
  locale,
  courseName,
  url,
  isAccessibleForFree = true,
}: {
  name: string;
  description: string;
  educationalLevel: string;
  duration: number;
  locale: string;
  courseName: string;
  url?: string;
  isAccessibleForFree?: boolean;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name,
    description,
    educationalLevel,
    timeRequired: `PT${duration}M`,
    isAccessibleForFree,
    inLanguage: locale,
    ...(url ? { url } : {}),
    isPartOf: {
      "@type": "Course",
      name: courseName,
      provider: {
        "@type": "Organization",
        name: "AI Educademy",
        url: BASE_URL,
      },
    },
    ...(!isAccessibleForFree
      ? {
          offers: {
            "@type": "AggregateOffer",
            lowPrice: "3.99",
            highPrice: "49.99",
            priceCurrency: "GBP",
            offerCount: GBP_OFFERS.length - 1,
            offers: GBP_OFFERS.slice(1),
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ArticleJsonLd({
  headline,
  description,
  datePublished,
  dateModified,
  author,
  image,
  url,
  tags,
}: {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  image?: string;
  url: string;
  tags?: string[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: { "@type": "Person", name: author },
    publisher: {
      "@type": "Organization",
      name: "AI Educademy",
      url: BASE_URL,
    },
    image,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: tags?.join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FAQJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
