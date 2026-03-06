import { Resend } from "resend";

const AUDIENCE_NAME = "Open AI School Newsletter";

let cachedAudienceId: string | null = null;

async function getResend(): Promise<Resend | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

async function getOrCreateAudienceId(resend: Resend): Promise<string> {
  if (cachedAudienceId) return cachedAudienceId;

  const { data: audiences } = await resend.audiences.list();
  const existing = audiences?.data?.find(
    (a) => a.name === AUDIENCE_NAME
  );

  if (existing) {
    cachedAudienceId = existing.id;
    return existing.id;
  }

  const { data: created } = await resend.audiences.create({
    name: AUDIENCE_NAME,
  });

  cachedAudienceId = created!.id;
  return cachedAudienceId;
}

export async function addContact(
  email: string
): Promise<"added" | "duplicate" | "fallback"> {
  const resend = await getResend();
  if (!resend) {
    console.log(`[Contacts] No RESEND_API_KEY. Subscriber ${email} not persisted.`);
    return "fallback";
  }

  try {
    const audienceId = await getOrCreateAudienceId(resend);

    const { error } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });

    if (error) {
      if (error.message?.includes("already exists")) {
        return "duplicate";
      }
      console.error("[Contacts] Error adding contact:", error);
      throw error;
    }

    console.log(`[Contacts] Added ${email} to audience`);
    return "added";
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("already exists")) return "duplicate";
    throw err;
  }
}

export async function getContacts(): Promise<
  { email: string; createdAt: string }[]
> {
  const resend = await getResend();
  if (!resend) return [];

  try {
    const audienceId = await getOrCreateAudienceId(resend);
    const { data } = await resend.contacts.list({ audienceId });

    return (
      data?.data?.map((c) => ({
        email: c.email,
        createdAt: c.created_at,
      })) ?? []
    );
  } catch (err) {
    console.error("[Contacts] Error listing contacts:", err);
    return [];
  }
}
