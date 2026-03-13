const emailStrings: Record<string, Record<string, string>> = {
  en: {
    title: "Welcome to AI Educademy",
    subtitle: "Welcome to our community!",
    greeting: "Welcome",
    body: "Thank you for joining the AI Educademy community! We're excited to have you on board. Whether you're looking to learn, experiment, or collaborate, you're in the right place.",
    explore: "Here's what you can explore:",
    browsePrograms: "Browse Programs",
    tryLab: "Try AI Lab",
    joinGithub: "Join GitHub",
    closing: "Happy learning! If you have any questions, feel free to reach out to us anytime.",
    regards: "Best regards,",
    team: "The AI Educademy Team",
    footer: "You received this email because you subscribed to AI Educademy.",
    unsubscribe: "Unsubscribe",
  },
  fr: {
    title: "Bienvenue sur AI Educademy",
    subtitle: "Bienvenue dans notre communaute !",
    greeting: "Bienvenue",
    body: "Merci d'avoir rejoint la communaute AI Educademy ! Nous sommes ravis de vous accueillir. Que vous souhaitiez apprendre, experimenter ou collaborer, vous etes au bon endroit.",
    explore: "Voici ce que vous pouvez explorer :",
    browsePrograms: "Parcourir les programmes",
    tryLab: "Essayer le labo IA",
    joinGithub: "Rejoindre GitHub",
    closing: "Bon apprentissage ! Si vous avez des questions, n'hesitez pas a nous contacter.",
    regards: "Cordialement,",
    team: "L'equipe AI Educademy",
    footer: "Vous avez recu cet email car vous etes abonne a AI Educademy.",
    unsubscribe: "Se desabonner",
  },
  nl: {
    title: "Welkom bij AI Educademy",
    subtitle: "Welkom in onze community!",
    greeting: "Welkom",
    body: "Bedankt dat je lid bent geworden van de AI Educademy community! We zijn blij dat je erbij bent. Of je nu wilt leren, experimenteren of samenwerken, je bent op de juiste plek.",
    explore: "Dit kun je verkennen:",
    browsePrograms: "Programma's bekijken",
    tryLab: "AI Lab proberen",
    joinGithub: "GitHub bijtreden",
    closing: "Veel leerplezier! Als je vragen hebt, neem gerust contact met ons op.",
    regards: "Met vriendelijke groet,",
    team: "Het AI Educademy Team",
    footer: "Je ontvangt deze email omdat je je hebt ingeschreven bij AI Educademy.",
    unsubscribe: "Uitschrijven",
  },
  hi: {
    title: "AI Educademy में आपका स्वागत है",
    subtitle: "हमारे समुदाय में आपका स्वागत है!",
    greeting: "स्वागत है",
    body: "AI Educademy समुदाय में शामिल होने के लिए धन्यवाद! हमें खुशी है कि आप यहां हैं। चाहे आप सीखना चाहें, प्रयोग करना चाहें या सहयोग करना चाहें, आप सही जगह पर हैं।",
    explore: "यहां वह है जो आप एक्सप्लोर कर सकते हैं:",
    browsePrograms: "प्रोग्राम देखें",
    tryLab: "AI लैब आज़माएं",
    joinGithub: "GitHub जॉइन करें",
    closing: "शुभ शिक्षा! यदि आपके कोई प्रश्न हैं, तो बेझिझक हमसे संपर्क करें।",
    regards: "सादर,",
    team: "AI Educademy टीम",
    footer: "आपको यह ईमेल इसलिए मिला क्योंकि आपने AI Educademy की सदस्यता ली है।",
    unsubscribe: "सदस्यता रद्द करें",
  },
  te: {
    title: "AI Educademy కి స్వాగతం",
    subtitle: "మా కమ్యూనిటీకి స్వాగతం!",
    greeting: "స్వాగతం",
    body: "AI Educademy కమ్యూనిటీలో చేరినందుకు ధన్యవాదాలు! మీరు ఇక్కడ ఉన్నందుకు మేము సంతోషిస్తున్నాము. మీరు నేర్చుకోవాలనుకున్నా, ప్రయోగాలు చేయాలనుకున్నా లేదా సహకరించాలనుకున్నా, మీరు సరైన చోటికి వచ్చారు.",
    explore: "మీరు ఏమి అన్వేషించవచ్చో ఇక్కడ ఉంది:",
    browsePrograms: "ప్రోగ్రామ్‌లు చూడండి",
    tryLab: "AI ల్యాబ్ ప్రయత్నించండి",
    joinGithub: "GitHub చేరండి",
    closing: "శుభ విద్యాభ్యాసం! మీకు ఏవైనా ప్రశ్నలు ఉంటే, దయచేసి ఎప్పుడైనా మమ్మల్ని సంప్రదించండి.",
    regards: "శుభాకాంక్షలతో,",
    team: "AI Educademy టీమ్",
    footer: "మీరు AI Educademy కి సబ్‌స్క్రైబ్ చేసినందున ఈ ఇమెయిల్ అందింది.",
    unsubscribe: "అన్‌సబ్‌స్క్రైబ్",
  },
};

