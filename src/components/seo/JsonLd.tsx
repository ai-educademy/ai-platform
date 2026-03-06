"use client";

const BASE_URL = "https://aieducademy.vercel.app";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "WebSite"],
    name: "AI Educademy",
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    description:
      "Free, open-source, multilingual AI education platform. Learn Artificial Intelligence from scratch through interactive lessons and hands-on experiments.",
    sameAs: ["https://github.com/ai-educademy"],
    founder: {
      "@type": "Person",
      name: "Ramesh Reddy Adutla",
      url: "https://github.com/rameshreddy-adutla",
    },
    inLanguage: ["en", "fr", "nl", "hi", "te"],
    isAccessibleForFree: true,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/en/programs?q={search_term_string}`,
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
  provider = "AI Educademy",
}: {
  locale: string;
  name: string;
  description: string;
  slug: string;
  level: number;
  provider?: string;
}) {
  const proficiencyLevel =
    level <= 1
      ? "Beginner"
      : level <= 3
        ? "Intermediate"
        : "Advanced";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url: `${BASE_URL}/${locale}/programs/${slug}`,
    provider: {
      "@type": "Organization",
      name: provider,
      url: BASE_URL,
    },
    inLanguage: locale,
    isAccessibleForFree: true,
    educationalLevel: proficiencyLevel,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
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
