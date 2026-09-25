import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const BASE_URL = "https://aieducademy.org";
export const SITE_NAME = "AI Educademy";
export const SOCIAL_IMAGE_URL = `${BASE_URL}/social-preview.png`;
export const SUPPORTED_LANGUAGES = [
  "en",
  "ar",
  "de",
  "es",
  "fr",
  "hi",
  "ja",
  "nl",
  "pt",
  "te",
  "zh",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LANGUAGES)[number];
export type StaticSeoKey =
  | "home"
  | "programs"
  | "blog"
  | "about"
  | "faq"
  | "pricing"
  | "lab"
  | "journey"
  | "mockInterview"
  | "starterKit"
  | "contact"
  | "privacy"
  | "terms"
  | "lessons";

export interface SeoCopy {
  title: string;
  description: string;
}

const FALLBACK_LOCALE: SupportedLocale = "en";

const PAGE_SEO: Record<SupportedLocale, Record<StaticSeoKey, SeoCopy>> = {
  en: {
    home: {
      title: "AI learning paths for practical fluency",
      description:
        "Build practical AI fluency with guided programmes, labs and career projects in 11 languages. Start free, then unlock Pro learning when ready.",
    },
    programs: {
      title: "AI programmes by skill level",
      description:
        "Explore structured AI programmes from foundations to interviews, with practical lessons, projects and Pro pathways for serious learners.",
    },
    blog: {
      title: "AI learning articles and career guides",
      description:
        "Read practical AI articles, learning roadmaps and career guides for students, teachers and professionals building useful AI skills.",
    },
    about: {
      title: "About our multilingual AI academy",
      description:
        "Learn why AI Educademy exists, how it makes AI education accessible worldwide, and the mission behind practical multilingual learning.",
    },
    faq: {
      title: "AI Educademy questions answered",
      description:
        "Find clear answers about AI programmes, Pro access, languages, accounts, certificates and how to learn effectively with AI Educademy.",
    },
    pricing: {
      title: "AI Educademy Pro pricing plans",
      description:
        "Compare monthly, annual and lifetime Pro plans. Preview the first lesson free, then unlock full AI programmes, projects and progress tools.",
    },
    lab: {
      title: "Interactive AI lab experiments",
      description:
        "Try practical AI experiments in your browser, explore prompts, models and concepts, and turn lessons into hands-on understanding.",
    },
    journey: {
      title: "Plan your AI learning journey",
      description:
        "Map your AI learning path from first concepts to career readiness with guided milestones, programme choices and practical next steps.",
    },
    mockInterview: {
      title: "AI mock interview practice",
      description:
        "Practise AI, machine learning and system design interviews with guided prompts, feedback loops and career-ready preparation tools.",
    },
    starterKit: {
      title: "Free AI starter kit resources",
      description:
        "Download a practical AI starter kit with learning prompts, core concepts and a simple roadmap for building confidence from day one.",
    },
    contact: {
      title: "Contact AI Educademy support",
      description:
        "Contact AI Educademy for product questions, partnerships, feedback or support with Pro learning, accounts and multilingual programmes.",
    },
    privacy: {
      title: "Privacy policy for learners",
      description:
        "Read how AI Educademy protects learner data, handles accounts, analytics and communications, and keeps privacy clear across the platform.",
    },
    terms: {
      title: "Terms of service for learners",
      description:
        "Review the terms for using AI Educademy, including accounts, Pro subscriptions, acceptable use, content access and learner responsibilities.",
    },
    lessons: {
      title: "AI lesson index and redirects",
      description:
        "Find the right AI lesson through the programme catalogue, with guided routes from beginner foundations to advanced practical skills.",
    },
  },
  de: {
    home: {
      title: "KI-Lernpfade für praktische Sicherheit",
      description:
        "Baue praktische KI-Sicherheit mit geführten Programmen, Übungen und Karriereprojekten in 11 Sprachen auf. Starte gratis und schalte Pro frei.",
    },
    programs: {
      title: "KI-Programme nach Kenntnisstand",
      description:
        "Entdecke strukturierte KI-Programme von Grundlagen bis Vorstellungsgespräch, mit Praxislektionen, Projekten und Pro-Lernpfaden.",
    },
    blog: {
      title: "KI-Artikel und Karriereleitfäden",
      description:
        "Lies praktische KI-Artikel, Lernpläne und Karriereleitfäden für Lernende, Lehrkräfte und Fachleute mit nützlichen KI-Zielen.",
    },
    about: {
      title: "Über unsere mehrsprachige KI-Akademie",
      description:
        "Erfahre, warum AI Educademy existiert, wie sie KI-Bildung weltweit zugänglich macht und welche Mission dahintersteht.",
    },
    faq: {
      title: "Fragen zu AI Educademy beantwortet",
      description:
        "Finde klare Antworten zu KI-Programmen, Pro-Zugang, Sprachen, Konten, Zertifikaten und effektivem Lernen mit AI Educademy.",
    },
    pricing: {
      title: "AI Educademy Pro Preise",
      description:
        "Vergleiche Monats-, Jahres- und Lifetime-Pro-Pläne. Teste die erste Lektion gratis und schalte komplette KI-Programme frei.",
    },
    lab: {
      title: "Interaktive KI-Laborexperimente",
      description:
        "Probiere praktische KI-Experimente im Browser aus, erkunde Prompts, Modelle und Konzepte und vertiefe jede Lektion aktiv.",
    },
    journey: {
      title: "Plane deine KI-Lernreise",
      description:
        "Plane deinen Weg von ersten KI-Konzepten bis zur Karrierereife mit Meilensteinen, Programmwahl und klaren nächsten Schritten.",
    },
    mockInterview: {
      title: "KI-Vorstellungsgespräch üben",
      description:
        "Übe KI-, Machine-Learning- und Systemdesign-Gespräche mit geführten Fragen, Feedbackschleifen und Karrierevorbereitung.",
    },
    starterKit: {
      title: "Kostenloses KI-Starterpaket",
      description:
        "Lade ein praktisches KI-Starterpaket mit Lernprompts, Kernkonzepten und einem einfachen Plan für sicheren Einstieg herunter.",
    },
    contact: {
      title: "AI Educademy Kontakt und Hilfe",
      description:
        "Kontaktiere AI Educademy zu Produktfragen, Partnerschaften, Feedback oder Hilfe bei Pro-Zugang, Konten und Programmen.",
    },
    privacy: {
      title: "Datenschutz für Lernende",
      description:
        "Lies, wie AI Educademy Lerndaten schützt, Konten, Analysen und Mitteilungen verarbeitet und Datenschutz verständlich macht.",
    },
    terms: {
      title: "Nutzungsbedingungen für Lernende",
      description:
        "Prüfe die Bedingungen für AI Educademy, einschliesslich Konten, Pro-Abos, zulässiger Nutzung, Zugriff und Verantwortung.",
    },
    lessons: {
      title: "KI-Lektionsindex und Weiterleitung",
      description:
        "Finde die passende KI-Lektion über den Programmkatalog, mit geführten Wegen von Grundlagen bis zu fortgeschrittener Praxis.",
    },
  },
  es: {
    home: {
      title: "Rutas de IA para fluidez práctica",
      description:
        "Desarrolla fluidez práctica en IA con programas guiados, laboratorios y proyectos profesionales en 11 idiomas. Empieza gratis y avanza a Pro.",
    },
    programs: {
      title: "Programas de IA por nivel",
      description:
        "Explora programas estructurados de IA desde fundamentos hasta entrevistas, con lecciones prácticas, proyectos y rutas Pro.",
    },
    blog: {
      title: "Artículos de IA y guías profesionales",
      description:
        "Lee artículos prácticos de IA, hojas de ruta y guías profesionales para estudiantes, docentes y personas que buscan habilidades útiles.",
    },
    about: {
      title: "Sobre nuestra academia de IA multilingüe",
      description:
        "Conoce por qué existe AI Educademy, cómo acerca la educación en IA al mundo y la misión que guía el aprendizaje práctico.",
    },
    faq: {
      title: "Preguntas sobre AI Educademy",
      description:
        "Encuentra respuestas claras sobre programas de IA, acceso Pro, idiomas, cuentas, certificados y aprendizaje eficaz con AI Educademy.",
    },
    pricing: {
      title: "Precios de AI Educademy Pro",
      description:
        "Compara planes Pro mensuales, anuales y de por vida. Prueba la primera lección gratis y desbloquea programas completos de IA.",
    },
    lab: {
      title: "Laboratorio interactivo de IA",
      description:
        "Prueba experimentos prácticos de IA en el navegador, explora prompts, modelos y conceptos, y convierte las lecciones en práctica.",
    },
    journey: {
      title: "Planifica tu ruta de aprendizaje de IA",
      description:
        "Organiza tu camino desde los primeros conceptos de IA hasta la preparación profesional con hitos, programas y próximos pasos.",
    },
    mockInterview: {
      title: "Práctica de entrevista de IA",
      description:
        "Practica entrevistas de IA, aprendizaje automático y diseño de sistemas con preguntas guiadas, feedback y preparación profesional.",
    },
    starterKit: {
      title: "Kit gratuito para empezar IA",
      description:
        "Descarga un kit inicial de IA con prompts de aprendizaje, conceptos clave y una hoja de ruta sencilla para ganar confianza.",
    },
    contact: {
      title: "Contacto y ayuda de AI Educademy",
      description:
        "Contacta con AI Educademy para producto, alianzas, comentarios o ayuda con Pro, cuentas y programas multilingües.",
    },
    privacy: {
      title: "Privacidad para estudiantes",
      description:
        "Lee cómo AI Educademy protege los datos, gestiona cuentas, analíticas y comunicaciones, y mantiene una privacidad clara.",
    },
    terms: {
      title: "Condiciones de servicio para estudiantes",
      description:
        "Revisa las condiciones de AI Educademy sobre cuentas, suscripciones Pro, uso aceptable, acceso a contenido y responsabilidades.",
    },
    lessons: {
      title: "Índice de lecciones de IA",
      description:
        "Encuentra la lección de IA adecuada desde el catálogo de programas, con rutas guiadas desde fundamentos hasta habilidades avanzadas.",
    },
  },
  fr: {
    home: {
      title: "Parcours IA pour progresser vraiment",
      description:
        "Développez une maîtrise pratique de l'IA avec des programmes guidés, des labs et des projets carrière en 11 langues. Commencez gratuitement.",
    },
    programs: {
      title: "Programmes IA par niveau",
      description:
        "Explorez des programmes IA structurés, des bases aux entretiens, avec leçons pratiques, projets et parcours Pro pour progresser.",
    },
    blog: {
      title: "Articles IA et guides de carrière",
      description:
        "Lisez des articles IA concrets, des plans d'apprentissage et des guides carrière pour étudiants, enseignants et professionnels.",
    },
    about: {
      title: "Notre académie IA multilingue",
      description:
        "Découvrez pourquoi AI Educademy existe, comment elle rend l'éducation IA accessible partout et la mission derrière la plateforme.",
    },
    faq: {
      title: "Questions sur AI Educademy",
      description:
        "Trouvez des réponses claires sur les programmes IA, l'accès Pro, les langues, les comptes, les certificats et l'apprentissage.",
    },
    pricing: {
      title: "Tarifs AI Educademy Pro",
      description:
        "Comparez les offres Pro mensuelle, annuelle et à vie. Essayez la première leçon gratuite puis débloquez les programmes IA complets.",
    },
    lab: {
      title: "Lab IA interactif",
      description:
        "Testez des expériences IA dans le navigateur, explorez prompts, modèles et concepts, et transformez chaque leçon en pratique.",
    },
    journey: {
      title: "Planifiez votre parcours IA",
      description:
        "Organisez votre chemin des premiers concepts IA à la préparation carrière avec des étapes guidées, des choix de programme et des actions.",
    },
    mockInterview: {
      title: "Entraînement entretien IA",
      description:
        "Préparez les entretiens IA, machine learning et architecture avec questions guidées, boucles de feedback et exercices carrière.",
    },
    starterKit: {
      title: "Kit de démarrage IA gratuit",
      description:
        "Téléchargez un kit IA pratique avec prompts, concepts essentiels et feuille de route simple pour apprendre avec confiance.",
    },
    contact: {
      title: "Contact et aide AI Educademy",
      description:
        "Contactez AI Educademy pour les questions produit, partenariats, retours ou aide sur Pro, comptes et programmes multilingues.",
    },
    privacy: {
      title: "Confidentialité des apprenants",
      description:
        "Découvrez comment AI Educademy protège les données, gère comptes, analyses et communications, et explique clairement la confidentialité.",
    },
    terms: {
      title: "Conditions d'utilisation apprenants",
      description:
        "Consultez les conditions d'AI Educademy pour comptes, abonnements Pro, usage autorisé, accès aux contenus et responsabilités.",
    },
    lessons: {
      title: "Index des leçons IA",
      description:
        "Trouvez la bonne leçon IA via le catalogue des programmes, avec des parcours guidés des bases aux compétences avancées.",
    },
  },
  nl: {
    home: {
      title: "AI-leerroutes voor praktische vaardigheid",
      description:
        "Bouw praktische AI-vaardigheid op met begeleide programma's, labs en carrièreprojecten in 11 talen. Start gratis en ga verder met Pro.",
    },
    programs: {
      title: "AI-programma's per niveau",
      description:
        "Ontdek gestructureerde AI-programma's van basis tot sollicitatie, met praktijklessen, projecten en Pro-routes voor serieuze groei.",
    },
    blog: {
      title: "AI-artikelen en carrièregidsen",
      description:
        "Lees praktische AI-artikelen, leerplannen en carrièregidsen voor studenten, docenten en professionals die nuttige vaardigheden bouwen.",
    },
    about: {
      title: "Over onze meertalige AI-academie",
      description:
        "Lees waarom AI Educademy bestaat, hoe het AI-onderwijs wereldwijd toegankelijk maakt en welke missie de leerervaring stuurt.",
    },
    faq: {
      title: "Vragen over AI Educademy",
      description:
        "Vind heldere antwoorden over AI-programma's, Pro-toegang, talen, accounts, certificaten en effectief leren met AI Educademy.",
    },
    pricing: {
      title: "AI Educademy Pro prijzen",
      description:
        "Vergelijk maand-, jaar- en levenslange Pro-plannen. Probeer de eerste les gratis en ontgrendel volledige AI-programma's.",
    },
    lab: {
      title: "Interactief AI-lab",
      description:
        "Probeer praktische AI-experimenten in je browser, verken prompts, modellen en concepten, en maak lessen direct tastbaar.",
    },
    journey: {
      title: "Plan je AI-leerreis",
      description:
        "Stippel je route uit van eerste AI-concepten naar carrièregereedheid met mijlpalen, programmakeuzes en concrete vervolgstappen.",
    },
    mockInterview: {
      title: "AI-sollicitatie oefenen",
      description:
        "Oefen gesprekken over AI, machine learning en systeemontwerp met begeleide vragen, feedback en carrièregerichte voorbereiding.",
    },
    starterKit: {
      title: "Gratis AI-starterkit",
      description:
        "Download een praktische AI-starterkit met leerprompts, kernbegrippen en een eenvoudige routekaart om met vertrouwen te beginnen.",
    },
    contact: {
      title: "Contact en hulp bij AI Educademy",
      description:
        "Neem contact op met AI Educademy voor productvragen, partnerschappen, feedback of hulp bij Pro, accounts en programma's.",
    },
    privacy: {
      title: "Privacy voor leerlingen",
      description:
        "Lees hoe AI Educademy leergegevens beschermt, accounts, analyses en berichten verwerkt, en privacy begrijpelijk houdt.",
    },
    terms: {
      title: "Servicevoorwaarden voor leerlingen",
      description:
        "Bekijk de voorwaarden voor AI Educademy, inclusief accounts, Pro-abonnementen, toegestaan gebruik, toegang en verantwoordelijkheden.",
    },
    lessons: {
      title: "AI-lesindex en doorverwijzing",
      description:
        "Vind de juiste AI-les via de programmacatalogus, met begeleide routes van basiskennis naar gevorderde praktische vaardigheden.",
    },
  },
  pt: {
    home: {
      title: "Percursos de IA para fluência prática",
      description:
        "Desenvolva fluência prática em IA com programas guiados, laboratórios e projetos de carreira em 11 idiomas. Comece grátis e avance para Pro.",
    },
    programs: {
      title: "Programas de IA por nível",
      description:
        "Explore programas estruturados de IA, dos fundamentos às entrevistas, com aulas práticas, projetos e percursos Pro.",
    },
    blog: {
      title: "Artigos de IA e guias de carreira",
      description:
        "Leia artigos práticos de IA, roteiros de aprendizagem e guias de carreira para estudantes, docentes e profissionais.",
    },
    about: {
      title: "Sobre a nossa academia de IA multilíngue",
      description:
        "Conheça a missão da AI Educademy, como torna a educação em IA acessível no mundo todo e por que o projeto existe.",
    },
    faq: {
      title: "Perguntas sobre a AI Educademy",
      description:
        "Encontre respostas claras sobre programas de IA, acesso Pro, idiomas, contas, certificados e aprendizagem eficaz.",
    },
    pricing: {
      title: "Preços do AI Educademy Pro",
      description:
        "Compare planos Pro mensal, anual e vitalício. Experimente a primeira aula grátis e desbloqueie programas completos de IA.",
    },
    lab: {
      title: "Laboratório interativo de IA",
      description:
        "Teste experiências práticas de IA no navegador, explore prompts, modelos e conceitos, e transforme aulas em prática.",
    },
    journey: {
      title: "Planeie a sua jornada de IA",
      description:
        "Organize o caminho dos primeiros conceitos de IA à prontidão profissional com marcos, escolhas de programa e próximos passos.",
    },
    mockInterview: {
      title: "Prática de entrevista de IA",
      description:
        "Pratique entrevistas de IA, aprendizagem automática e desenho de sistemas com perguntas guiadas, feedback e preparação profissional.",
    },
    starterKit: {
      title: "Kit inicial prático de IA",
      description:
        "Descarregue um kit inicial de IA com prompts de aprendizagem, conceitos essenciais e um roteiro simples para ganhar confiança.",
    },
    contact: {
      title: "Contacto e ajuda da AI Educademy",
      description:
        "Contacte a AI Educademy sobre produto, parcerias, feedback ou apoio com Pro, contas e programas multilíngues.",
    },
    privacy: {
      title: "Privacidade para estudantes",
      description:
        "Leia como a AI Educademy protege dados, gere contas, análises e comunicações, e mantém a privacidade clara.",
    },
    terms: {
      title: "Termos de serviço para estudantes",
      description:
        "Reveja os termos da AI Educademy sobre contas, subscrições Pro, uso aceitável, acesso ao conteúdo e responsabilidades.",
    },
    lessons: {
      title: "Índice de aulas de IA",
      description:
        "Encontre a aula de IA certa pelo catálogo de programas, com rotas guiadas dos fundamentos às competências avançadas.",
    },
  },
  hi: {
    home: {
      title: "व्यावहारिक दक्षता के लिए एआई सीखना",
      description:
        "11 भाषाओं में मार्गदर्शित कार्यक्रम, लैब और करियर प्रोजेक्ट से व्यावहारिक एआई दक्षता बनाएं। मुफ्त शुरू करें और फिर Pro अनलॉक करें।",
    },
    programs: {
      title: "स्तर के अनुसार एआई कार्यक्रम",
      description:
        "बुनियाद से इंटरव्यू तक संरचित एआई कार्यक्रम देखें, जिनमें अभ्यास पाठ, प्रोजेक्ट और गंभीर सीखने के लिए Pro मार्ग हैं।",
    },
    blog: {
      title: "एआई लेख और करियर गाइड",
      description:
        "छात्रों, शिक्षकों और पेशेवरों के लिए व्यावहारिक एआई लेख, सीखने की रूपरेखा और करियर गाइड पढ़ें।",
    },
    about: {
      title: "हमारी बहुभाषी एआई अकादमी",
      description:
        "जानें कि AI Educademy क्यों बनी, यह दुनिया भर में एआई शिक्षा को कैसे सुलभ बनाती है और इसके पीछे क्या मिशन है।",
    },
    faq: {
      title: "AI Educademy प्रश्न और उत्तर",
      description:
        "एआई कार्यक्रम, Pro पहुंच, भाषाएं, खाते, प्रमाणपत्र और प्रभावी सीखने के बारे में साफ जवाब पाएं।",
    },
    pricing: {
      title: "AI Educademy Pro मूल्य",
      description:
        "मासिक, वार्षिक और लाइफटाइम Pro योजनाओं की तुलना करें। पहला पाठ मुफ्त देखें और पूरे एआई कार्यक्रम अनलॉक करें।",
    },
    lab: {
      title: "इंटरैक्टिव एआई लैब",
      description:
        "ब्राउजर में व्यावहारिक एआई प्रयोग आजमाएं, प्रॉम्प्ट, मॉडल और अवधारणाएं समझें, और पाठों को अभ्यास में बदलें।",
    },
    journey: {
      title: "अपनी एआई सीखने की यात्रा बनाएं",
      description:
        "पहली एआई अवधारणाओं से करियर तैयारी तक अपना मार्ग बनाएं, माइलस्टोन, कार्यक्रम चयन और अगले कदमों के साथ।",
    },
    mockInterview: {
      title: "एआई मॉक इंटरव्यू अभ्यास",
      description:
        "मार्गदर्शित प्रश्नों, फीडबैक और करियर तैयारी के साथ एआई, मशीन लर्निंग और सिस्टम डिजाइन इंटरव्यू का अभ्यास करें।",
    },
    starterKit: {
      title: "मुफ्त एआई स्टार्टर किट",
      description:
        "सीखने के प्रॉम्प्ट, मुख्य अवधारणाएं और आसान रोडमैप वाली व्यावहारिक एआई स्टार्टर किट डाउनलोड करें।",
    },
    contact: {
      title: "AI Educademy संपर्क और सहायता",
      description:
        "उत्पाद, साझेदारी, फीडबैक या Pro, खाते और बहुभाषी कार्यक्रमों की सहायता के लिए AI Educademy से संपर्क करें।",
    },
    privacy: {
      title: "सीखने वालों के लिए गोपनीयता",
      description:
        "पढ़ें कि AI Educademy सीखने वालों का डेटा, खाते, विश्लेषण और संचार कैसे सुरक्षित और स्पष्ट रखती है।",
    },
    terms: {
      title: "सीखने वालों के लिए सेवा शर्तें",
      description:
        "AI Educademy के खाते, Pro सदस्यता, स्वीकार्य उपयोग, सामग्री पहुंच और जिम्मेदारियों से जुड़ी शर्तें पढ़ें।",
    },
    lessons: {
      title: "एआई पाठ सूचकांक",
      description:
        "कार्यक्रम सूची से सही एआई पाठ खोजें, जहां बुनियाद से उन्नत व्यावहारिक कौशल तक मार्गदर्शित रास्ते मिलते हैं।",
    },
  },
  te: {
    home: {
      title: "ప్రాయోగిక నైపుణ్యానికి ఏఐ అభ్యాస మార్గాలు",
      description:
        "11 భాషల్లో మార్గదర్శిత కార్యక్రమాలు, ల్యాబ్‌లు, కెరీర్ ప్రాజెక్టులతో ప్రాయోగిక ఏఐ నైపుణ్యం పెంచుకోండి. ఉచితంగా మొదలుపెట్టి Pro తీసుకోండి.",
    },
    programs: {
      title: "స్థాయి వారీగా ఏఐ కార్యక్రమాలు",
      description:
        "పునాదుల నుంచి ఇంటర్వ్యూల వరకు నిర్మిత ఏఐ కార్యక్రమాలు చూడండి. ప్రాయోగిక పాఠాలు, ప్రాజెక్టులు, Pro మార్గాలు ఉన్నాయి.",
    },
    blog: {
      title: "ఏఐ వ్యాసాలు మరియు కెరీర్ మార్గదర్శకాలు",
      description:
        "విద్యార్థులు, ఉపాధ్యాయులు, నిపుణుల కోసం ప్రాయోగిక ఏఐ వ్యాసాలు, అభ్యాస ప్రణాళికలు, కెరీర్ మార్గదర్శకాలు చదవండి.",
    },
    about: {
      title: "మా బహుభాషా ఏఐ అకాడమీ గురించి",
      description:
        "AI Educademy ఎందుకు ఏర్పడింది, ప్రపంచవ్యాప్తంగా ఏఐ విద్యను ఎలా అందుబాటులోకి తెస్తోంది, దాని లక్ష్యం ఏమిటో తెలుసుకోండి.",
    },
    faq: {
      title: "AI Educademy ప్రశ్నలకు సమాధానాలు",
      description:
        "ఏఐ కార్యక్రమాలు, Pro ప్రవేశం, భాషలు, ఖాతాలు, సర్టిఫికెట్లు, సమర్థవంతమైన అభ్యాసం గురించి స్పష్టమైన సమాధానాలు పొందండి.",
    },
    pricing: {
      title: "AI Educademy Pro ధరలు",
      description:
        "నెలవారీ, వార్షిక, జీవితకాల Pro ప్లాన్‌లను పోల్చండి. మొదటి పాఠాన్ని ఉచితంగా చూసి పూర్తి ఏఐ కార్యక్రమాలు తెరవండి.",
    },
    lab: {
      title: "ఇంటరాక్టివ్ ఏఐ ల్యాబ్",
      description:
        "బ్రౌజర్‌లో ప్రాయోగిక ఏఐ ప్రయోగాలు చేయండి, ప్రాంప్ట్‌లు, నమూనాలు, భావనలు అర్థం చేసుకుని పాఠాలను సాధనగా మార్చండి.",
    },
    journey: {
      title: "మీ ఏఐ అభ్యాస ప్రయాణాన్ని ప్లాన్ చేయండి",
      description:
        "మొదటి ఏఐ భావనల నుంచి కెరీర్ సిద్ధత వరకు మైలురాళ్లు, కార్యక్రమ ఎంపికలు, తదుపరి చర్యలతో మీ మార్గాన్ని రూపొందించండి.",
    },
    mockInterview: {
      title: "ఏఐ మాక్ ఇంటర్వ్యూ సాధన",
      description:
        "మార్గదర్శిత ప్రశ్నలు, ఫీడ్‌బ్యాక్, కెరీర్ సిద్ధతతో ఏఐ, మెషిన్ లెర్నింగ్, సిస్టమ్ డిజైన్ ఇంటర్వ్యూలను సాధన చేయండి.",
    },
    starterKit: {
      title: "ఉచిత ఏఐ స్టార్టర్ కిట్",
      description:
        "అభ్యాస ప్రాంప్ట్‌లు, ముఖ్య భావనలు, సులభమైన రోడ్‌మ్యాప్‌తో ప్రాయోగిక ఏఐ స్టార్టర్ కిట్ డౌన్‌లోడ్ చేసుకోండి.",
    },
    contact: {
      title: "AI Educademy సంప్రదింపు మరియు సహాయం",
      description:
        "ఉత్పత్తి, భాగస్వామ్యం, అభిప్రాయం లేదా Pro, ఖాతాలు, బహుభాషా కార్యక్రమాల సహాయం కోసం AI Educademyని సంప్రదించండి.",
    },
    privacy: {
      title: "అభ్యాసకుల గోప్యత",
      description:
        "AI Educademy అభ్యాసకుల డేటా, ఖాతాలు, విశ్లేషణలు, సమాచారాన్ని ఎలా రక్షించి స్పష్టంగా నిర్వహిస్తుందో చదవండి.",
    },
    terms: {
      title: "అభ్యాసకుల సేవా నిబంధనలు",
      description:
        "AI Educademy ఖాతాలు, Pro సభ్యత్వాలు, అనుమతించిన వినియోగం, కంటెంట్ ప్రవేశం, బాధ్యతలపై నిబంధనలు చదవండి.",
    },
    lessons: {
      title: "ఏఐ పాఠాల సూచిక",
      description:
        "కార్యక్రమాల జాబితా ద్వారా సరైన ఏఐ పాఠాన్ని కనుగొనండి. పునాదుల నుంచి ఉన్నత ప్రాయోగిక నైపుణ్యాల వరకు మార్గాలు ఉన్నాయి.",
    },
  },
  ja: {
    home: {
      title: "実践力を育てるAI学習ルート",
      description:
        "11言語のガイド付きプログラム、ラボ、キャリア向けプロジェクトで実践的なAI力を育てます。無料で始めてProへ進めます。",
    },
    programs: {
      title: "レベル別AIプログラム",
      description:
        "基礎から面接対策まで、実践レッスン、プロジェクト、本格学習向けProルートを備えたAIプログラムを探せます。",
    },
    blog: {
      title: "AI記事とキャリアガイド",
      description:
        "学生、教育者、専門職向けに、実践的なAI記事、学習ロードマップ、キャリアガイドを読めます。",
    },
    about: {
      title: "多言語AIアカデミーについて",
      description:
        "AI Educademyが生まれた理由、世界中でAI教育を身近にする方法、実践的な学習を支える使命を紹介します。",
    },
    faq: {
      title: "AI Educademyの質問回答",
      description:
        "AIプログラム、Proアクセス、対応言語、アカウント、証明書、効果的な学習方法について明確に確認できます。",
    },
    pricing: {
      title: "AI Educademy Pro料金",
      description:
        "月額、年額、買い切りのProプランを比較できます。最初のレッスンは無料で、全AIプログラムを解放できます。",
    },
    lab: {
      title: "対話型AIラボ",
      description:
        "ブラウザで実践的なAI実験を試し、プロンプト、モデル、概念を探索し、レッスンを体験に変えます。",
    },
    journey: {
      title: "AI学習の道筋を計画",
      description:
        "最初のAI概念からキャリア準備まで、節目、プログラム選択、次の行動を整理して進められます。",
    },
    mockInterview: {
      title: "AI模擬面接の練習",
      description:
        "ガイド付き質問、フィードバック、キャリア準備を通じて、AI、機械学習、システム設計の面接を練習できます。",
    },
    starterKit: {
      title: "無料AIスターターキット",
      description:
        "学習プロンプト、重要概念、簡単なロードマップを含む実践的なAIスターターキットをダウンロードできます。",
    },
    contact: {
      title: "AI Educademyへの連絡と支援",
      description:
        "製品、提携、フィードバック、Pro、アカウント、多言語プログラムに関する支援について連絡できます。",
    },
    privacy: {
      title: "学習者向けプライバシー",
      description:
        "AI Educademyが学習データ、アカウント、分析、連絡をどう保護し、分かりやすく扱うかを確認できます。",
    },
    terms: {
      title: "学習者向け利用規約",
      description:
        "AI Educademyのアカウント、Proサブスクリプション、許容される利用、コンテンツアクセス、責任を確認できます。",
    },
    lessons: {
      title: "AIレッスン一覧",
      description:
        "プログラムカタログから適切なAIレッスンを見つけ、基礎から高度な実践スキルまで段階的に進めます。",
    },
  },
  zh: {
    home: {
      title: "面向实践能力的AI学习路径",
      description:
        "通过11种语言的引导课程、实验室和职业项目培养实用AI能力。可免费开始，准备好后再解锁Pro学习。",
    },
    programs: {
      title: "按水平划分的AI课程",
      description:
        "探索从基础到面试准备的结构化AI课程，包含实践课、项目和适合深入学习的Pro路径。",
    },
    blog: {
      title: "AI文章与职业指南",
      description:
        "阅读面向学生、教师和专业人士的实用AI文章、学习路线图和职业指南，建立真正有用的能力。",
    },
    about: {
      title: "关于我们的多语言AI学院",
      description:
        "了解AI Educademy为何存在，如何让全球学习者更容易接受AI教育，以及平台背后的使命。",
    },
    faq: {
      title: "AI Educademy常见问题",
      description:
        "查看关于AI课程、Pro访问、语言、账户、证书以及高效学习方法的清晰解答。",
    },
    pricing: {
      title: "AI Educademy Pro价格",
      description:
        "比较月度、年度和终身Pro方案。第一课可免费预览，然后解锁完整AI课程、项目和进度工具。",
    },
    lab: {
      title: "交互式AI实验室",
      description:
        "在浏览器中尝试实用AI实验，探索提示词、模型和概念，把课程内容转化为动手理解。",
    },
    journey: {
      title: "规划你的AI学习旅程",
      description:
        "从第一个AI概念到职业准备，用清晰里程碑、课程选择和下一步行动规划你的学习路径。",
    },
    mockInterview: {
      title: "AI模拟面试练习",
      description:
        "通过引导问题、反馈循环和职业准备工具，练习AI、机器学习和系统设计面试。",
    },
    starterKit: {
      title: "免费AI入门工具包",
      description:
        "下载实用AI入门工具包，获得学习提示、核心概念和简单路线图，从第一天建立信心。",
    },
    contact: {
      title: "联系AI Educademy支持",
      description:
        "如有产品问题、合作、反馈，或需要Pro学习、账户和多语言课程支持，可联系AI Educademy。",
    },
    privacy: {
      title: "学习者隐私政策",
      description:
        "了解AI Educademy如何保护学习者数据，处理账户、分析和沟通，并保持清晰透明的隐私说明。",
    },
    terms: {
      title: "学习者服务条款",
      description:
        "查看使用AI Educademy的条款，包括账户、Pro订阅、可接受使用、内容访问和学习者责任。",
    },
    lessons: {
      title: "AI课程索引",
      description:
        "通过课程目录找到合适的AI课，从基础知识到高级实践技能，按照引导路径逐步学习。",
    },
  },
  ar: {
    home: {
      title: "مسارات تعلم الذكاء الاصطناعي العملية",
      description:
        "ابن مهارة عملية في الذكاء الاصطناعي عبر برامج موجهة ومختبرات ومشاريع مهنية ب11 لغة. ابدأ مجانا ثم افتح Pro عند الاستعداد.",
    },
    programs: {
      title: "برامج الذكاء الاصطناعي حسب المستوى",
      description:
        "استكشف برامج منظمة في الذكاء الاصطناعي من الأساسيات إلى المقابلات، مع دروس عملية ومشاريع ومسارات Pro.",
    },
    blog: {
      title: "مقالات الذكاء الاصطناعي ودليل المهنة",
      description:
        "اقرأ مقالات عملية وخطط تعلم وأدلة مهنية في الذكاء الاصطناعي للطلاب والمعلمين والمهنيين الذين يريدون مهارات مفيدة.",
    },
    about: {
      title: "عن أكاديميتنا متعددة اللغات للذكاء الاصطناعي",
      description:
        "تعرّف على سبب وجود AI Educademy وكيف تجعل تعليم الذكاء الاصطناعي متاحا عالميا والرسالة وراء التعلم العملي.",
    },
    faq: {
      title: "أسئلة AI Educademy وإجاباتها",
      description:
        "اعثر على إجابات واضحة حول برامج الذكاء الاصطناعي ووصول Pro واللغات والحسابات والشهادات وطريقة التعلم الفعال.",
    },
    pricing: {
      title: "أسعار AI Educademy Pro",
      description:
        "قارن خطط Pro الشهرية والسنوية ومدى الحياة. جرّب الدرس الأول مجانا ثم افتح برامج الذكاء الاصطناعي كاملة.",
    },
    lab: {
      title: "مختبر تفاعلي للذكاء الاصطناعي",
      description:
        "جرّب تجارب عملية في المتصفح، واستكشف الموجهات والنماذج والمفاهيم، وحوّل الدروس إلى فهم عملي.",
    },
    journey: {
      title: "خطط رحلة تعلم الذكاء الاصطناعي",
      description:
        "نظّم طريقك من أول مفاهيم الذكاء الاصطناعي إلى الجاهزية المهنية عبر مراحل واضحة واختيار برامج وخطوات تالية.",
    },
    mockInterview: {
      title: "تدريب مقابلات الذكاء الاصطناعي",
      description:
        "تدرّب على مقابلات الذكاء الاصطناعي وتعلم الآلة وتصميم الأنظمة بأسئلة موجهة وتعليقات واستعداد مهني.",
    },
    starterKit: {
      title: "حزمة بداية مجانية للذكاء الاصطناعي",
      description:
        "نزّل حزمة بداية عملية تضم موجهات تعلم ومفاهيم أساسية وخطة بسيطة لبناء الثقة من اليوم الأول.",
    },
    contact: {
      title: "تواصل ودعم AI Educademy",
      description:
        "تواصل مع AI Educademy لأسئلة المنتج أو الشراكات أو الملاحظات أو دعم Pro والحسابات والبرامج متعددة اللغات.",
    },
    privacy: {
      title: "خصوصية المتعلمين",
      description:
        "اقرأ كيف تحمي AI Educademy بيانات المتعلمين وتدير الحسابات والتحليلات والرسائل وتحافظ على وضوح الخصوصية.",
    },
    terms: {
      title: "شروط الخدمة للمتعلمين",
      description:
        "راجع شروط استخدام AI Educademy، بما يشمل الحسابات واشتراكات Pro والاستخدام المقبول والوصول إلى المحتوى والمسؤوليات.",
    },
    lessons: {
      title: "فهرس دروس الذكاء الاصطناعي",
      description:
        "اعثر على درس الذكاء الاصطناعي المناسب عبر كتالوج البرامج، مع مسارات موجهة من الأساسيات إلى المهارات المتقدمة.",
    },
  },
};

