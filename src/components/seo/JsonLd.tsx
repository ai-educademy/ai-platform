import {
  BASE_URL,
  SITE_NAME,
  SOCIAL_IMAGE_URL,
  localeUrl,
  SUPPORTED_LANGUAGES,
} from "@/lib/seo";

const GBP_OFFERS = [
  {
    "@type": "Offer",
    name: "Free preview lesson",
    price: "0",
    priceCurrency: "GBP",
    availability: "https://schema.org/InStock",
    category: "free-preview",
    description: "First lesson preview only",
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
] as const;

function proficiencyLevel(level: number): string {
  return level <= 1 ? "Beginner" : level <= 3 ? "Intermediate" : "Advanced";
}

function JsonLdScript({ jsonLd }: { jsonLd: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: SITE_NAME,
        url: BASE_URL,
        description:
          "Multilingual AI education platform with guided lessons and paid Pro programmes",
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/icon-512.png`,
        },
        founder: {
          "@type": "Person",
          name: "Ramesh Reddy Adutla",
          url: "https://github.com/rameshreddy-adutla",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        name: SITE_NAME,
        url: BASE_URL,
        publisher: { "@id": `${BASE_URL}/#organization` },
        inLanguage: SUPPORTED_LANGUAGES,
      },
    ],
  };
}

export function OrganizationJsonLd() {
  return <JsonLdScript jsonLd={buildOrganizationJsonLd()} />;
}

export function buildCourseJsonLd({
  locale,
  name,
  description,
  slug,
  level,
  estimatedHours,
  provider = SITE_NAME,
}: {
  locale: string;
  name: string;
  description: string;
  slug: string;
  level: number;
  estimatedHours?: number;
  provider?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url: localeUrl(locale, `/programs/${slug}`),
    provider: {
      "@type": "Organization",
      name: provider,
      url: BASE_URL,
    },
    inLanguage: locale,
    isAccessibleForFree: false,
    educationalLevel: proficiencyLevel(level),
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${estimatedHours ?? 2}H`,
      location: {
        "@type": "VirtualLocation",
        url: localeUrl(locale, `/programs/${slug}`),
      },
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
}

export function CourseJsonLd(props: {
  locale: string;
  name: string;
  description: string;
  slug: string;
  level: number;
  estimatedHours?: number;
  provider?: string;
}) {
  return <JsonLdScript jsonLd={buildCourseJsonLd(props)} />;
}

export function buildCourseListJsonLd({
  courses,
  locale,
}: {
  courses: { name: string; description: string; slug: string; level: number }[];
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: buildCourseJsonLd({ ...course, locale }),
    })),
  };
}

export function CourseListJsonLd({
  courses,
  locale,
}: {
  courses: { name: string; description: string; slug: string; level: number }[];
  locale: string;
}) {
  return <JsonLdScript jsonLd={buildCourseListJsonLd({ courses, locale })} />;
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
        name: SITE_NAME,
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

  return <JsonLdScript jsonLd={jsonLd} />;
}

export function buildBreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return <JsonLdScript jsonLd={buildBreadcrumbJsonLd({ items })} />;
}

export function buildArticleJsonLd({
  headline,
  description,
  datePublished,
  dateModified,
  author,
  image = SOCIAL_IMAGE_URL,
  url,
  tags,
  locale,
}: {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  image?: string;
  url: string;
  tags?: string[];
  locale: string;
}) {
  const absoluteImage = image.startsWith("http")
    ? image
    : `${BASE_URL}${image}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: { "@type": "Person", name: author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon-512.png`,
      },
    },
    image: [absoluteImage],
    inLanguage: locale,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: tags?.join(", "),
  };
}

export function ArticleJsonLd(props: {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  image?: string;
  url: string;
  tags?: string[];
  locale: string;
}) {
  return <JsonLdScript jsonLd={buildArticleJsonLd(props)} />;
}

export function buildFAQJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  return {
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
}

export function FAQJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  return <JsonLdScript jsonLd={buildFAQJsonLd({ questions })} />;
}