const subscriptionStrings: Record<string, Record<string, string>> = {
  en: {
    proTitle: "Welcome to Pro! 🚀",
    proSubtitle: "Your upgrade is confirmed",
    proGreeting: "You're now a Pro member",
    proBody: "Thank you for upgrading to AI Educademy Pro! You now have full access to all premium programs, advanced lessons, and exclusive content.",
    proFeatures: "What's unlocked for you:",
    feature1: "All premium programs & lessons",
    feature2: "Advanced AI projects & labs",
    feature3: "Priority support",
    proCta: "Start Learning",
    proClosing: "We're thrilled to have you. Dive in and explore everything Pro has to offer!",
    cancelTitle: "We're sorry to see you go 😢",
    cancelSubtitle: "Your subscription has ended",
    cancelGreeting: "Your Pro access has ended",
    cancelBody: "Your AI Educademy Pro subscription has been cancelled. You'll continue to have access to all free programs and the first lesson of premium programs.",
    cancelCta: "Resubscribe",
    cancelClosing: "We hope to see you back! Our free content is always available, and you can resubscribe anytime.",
    planLabel: "Plan",
    monthly: "Pro Monthly (£3.99/mo)",
    annual: "Pro Annual (£29.99/yr)",
    lifetime: "Lifetime Access (£49.99)",
  },
  fr: {
    proTitle: "Bienvenue chez Pro ! 🚀",
    proSubtitle: "Votre mise a niveau est confirmee",
    proGreeting: "Vous etes maintenant membre Pro",
    proBody: "Merci d'avoir passe a AI Educademy Pro ! Vous avez maintenant acces a tous les programmes premium, aux lecons avancees et au contenu exclusif.",
    proFeatures: "Ce qui est debloque pour vous :",
    feature1: "Tous les programmes et lecons premium",
    feature2: "Projets et labos IA avances",
    feature3: "Support prioritaire",
    proCta: "Commencer a apprendre",
    proClosing: "Nous sommes ravis de vous compter parmi nous. Plongez et explorez tout ce que Pro a a offrir !",
    cancelTitle: "Nous sommes desoles de vous voir partir 😢",
    cancelSubtitle: "Votre abonnement a pris fin",
    cancelGreeting: "Votre acces Pro a pris fin",
    cancelBody: "Votre abonnement AI Educademy Pro a ete annule. Vous continuez a avoir acces a tous les programmes gratuits et a la premiere lecon des programmes premium.",
    cancelCta: "Se reabonner",
    cancelClosing: "Nous esperons vous revoir ! Notre contenu gratuit est toujours disponible, et vous pouvez vous reabonner a tout moment.",
    planLabel: "Formule",
    monthly: "Pro Mensuel (3,99 £/mois)",
    annual: "Pro Annuel (29,99 £/an)",
    lifetime: "Acces a vie (49,99 £)",
  },
  nl: {
    proTitle: "Welkom bij Pro! 🚀",
    proSubtitle: "Je upgrade is bevestigd",
    proGreeting: "Je bent nu een Pro-lid",
    proBody: "Bedankt voor de upgrade naar AI Educademy Pro! Je hebt nu volledige toegang tot alle premium programma's, geavanceerde lessen en exclusieve content.",
    proFeatures: "Wat er voor je is ontgrendeld:",
    feature1: "Alle premium programma's en lessen",
    feature2: "Geavanceerde AI-projecten en labs",
    feature3: "Prioriteitsondersteuning",
    proCta: "Begin met leren",
    proClosing: "We zijn blij dat je erbij bent. Duik erin en ontdek alles wat Pro te bieden heeft!",
    cancelTitle: "We vinden het jammer dat je weggaat 😢",
    cancelSubtitle: "Je abonnement is beeindigd",
    cancelGreeting: "Je Pro-toegang is beeindigd",
    cancelBody: "Je AI Educademy Pro-abonnement is geannuleerd. Je hebt nog steeds toegang tot alle gratis programma's en de eerste les van premium programma's.",
    cancelCta: "Opnieuw abonneren",
    cancelClosing: "We hopen je terug te zien! Onze gratis content is altijd beschikbaar en je kunt je altijd opnieuw abonneren.",
    planLabel: "Plan",
    monthly: "Pro Maandelijks (£3,99/maand)",
    annual: "Pro Jaarlijks (£29,99/jaar)",
    lifetime: "Levenslange toegang (£49,99)",
  },
  hi: {
    proTitle: "Pro में आपका स्वागत है! 🚀",
    proSubtitle: "आपका अपग्रेड कन्फर्म हो गया है",
    proGreeting: "अब आप Pro सदस्य हैं",
    proBody: "AI Educademy Pro में अपग्रेड करने के लिए धन्यवाद! अब आपके पास सभी प्रीमियम प्रोग्राम, एडवांस्ड लेसन और एक्सक्लूसिव कंटेंट की पूरी एक्सेस है।",
    proFeatures: "आपके लिए क्या अनलॉक है:",
    feature1: "सभी प्रीमियम प्रोग्राम और लेसन",
    feature2: "एडवांस्ड AI प्रोजेक्ट्स और लैब्स",
    feature3: "प्राथमिकता सहायता",
    proCta: "सीखना शुरू करें",
    proClosing: "हम खुश हैं कि आप यहां हैं। Pro की सभी सुविधाओं का अन्वेषण करें!",
    cancelTitle: "आपको जाते देख दुख हुआ 😢",
    cancelSubtitle: "आपकी सदस्यता समाप्त हो गई है",
    cancelGreeting: "आपकी Pro एक्सेस समाप्त हो गई है",
    cancelBody: "आपकी AI Educademy Pro सदस्यता रद्द कर दी गई है। आपके पास अभी भी सभी फ्री प्रोग्राम और प्रीमियम प्रोग्राम के पहले लेसन तक एक्सेस है।",
    cancelCta: "फिर से सदस्यता लें",
    cancelClosing: "हम आपको फिर से देखने की उम्मीद करते हैं! हमारा फ्री कंटेंट हमेशा उपलब्ध है।",
    planLabel: "प्लान",
    monthly: "Pro मासिक (£3.99/माह)",
    annual: "Pro वार्षिक (£29.99/वर्ष)",
    lifetime: "लाइफटाइम एक्सेस (£49.99)",
  },
  te: {
    proTitle: "Pro కి స్వాగతం! 🚀",
    proSubtitle: "మీ అప్‌గ్రేడ్ నిర్ధారించబడింది",
    proGreeting: "మీరు ఇప్పుడు Pro సభ్యులు",
    proBody: "AI Educademy Pro కి అప్‌గ్రేడ్ చేసినందుకు ధన్యవాదాలు! మీకు ఇప్పుడు అన్ని ప్రీమియం ప్రోగ్రామ్‌లు, అడ్వాన్స్‌డ్ లెసన్‌లు మరియు ఎక్స్‌క్లూజివ్ కంటెంట్‌కు పూర్తి యాక్సెస్ ఉంది.",
    proFeatures: "మీ కోసం ఏమి అన్‌లాక్ చేయబడింది:",
    feature1: "అన్ని ప్రీమియం ప్రోగ్రామ్‌లు & లెసన్‌లు",
    feature2: "అడ్వాన్స్‌డ్ AI ప్రాజెక్ట్‌లు & ల్యాబ్‌లు",
    feature3: "ప్రాధాన్యత మద్దతు",
    proCta: "నేర్చుకోవడం ప్రారంభించండి",
    proClosing: "మీరు ఇక్కడ ఉన్నందుకు మేము సంతోషిస్తున్నాము. Pro అందించే ప్రతిదాన్ని అన్వేషించండి!",
    cancelTitle: "మీరు వెళ్ళడం చూసి బాధగా ఉంది 😢",
    cancelSubtitle: "మీ సబ్‌స్క్రిప్షన్ ముగిసింది",
    cancelGreeting: "మీ Pro యాక్సెస్ ముగిసింది",
    cancelBody: "మీ AI Educademy Pro సబ్‌స్క్రిప్షన్ రద్దు చేయబడింది. మీకు ఇప్పటికీ అన్ని ఉచిత ప్రోగ్రామ్‌లు మరియు ప్రీమియం ప్రోగ్రామ్‌ల మొదటి లెసన్‌కు యాక్సెస్ ఉంది.",
    cancelCta: "మళ్ళీ సబ్‌స్క్రైబ్ చేయండి",
    cancelClosing: "మిమ్మల్ని మళ్ళీ చూడాలని ఆశిస్తున్నాము! మా ఉచిత కంటెంట్ ఎల్లప్పుడూ అందుబాటులో ఉంటుంది.",
    planLabel: "ప్లాన్",
    monthly: "Pro నెలవారీ (£3.99/నెల)",
    annual: "Pro వార్షిక (£29.99/సం.)",
    lifetime: "లైఫ్‌టైమ్ యాక్సెస్ (£49.99)",
  },
};