const PROGRAM_DESCRIPTORS: Record<SupportedLocale, Record<string, string>> = {
  en: {
    "ai-seeds": "AI foundations for beginners",
    "ai-sprouts": "practical AI concepts",
    "ai-branches": "applied machine learning",
    "ai-canopy": "advanced AI systems",
    "ai-forest": "responsible AI mastery",
    "ai-sketch": "coding foundations for AI",
    "ai-chisel": "algorithms for builders",
    "ai-craft": "software patterns for AI apps",
    "ai-polish": "production AI engineering",
    "ai-masterpiece": "capstone AI projects",
    "ai-launchpad": "career launch preparation",
    "ai-behavioral": "behavioural interview practice",
    "ai-technical": "technical interview drills",
    "ai-ml-interview": "machine learning interview prep",
    "ai-offer": "offer readiness and negotiation",
  },
  de: {
    "ai-seeds": "KI-Grundlagen für Einsteiger",
    "ai-sprouts": "praktische KI-Konzepte",
    "ai-branches": "angewandtes maschinelles Lernen",
    "ai-canopy": "fortgeschrittene KI-Systeme",
    "ai-forest": "verantwortungsvolle KI-Meisterschaft",
    "ai-sketch": "Programmiergrundlagen für KI",
    "ai-chisel": "Algorithmen für Entwickler",
    "ai-craft": "Softwaremuster für KI-Anwendungen",
    "ai-polish": "KI-Entwicklung für Produktion",
    "ai-masterpiece": "abschliessende KI-Projekte",
    "ai-launchpad": "Vorbereitung auf den Karrierestart",
    "ai-behavioral": "Training für Verhaltensgespräche",
    "ai-technical": "technische Interviewübungen",
    "ai-ml-interview": "Vorbereitung auf ML-Interviews",
    "ai-offer": "Angebotsreife und Verhandlung",
  },
  es: {
    "ai-seeds": "bases de IA para principiantes",
    "ai-sprouts": "conceptos prácticos de IA",
    "ai-branches": "aprendizaje automático aplicado",
    "ai-canopy": "sistemas avanzados de IA",
    "ai-forest": "dominio responsable de IA",
    "ai-sketch": "bases de programación para IA",
    "ai-chisel": "algoritmos para crear soluciones",
    "ai-craft": "patrones de software para apps de IA",
    "ai-polish": "ingeniería de IA en producción",
    "ai-masterpiece": "proyectos finales de IA",
    "ai-launchpad": "preparación para lanzar carrera",
    "ai-behavioral": "práctica de entrevista conductual",
    "ai-technical": "ejercicios de entrevista técnica",
    "ai-ml-interview": "preparación de entrevistas ML",
    "ai-offer": "ofertas y negociación profesional",
  },
  fr: {
    "ai-seeds": "bases IA pour débutants",
    "ai-sprouts": "concepts IA pratiques",
    "ai-branches": "apprentissage automatique appliqué",
    "ai-canopy": "systèmes IA avancés",
    "ai-forest": "maîtrise IA responsable",
    "ai-sketch": "bases du code pour l'IA",
    "ai-chisel": "algorithmes pour construire",
    "ai-craft": "modèles logiciels pour apps IA",
    "ai-polish": "ingénierie IA en production",
    "ai-masterpiece": "projets finaux en IA",
    "ai-launchpad": "préparation au lancement carrière",
    "ai-behavioral": "entraînement entretien comportemental",
    "ai-technical": "exercices d'entretien technique",
    "ai-ml-interview": "préparation aux entretiens ML",
    "ai-offer": "offre d'emploi et négociation",
  },
  nl: {
    "ai-seeds": "AI-basis voor beginners",
    "ai-sprouts": "praktische AI-concepten",
    "ai-branches": "toegepast machine learning",
    "ai-canopy": "gevorderde AI-systemen",
    "ai-forest": "verantwoorde AI-beheersing",
    "ai-sketch": "codebasis voor AI",
    "ai-chisel": "algoritmen voor bouwers",
    "ai-craft": "softwarepatronen voor AI-apps",
    "ai-polish": "AI-engineering voor productie",
    "ai-masterpiece": "eindprojecten in AI",
    "ai-launchpad": "voorbereiding op carrièrestart",
    "ai-behavioral": "gedragsinterview oefenen",
    "ai-technical": "technische interviewtraining",
    "ai-ml-interview": "voorbereiding op ML-interviews",
    "ai-offer": "aanbieding en onderhandeling",
  },
  pt: {
    "ai-seeds": "bases de IA para iniciantes",
    "ai-sprouts": "conceitos práticos de IA",
    "ai-branches": "aprendizagem automática aplicada",
    "ai-canopy": "sistemas avançados de IA",
    "ai-forest": "domínio responsável de IA",
    "ai-sketch": "bases de programação para IA",
    "ai-chisel": "algoritmos para criar soluções",
    "ai-craft": "padrões de software para apps de IA",
    "ai-polish": "engenharia de IA em produção",
    "ai-masterpiece": "projetos finais de IA",
    "ai-launchpad": "preparação para iniciar carreira",
    "ai-behavioral": "prática de entrevista comportamental",
    "ai-technical": "treino de entrevista técnica",
    "ai-ml-interview": "preparação para entrevistas ML",
    "ai-offer": "oferta e negociação profissional",
  },
  hi: {
    "ai-seeds": "शुरुआती लोगों के लिए एआई आधार",
    "ai-sprouts": "व्यावहारिक एआई अवधारणाएं",
    "ai-branches": "लागू मशीन लर्निंग",
    "ai-canopy": "उन्नत एआई सिस्टम",
    "ai-forest": "जिम्मेदार एआई में निपुणता",
    "ai-sketch": "एआई के लिए कोडिंग आधार",
    "ai-chisel": "निर्माताओं के लिए एल्गोरिदम",
    "ai-craft": "एआई ऐप्स के लिए सॉफ्टवेयर पैटर्न",
    "ai-polish": "उत्पादन के लिए एआई इंजीनियरिंग",
    "ai-masterpiece": "अंतिम एआई प्रोजेक्ट",
    "ai-launchpad": "करियर शुरुआत की तैयारी",
    "ai-behavioral": "व्यवहारिक इंटरव्यू अभ्यास",
    "ai-technical": "तकनीकी इंटरव्यू अभ्यास",
    "ai-ml-interview": "ML इंटरव्यू तैयारी",
    "ai-offer": "ऑफर और बातचीत की तैयारी",
  },
  te: {
    "ai-seeds": "ప్రారంభికుల కోసం ఏఐ పునాదులు",
    "ai-sprouts": "ప్రాయోగిక ఏఐ భావనలు",
    "ai-branches": "అనువర్తిత మెషిన్ లెర్నింగ్",
    "ai-canopy": "ఉన్నత ఏఐ వ్యవస్థలు",
    "ai-forest": "బాధ్యతాయుత ఏఐ నైపుణ్యం",
    "ai-sketch": "ఏఐ కోసం కోడింగ్ పునాదులు",
    "ai-chisel": "నిర్మాతల కోసం అల్గోరిథమ్‌లు",
    "ai-craft": "ఏఐ యాప్‌లకు సాఫ్ట్‌వేర్ నమూనాలు",
    "ai-polish": "ఉత్పత్తి స్థాయి ఏఐ ఇంజినీరింగ్",
    "ai-masterpiece": "చివరి ఏఐ ప్రాజెక్టులు",
    "ai-launchpad": "కెరీర్ ప్రారంభ సిద్ధత",
    "ai-behavioral": "ప్రవర్తనా ఇంటర్వ్యూ సాధన",
    "ai-technical": "సాంకేతిక ఇంటర్వ్యూ సాధన",
    "ai-ml-interview": "ML ఇంటర్వ్యూ సిద్ధత",
    "ai-offer": "ఆఫర్ మరియు చర్చ సిద్ధత",
  },
  ja: {
    "ai-seeds": "初心者向けAI基礎",
    "ai-sprouts": "実践的なAI概念",
    "ai-branches": "応用機械学習",
    "ai-canopy": "高度なAIシステム",
    "ai-forest": "責任あるAIの習熟",
    "ai-sketch": "AI向けコーディング基礎",
    "ai-chisel": "作り手のためのアルゴリズム",
    "ai-craft": "AIアプリのソフトウェア設計",
    "ai-polish": "本番向けAIエンジニアリング",
    "ai-masterpiece": "総仕上げAIプロジェクト",
    "ai-launchpad": "キャリア開始準備",
    "ai-behavioral": "行動面接の練習",
    "ai-technical": "技術面接の演習",
    "ai-ml-interview": "ML面接対策",
    "ai-offer": "内定準備と交渉",
  },
  zh: {
    "ai-seeds": "初学者AI基础",
    "ai-sprouts": "实用AI概念",
    "ai-branches": "应用机器学习",
    "ai-canopy": "高级AI系统",
    "ai-forest": "负责任AI精通",
    "ai-sketch": "AI编程基础",
    "ai-chisel": "构建者算法",
    "ai-craft": "AI应用软件模式",
    "ai-polish": "生产级AI工程",
    "ai-masterpiece": "AI综合项目",
    "ai-launchpad": "职业起步准备",
    "ai-behavioral": "行为面试练习",
    "ai-technical": "技术面试训练",
    "ai-ml-interview": "ML面试准备",
    "ai-offer": "录用准备与谈判",
  },
  ar: {
    "ai-seeds": "أساسيات الذكاء الاصطناعي للمبتدئين",
    "ai-sprouts": "مفاهيم عملية في الذكاء الاصطناعي",
    "ai-branches": "تعلم الآلة التطبيقي",
    "ai-canopy": "أنظمة ذكاء اصطناعي متقدمة",
    "ai-forest": "إتقان الذكاء الاصطناعي المسؤول",
    "ai-sketch": "أساسيات البرمجة للذكاء الاصطناعي",
    "ai-chisel": "خوارزميات لبناء الحلول",
    "ai-craft": "أنماط برمجية لتطبيقات الذكاء الاصطناعي",
    "ai-polish": "هندسة ذكاء اصطناعي للإنتاج",
    "ai-masterpiece": "مشاريع ذكاء اصطناعي ختامية",
    "ai-launchpad": "الاستعداد لبداية مهنية",
    "ai-behavioral": "تدريب المقابلات السلوكية",
    "ai-technical": "تمارين المقابلات التقنية",
    "ai-ml-interview": "تحضير مقابلات ML",
    "ai-offer": "الاستعداد للعرض والتفاوض",
  },
};

