import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

interface AffiliateLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  /** Shows a small external-link icon after the label. Defaults to true. */
  showIcon?: boolean;
  "aria-label"?: string;
}

/**
 * An outbound link to a partner or affiliate.
 *
 * Always opens in a new tab and carries `rel="sponsored nofollow noopener
 * noreferrer"`: `sponsored` and `nofollow` are required by search engines for
 * paid or affiliate links, and `noopener noreferrer` closes the reverse-tabnabbing
 * hole that `target="_blank"` otherwise opens. Use this for every monetised
 * outbound link so compliance is handled in one place.
 */
export function AffiliateLink({
  href,
  children,
  className,
  showIcon = true,
  "aria-label": ariaLabel,
}: AffiliateLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
    >
      {children}
      {showIcon && (
        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
      )}
    </a>
  );
}

export default AffiliateLink;