export function subscriptionEmailHtml(
  email: string,
  type: "activated" | "cancelled",
  plan: string = "monthly",
  locale: string = "en"
): string {
  const s = subscriptionStrings[locale] || subscriptionStrings.en;
  const isActivated = type === "activated";
  const planLabel = s[plan as keyof typeof s] || plan;
  const title = isActivated ? s.proTitle : s.cancelTitle;
  const subtitle = isActivated ? s.proSubtitle : s.cancelSubtitle;
  const greeting = isActivated ? s.proGreeting : s.cancelGreeting;
  const body = isActivated ? s.proBody : s.cancelBody;
  const cta = isActivated ? s.proCta : s.cancelCta;
  const ctaUrl = isActivated ? "https://aieducademy.org/programs" : "https://aieducademy.org/pricing";
  const closing = isActivated ? s.proClosing : s.cancelClosing;
  const gradientFrom = isActivated ? "#10b981" : "#6366f1";
  const gradientTo = isActivated ? "#059669" : "#4f46e5";
  const ctaColor = isActivated ? "#10b981" : "#6366f1";
  const emoji = isActivated ? "🚀" : "👋";

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333;">
  <table cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f9fafb;">
    <tr>
      <td style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🎓 AI Educademy</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">${subtitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px;">${greeting} ${emoji}</h2>
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">${body}</p>
              <table cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px; background-color: #f3f4f6; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">${s.planLabel}</p>
                    <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 18px; font-weight: 700;">${planLabel}</p>
                  </td>
                </tr>
              </table>${isActivated ? `
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; font-weight: 600;">${s.proFeatures}</p>
              <table cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
                <tr><td style="padding: 8px 0; color: #4b5563; font-size: 15px;">✅ ${s.feature1}</td></tr>
                <tr><td style="padding: 8px 0; color: #4b5563; font-size: 15px;">✅ ${s.feature2}</td></tr>
                <tr><td style="padding: 8px 0; color: #4b5563; font-size: 15px;">✅ ${s.feature3}</td></tr>
              </table>` : ""}
              <table cellpadding="0" cellspacing="0" style="margin: 24px auto;">
                <tr>
                  <td style="background-color: ${ctaColor}; border-radius: 8px; padding: 14px 32px; text-align: center;">
                    <a href="${ctaUrl}" style="color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px;">${cta}</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">${closing}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; border-top: 1px solid #e5e7eb; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5; text-align: center;">
                AI Educademy &bull; <a href="https://aieducademy.org" style="color: #667eea; text-decoration: none;">aieducademy.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function welcomeEmailHtml(email: string, locale: string = "en", name?: string): string {
  const s = emailStrings[locale] || emailStrings.en;
  const displayName = name || email;
  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${s.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333;">
  <table cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f9fafb;">
    <tr>
      <td style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🎓 AI Educademy</h1>
              <p style="margin: 8px 0 0 0; color: #e9d8ff; font-size: 14px;">${s.subtitle}</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px;">${s.greeting}, ${displayName}! 👋</h2>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${s.body}
              </p>

              <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${s.explore}
              </p>

              <!-- CTA Buttons -->
              <table cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 0 8px 16px 0; width: 33.33%;">
                    <table cellpadding="0" cellspacing="0" style="width: 100%; background-color: #667eea; border-radius: 6px;">
                      <tr>
                        <td style="padding: 12px; text-align: center;">
                          <a href="https://aieducademy.org/programs" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">${s.browsePrograms}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding: 0 8px 16px 0; width: 33.33%;">
                    <table cellpadding="0" cellspacing="0" style="width: 100%; background-color: #764ba2; border-radius: 6px;">
                      <tr>
                        <td style="padding: 12px; text-align: center;">
                          <a href="https://aieducademy.org/lab" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">${s.tryLab}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding: 0; width: 33.34%;">
                    <table cellpadding="0" cellspacing="0" style="width: 100%; background-color: #5a67d8; border-radius: 6px;">
                      <tr>
                        <td style="padding: 12px; text-align: center;">
                          <a href="https://github.com/ai-educademy" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">${s.joinGithub}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${s.closing}
              </p>

              <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${s.regards}<br>
                <strong>${s.team}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; border-top: 1px solid #e5e7eb; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5; text-align: center;">
                ${s.footer}<br>
                <a href="https://aieducademy.org" style="color: #667eea; text-decoration: none;">${s.unsubscribe}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/* ─────────────── Verification Code Email ─────────────── */

export function verificationCodeEmailHtml(code: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding:30px 30px 0;text-align:center;">
              <h1 style="margin:0 0 8px;color:#111827;font-size:24px;">Verify your email</h1>
              <p style="margin:0 0 24px;color:#6b7280;font-size:16px;">Enter the code below to verify your AI Educademy account.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px;text-align:center;">
              <div style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;margin:0 0 24px;">
                <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#ffffff;font-family:monospace;">${code}</span>
              </div>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">This code expires in 1 hour.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 30px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">If you didn't create an account, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px;border-top:1px solid #e5e7eb;background-color:#f9fafb;border-radius:0 0 8px 8px;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-align:center;">AI Educademy · <a href="https://aieducademy.org" style="color:#667eea;text-decoration:none;">aieducademy.org</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/* ─────────────── Lead Magnet Email ─────────────── */

export function leadMagnetEmailHtml(name: string, downloadUrl: string): string {
  const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding:30px 30px 0;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:8px 8px 0 0;">
              <h1 style="margin:0 0 8px;color:#ffffff;font-size:24px;">Your AI Starter Kit is Ready! 🚀</h1>
              <p style="margin:0 0 24px;color:rgba(255,255,255,0.9);font-size:16px;">The 2026 AI Starter Kit — by AI Educademy</p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">Hi ${safeName},</p>
              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">Thank you for downloading <strong>The 2026 AI Starter Kit</strong>! This guide is packed with everything you need to kickstart your AI journey.</p>
              <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">Inside you'll find:</p>
              <ul style="margin:0 0 24px;padding-left:20px;color:#6b7280;font-size:14px;line-height:1.8;">
                <li>AI Learning Roadmap (beginner → expert)</li>
                <li>Top 10 AI Concepts explained simply</li>
                <li>Career Paths & Salary Guide</li>
                <li>Essential AI Tools & Resources</li>
                <li>Interview Prep Quick Reference</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 30px;text-align:center;">
              <a href="${downloadUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">Download Your PDF</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 24px;">
              <div style="background-color:#f8fafc;border-radius:8px;padding:20px;border:1px solid #e5e7eb;">
                <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">Ready to go deeper?</p>
                <p style="margin:0 0 12px;color:#6b7280;font-size:14px;line-height:1.6;">AI Educademy offers free interactive lessons across 15 programs in 11 languages.</p>
                <a href="https://aieducademy.org/en/programs" style="color:#667eea;font-size:14px;font-weight:600;text-decoration:none;">Start Learning →</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px;border-top:1px solid #e5e7eb;background-color:#f9fafb;border-radius:0 0 8px 8px;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-align:center;">AI Educademy · <a href="https://aieducademy.org" style="color:#667eea;text-decoration:none;">aieducademy.org</a></p>
              <p style="margin:0;color:#9ca3af;font-size:11px;text-align:center;">You received this email because you requested the AI Starter Kit. <a href="https://aieducademy.org" style="color:#9ca3af;">Unsubscribe</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/* ─────────────── Password Reset Email ─────────────── */

export function abandonedCartEmailHtml(name: string | undefined, pricingUrl: string): string {
  const safeName = name ? name.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "there";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding:30px 30px 0;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:8px 8px 0 0;">
              <h1 style="margin:0 0 8px;color:#ffffff;font-size:24px;">You left something behind! 🛒</h1>
              <p style="margin:0 0 24px;color:rgba(255,255,255,0.9);font-size:16px;">Your AI learning journey is waiting</p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">Hi ${safeName},</p>
              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">Still thinking about it? We noticed you started checking out but didn't finish. No worries — your spot is still available!</p>
              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">With AI Educademy Pro you get access to <strong>all programs</strong>, <strong>learning tracks</strong>, <strong>AI Mock Interviews</strong>, <strong>certificates</strong>, and more.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 24px;">
              <div style="background-color:#fef3c7;border-radius:8px;padding:16px 20px;border:1px solid #fbbf24;">
                <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;text-align:center;">🎉 Use code <strong style="font-size:16px;">PH50</strong> for 50% off — limited to first 50 learners!</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 30px;text-align:center;">
              <a href="${pricingUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">Complete Your Purchase</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 24px;">
              <div style="background-color:#f8fafc;border-radius:8px;padding:20px;border:1px solid #e5e7eb;">
                <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">What you'll unlock with Pro:</p>
                <ul style="margin:0;padding-left:20px;color:#6b7280;font-size:14px;line-height:1.8;">
                  <li>All programs &amp; learning tracks</li>
                  <li>Career Ready interview prep track</li>
                  <li>AI Mock Interview lab</li>
                  <li>Completion certificates</li>
                  <li>Server-side progress sync across devices</li>
                </ul>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px;border-top:1px solid #e5e7eb;background-color:#f9fafb;border-radius:0 0 8px 8px;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-align:center;">AI Educademy · <a href="https://aieducademy.org" style="color:#667eea;text-decoration:none;">aieducademy.org</a></p>
              <p style="margin:0;color:#9ca3af;font-size:11px;text-align:center;">You received this email because you started a checkout on AI Educademy. <a href="https://aieducademy.org" style="color:#9ca3af;">Unsubscribe</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/* ─────────────── Password Reset Email ─────────────── */

export function passwordResetEmailHtml(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding:30px 30px 0;text-align:center;">
              <h1 style="margin:0 0 8px;color:#111827;font-size:24px;">Reset your password</h1>
              <p style="margin:0 0 24px;color:#6b7280;font-size:16px;">Click the button below to reset your AI Educademy password.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px;text-align:center;">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">Reset Password</a>
              <p style="margin:16px 0 24px;color:#6b7280;font-size:14px;">This link expires in 1 hour.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 30px;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;">If the button doesn't work, copy and paste this link:</p>
              <p style="margin:0;color:#667eea;font-size:12px;word-break:break-all;">${resetUrl}</p>
              <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">If you didn't request a password reset, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px;border-top:1px solid #e5e7eb;background-color:#f9fafb;border-radius:0 0 8px 8px;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-align:center;">AI Educademy · <a href="https://aieducademy.org" style="color:#667eea;text-decoration:none;">aieducademy.org</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