const PROGRAM_DESCRIPTION_VERBS: Record<
  SupportedLocale,
  (brand: string, descriptor: string) => string
> = {
  en: (brand, descriptor) =>
    `${brand} teaches ${descriptor} with guided lessons, applied projects and Pro practice, while the first lesson stays free to preview.`,
  de: (brand, descriptor) =>
    `${brand} vermittelt ${descriptor} mit geführten Lektionen, Praxisprojekten und Pro-Übungen. Die erste Lektion bleibt als Vorschau gratis.`,
  es: (brand, descriptor) =>
    `${brand} enseña ${descriptor} con lecciones guiadas, proyectos aplicados y práctica Pro. La primera lección se puede ver gratis.`,
  fr: (brand, descriptor) =>
    `${brand} enseigne ${descriptor} avec leçons guidées, projets appliqués et pratique Pro. La première leçon reste gratuite.`,
  nl: (brand, descriptor) =>
    `${brand} leert ${descriptor} met begeleide lessen, toegepaste projecten en Pro-oefening. De eerste les blijft gratis als preview.`,
  pt: (brand, descriptor) =>
    `${brand} ensina ${descriptor} com aulas guiadas, projetos aplicados e prática Pro. A primeira aula continua grátis para pré-visualização.`,
  hi: (brand, descriptor) =>
    `${brand} में ${descriptor}, मार्गदर्शित पाठ, लागू प्रोजेक्ट और Pro अभ्यास मिलते हैं। पहला पाठ देखने के लिए मुफ्त रहता है।`,
  te: (brand, descriptor) =>
    `${brand}లో ${descriptor}, మార్గదర్శిత పాఠాలు, అనువర్తిత ప్రాజెక్టులు, Pro సాధన ఉంటాయి. మొదటి పాఠం ఉచితంగా చూడవచ్చు.`,
  ja: (brand, descriptor) =>
    `${brand}では${descriptor}を、ガイド付きレッスン、応用プロジェクト、Pro演習で学べます。最初のレッスンは無料です。`,
  zh: (brand, descriptor) =>
    `${brand}通过引导课程、应用项目和Pro练习教授${descriptor}。第一课可免费预览，适合先体验再深入学习。`,
  ar: (brand, descriptor) =>
    `يعلم ${brand} ${descriptor} عبر دروس موجهة ومشاريع تطبيقية وتدريب Pro. يبقى الدرس الأول مجانيا للمعاينة.`,
};

