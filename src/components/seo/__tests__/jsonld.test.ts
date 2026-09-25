import { describe, expect, it } from "vitest";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildCourseJsonLd,
  buildFAQJsonLd,
  buildOrganizationJsonLd,
} from "../JsonLd";

describe("SEO structured data", () => {
  it("builds Organization and WebSite graph without SearchAction", () => {
    const jsonLd = buildOrganizationJsonLd();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@graph"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "Organization",
          name: "AI Educademy",
        }),
        expect.objectContaining({
          "@type": "WebSite",
          url: "https://aieducademy.org",
        }),
      ]),
    );
    expect(JSON.stringify(jsonLd)).not.toContain("SearchAction");
  });

  it("builds paid Course data with provider, language, instance and offers", () => {
    const jsonLd = buildCourseJsonLd({
      locale: "de",
      name: "AI Canopy",
      description: "Fortgeschrittene KI-Systeme",
      slug: "ai-canopy",
      level: 4,
      estimatedHours: 6,
    });

    expect(jsonLd).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Course",
      provider: { "@type": "Organization", name: "AI Educademy" },
      inLanguage: "de",
      isAccessibleForFree: false,
      hasCourseInstance: expect.objectContaining({ "@type": "CourseInstance" }),
      offers: expect.objectContaining({
        "@type": "AggregateOffer",
        priceCurrency: "GBP",
      }),
    });
  });

  it("builds BreadcrumbList with ordered items", () => {
    const jsonLd = buildBreadcrumbJsonLd({
      items: [
        { name: "Home", url: "https://aieducademy.org/" },
        { name: "FAQ", url: "https://aieducademy.org/faq" },
      ],
    });

    expect(jsonLd).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        expect.objectContaining({
          position: 1,
          item: "https://aieducademy.org/",
        }),
        expect.objectContaining({
          position: 2,
          item: "https://aieducademy.org/faq",
        }),
      ],
    });
  });

  it("builds BlogPosting with Google required fields", () => {
    const jsonLd = buildArticleJsonLd({
      headline: "AI article",
      description: "A useful article about AI learning.",
      datePublished: "2026-09-25",
      dateModified: "2026-09-26",
      author: "AI Educademy",
      image: "/social-preview.png",
      url: "https://aieducademy.org/blog/ai-article",
      tags: ["AI"],
      locale: "en",
    });

    expect(jsonLd).toMatchObject({
      "@type": "BlogPosting",
      headline: "AI article",
      datePublished: "2026-09-25",
      dateModified: "2026-09-26",
      inLanguage: "en",
      author: { "@type": "Person", name: "AI Educademy" },
      publisher: expect.objectContaining({ name: "AI Educademy" }),
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://aieducademy.org/blog/ai-article",
      },
    });
    expect(jsonLd.image).toEqual([
      "https://aieducademy.org/social-preview.png",
    ]);
  });

  it("builds FAQPage with accepted answers", () => {
    const jsonLd = buildFAQJsonLd({
      questions: [{ question: "What is Pro?", answer: "A paid plan." }],
    });

    expect(jsonLd).toMatchObject({
      "@type": "FAQPage",
      mainEntity: [
        expect.objectContaining({
          "@type": "Question",
          acceptedAnswer: expect.objectContaining({ "@type": "Answer" }),
        }),
      ],
    });
  });
});
