/**
 * Filters addresses that should never receive bulk mail.
 *
 * Bounces are not free. Mailbox providers score a sender on them, so a handful
 * of undeliverable addresses in a campaign measurably degrades inbox placement
 * for everyone else on the list. The cheapest fix is not to send.
 *
 * It excludes addresses that cannot receive mail by definition, plus throwaway
 * inboxes on the community disposable-email-domains blocklist (refresh with
 * scripts/refresh-disposable-domains.mjs). It deliberately does not guess
 * beyond that list: a small or regional domain looks exactly like a fake one,
 * and wrongly dropping a real subscriber is a worse error than one bounce.
 */

import disposableDomains from "@/lib/disposable-domains.json";

const DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set(disposableDomains);

/**
 * Reserved by RFC 2606 and RFC 6761 for documentation and testing. These are
 * guaranteed never to resolve.
 */
const RESERVED_TLDS = new Set(["test", "invalid", "localhost", "example", "local"]);

/**
 * Not reserved by an RFC, but not mailbox providers either.
 *
 * `test.com` is a parked domain that people type when they want a signup to go
 * through without giving a real address. `resend.app` is the mail provider's
 * own sandbox domain, used by its preview addresses.
 */
const NON_DELIVERABLE_DOMAINS = new Set(["test.com", "example.com", "example.net", "example.org"]);
const NON_DELIVERABLE_SUFFIXES = [".resend.app"];

/** True when the address cannot receive mail and must be excluded from a send. */
export function isUndeliverableAddress(email: string | null | undefined): boolean {
  if (!email) return true;

  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return true;

  const domain = trimmed.slice(at + 1);
  if (!domain.includes(".")) return true;
  if (NON_DELIVERABLE_DOMAINS.has(domain)) return true;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;

  const tld = domain.slice(domain.lastIndexOf(".") + 1);
  if (RESERVED_TLDS.has(tld)) return true;

  if (domain === "resend.app") return true;
  return NON_DELIVERABLE_SUFFIXES.some((suffix) => domain.endsWith(suffix));
}