function normaliseLocale(locale: string): SupportedLocale {
  return SUPPORTED_LANGUAGES.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : FALLBACK_LOCALE;
}

export function localeUrl(locale: string, path: string): string {
  return locale === "en"
    ? `${BASE_URL}${path}`
    : `${BASE_URL}/${locale}${path}`;
}

export function canonicalUrl(locale: string, path: string): string {
  return localeUrl(locale, path);
}

export function buildAlternates(path: string) {
  const languages: Record<string, string> = {
    "x-default": `${BASE_URL}${path}`,
    ...Object.fromEntries(routing.locales.map((l) => [l, localeUrl(l, path)])),
  };

  return { languages };
}

export function getPageSeo(locale: string, key: StaticSeoKey): SeoCopy {
  const safeLocale = normaliseLocale(locale);
  return PAGE_SEO[safeLocale][key] ?? PAGE_SEO[FALLBACK_LOCALE][key];
}

export function getProgramSeo(
  locale: string,
  slug: string,
  brandName: string,
): SeoCopy {
  const safeLocale = normaliseLocale(locale);
  const descriptor =
    PROGRAM_DESCRIPTORS[safeLocale][slug] ??
    PROGRAM_DESCRIPTORS[FALLBACK_LOCALE][slug] ??
    "AI programme";
  return {
    title: `${brandName}: ${descriptor}`,
    description: PROGRAM_DESCRIPTION_VERBS[safeLocale](brandName, descriptor),
  };
}

export function getAchievementSeo(
  locale: string,
  programName: string,
): SeoCopy {
  const copy: Record<SupportedLocale, SeoCopy> = {
    en: {
      title: `${programName} achievement certificate`,
      description: `Share a private ${programName} completion card from AI Educademy. Achievement pages are personal, so search engines should not index them.`,
    },
    de: {
      title: `${programName} Abschlussnachweis`,
      description: `Teile eine private Abschlusskarte für ${programName} von AI Educademy. Persönliche Erfolgsseiten werden nicht indexiert.`,
    },
    es: {
      title: `Logro de ${programName}`,
      description: `Comparte una tarjeta privada de finalización de ${programName} de AI Educademy. Las páginas personales no se indexan.`,
    },
    fr: {
      title: `Réussite ${programName}`,
      description: `Partagez une carte privée de fin de ${programName} par AI Educademy. Les pages personnelles ne sont pas indexées.`,
    },
    nl: {
      title: `${programName} prestatiebewijs`,
      description: `Deel een privé voltooiingskaart voor ${programName} van AI Educademy. Persoonlijke pagina's worden niet geïndexeerd.`,
    },
    pt: {
      title: `Conquista ${programName}`,
      description: `Partilhe um cartão privado de conclusão de ${programName} da AI Educademy. Páginas pessoais não são indexadas.`,
    },
    hi: {
      title: `${programName} उपलब्धि प्रमाण`,
      description: `AI Educademy से ${programName} पूरा करने का निजी कार्ड साझा करें। व्यक्तिगत उपलब्धि पेज इंडेक्स नहीं किए जाते।`,
    },
    te: {
      title: `${programName} సాధన ధృవీకరణ`,
      description: `AI Educademyలో ${programName} పూర్తి చేసిన వ్యక్తిగత కార్డ్‌ను పంచుకోండి. వ్యక్తిగత పేజీలు ఇండెక్స్ కావు.`,
    },
    ja: {
      title: `${programName}達成証明`,
      description: `AI Educademyの${programName}修了カードを非公開で共有できます。個人ページは検索対象にしません。`,
    },
    zh: {
      title: `${programName}成就证明`,
      description: `分享AI Educademy的${programName}私人完成卡。个人成就页面不应被搜索引擎索引。`,
    },
    ar: {
      title: `إنجاز ${programName}`,
      description: `شارك بطاقة إكمال خاصة لبرنامج ${programName} من AI Educademy. صفحات الإنجاز الشخصية لا تفهرس.`,
    },
  };
  return copy[normaliseLocale(locale)];
}

const LOCALE_TERM_REPLACEMENTS: Partial<
  Record<SupportedLocale, Array<[RegExp, string]>>
> = {
  de: [
    [/Machine[- ]Learning/gi, "maschinelles Lernen"],
    [/Deep Learning/gi, "tiefes Lernen"],
    [/Career Ready/g, "Karrierebereit"],
    [/System ?Design|Systemdesign/gi, "Systementwurf"],
  ],
  es: [
    [/Machine[- ]Learning/gi, "aprendizaje automático"],
    [/Deep Learning/gi, "aprendizaje profundo"],
    [/Career Ready/g, "Preparación profesional"],
    [/System ?Design|Systemdesign/gi, "diseño de sistemas"],
  ],
  fr: [
    [/Machine[- ]Learning/gi, "apprentissage automatique"],
    [/Deep Learning/gi, "apprentissage profond"],
    [/Career Ready/g, "Prêt pour la carrière"],
    [/System ?Design|Systemdesign/gi, "architecture système"],
  ],
  nl: [
    [/Machine[- ]Learning/gi, "machinaal leren"],
    [/Deep Learning/gi, "diep leren"],
    [/Career Ready/g, "Carrièreklaar"],
    [/System ?Design|Systemdesign/gi, "systeemontwerp"],
    [/absolute beginner/gi, "volledige starter"],
    [/beginner/gi, "starter"],
  ],
  pt: [
    [/Machine[- ]Learning/gi, "aprendizagem automática"],
    [/Deep Learning/gi, "aprendizagem profunda"],
    [/Career Ready/g, "Prontidão profissional"],
    [/System ?Design|Systemdesign/gi, "desenho de sistemas"],
  ],
  hi: [
    [/Machine[- ]Learning/gi, "मशीन लर्निंग"],
    [/Deep Learning/gi, "डीप लर्निंग"],
    [/Career Ready/g, "करियर तैयारी"],
    [/System ?Design|Systemdesign/gi, "सिस्टम डिजाइन"],
  ],
  te: [
    [/Machine[- ]Learning/gi, "మెషిన్ లెర్నింగ్"],
    [/Deep Learning/gi, "డీప్ లెర్నింగ్"],
    [/Career Ready/g, "కెరీర్ సిద్ధత"],
    [/System ?Design|Systemdesign/gi, "సిస్టమ్ డిజైన్"],
  ],
  ja: [
    [/Machine[- ]Learning/gi, "機械学習"],
    [/Deep Learning/gi, "深層学習"],
    [/Career Ready/g, "キャリア準備"],
    [/System ?Design|Systemdesign/gi, "システム設計"],
  ],
  zh: [
    [/Machine[- ]Learning/gi, "机器学习"],
    [/Deep Learning/gi, "深度学习"],
    [/Career Ready/g, "职业准备"],
    [/System ?Design|Systemdesign/gi, "系统设计"],
  ],
  ar: [
    [/Machine[- ]Learning/gi, "تعلم الآلة"],
    [/Deep Learning/gi, "التعلم العميق"],
    [/Career Ready/g, "الاستعداد المهني"],
    [/System ?Design|Systemdesign/gi, "تصميم الأنظمة"],
  ],
};

function sanitiseLocalisedMetadata(value: string, locale: string): string {
  const safeLocale = normaliseLocale(locale);
  const withoutDashes = value.replace(/[—–]/g, "-");
  return (LOCALE_TERM_REPLACEMENTS[safeLocale] ?? []).reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    withoutDashes,
  );
}

function characterLength(value: string): number {
  return [...value].length;
}

// Titles are left whole. Google shortens long titles itself, and cutting them
// here lopped off the programme name that told pages apart.
function fitTitleForMeta(title: string): string {
  const trimmed = title.trim();
  if (characterLength(trimmed) <= 60) return trimmed;
  const withoutParentheses = trimmed.replace(/\s*\([^)]*\)/g, "").trim();
  return withoutParentheses || trimmed;
}

// Short descriptions are kept as written. Padding them with a shared sentence
// made hundreds of pages carry identical boilerplate.
function fitDescriptionForMeta(description: string): string {
  const fitted = description.trim();
  if (characterLength(fitted) <= 160) return fitted;

  const chars = [...fitted];
  const clipped = chars.slice(0, 157).join("");
  const lastSpace = clipped.lastIndexOf(" ");
  const base = lastSpace > 90 ? clipped.slice(0, lastSpace) : clipped;
  return `${base.trim()}...`;
}

function titleWithSite(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

export function createSeoMetadata({
  locale,
  path,
  title,
  description,
  type = "website",
  imageUrl = SOCIAL_IMAGE_URL,
  imageAlt = "AI Educademy multilingual AI learning platform",
  robots,
  openGraph,
  twitter,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  imageUrl?: string;
  imageAlt?: string;
  robots?: Metadata["robots"];
  openGraph?: Metadata["openGraph"];
  twitter?: Metadata["twitter"];
}): Metadata {
  const canonical = localeUrl(locale, path);
  const localTitle = sanitiseLocalisedMetadata(title, locale);
  const localDescription = sanitiseLocalisedMetadata(description, locale);
  const fittedTitle = fitTitleForMeta(localTitle);
  const fittedDescription = fitDescriptionForMeta(localDescription);
  const titled = titleWithSite(fittedTitle);
  // The root layout appends "| AI Educademy"; a title that already names the
  // brand must bypass the template or Google sees it twice.
  const pageTitle: Metadata["title"] = fittedTitle.includes(SITE_NAME)
    ? { absolute: fittedTitle }
    : fittedTitle;

  return {
    metadataBase: new URL(BASE_URL),
    title: pageTitle,
    description: fittedDescription,
    alternates: {
      canonical,
      ...buildAlternates(path),
    },
    openGraph: {
      title: titled,
      description: fittedDescription,
      url: canonical,
      type,
      siteName: SITE_NAME,
      locale,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: titled,
      description: fittedDescription,
      images: [imageUrl],
      ...twitter,
    },
    ...(robots ? { robots } : {}),
  };
}
