import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseSession = vi.fn();
const mockUseProStatus = vi.fn();

vi.mock("next-auth/react", () => ({ useSession: () => mockUseSession() }));
vi.mock("@/hooks/useProStatus", () => ({ useProStatus: () => mockUseProStatus() }));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) =>
    values ? `${key} ${JSON.stringify(values)}` : key,
}));

import { PricingCards } from "@/app/[locale]/pricing/PricingCards";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockUseSession.mockReturnValue({ data: { user: { id: "user_1", email: "learner@example.com" } } });
  mockUseProStatus.mockReturnValue({ isPro: false, loading: false });
  fetchMock.mockResolvedValue({
    json: () => Promise.resolve({ url: "https://checkout.stripe.test/session", promoApplied: true }),
  });
  vi.stubGlobal("fetch", fetchMock);
});

describe("PricingCards", () => {
  it("given the annual plan is selected, when checkout starts, then the API receives annual with the locale", async () => {
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ error: "checkout unavailable" }),
    });
    const user = userEvent.setup();
    render(<PricingCards locale="fr" />);

    await user.click(screen.getByRole("radio", { name: /annual.title/ }));
    await user.click(screen.getByRole("button", { name: /annual.cta/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      plan: "annual",
      locale: "fr",
    });
  });

  it("given the lifetime plan is selected, when checkout starts, then the API receives lifetime", async () => {
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ error: "checkout unavailable" }),
    });
    const user = userEvent.setup();
    render(<PricingCards locale="en" />);

    await user.click(screen.getByRole("radio", { name: /lifetime.title/ }));
    await user.click(screen.getByRole("button", { name: /lifetime.cta/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ plan: "lifetime" });
  });

  it("given Stripe ignores a promo code, when checkout returns a URL, then the UI does not redirect to full price", async () => {
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ url: "#checkout", promoApplied: false }),
    });
    const startHref = window.location.href;
    const user = userEvent.setup();
    render(<PricingCards locale="en" />);

    await user.click(screen.getByRole("button", { name: "promoCode" }));
    await user.type(screen.getByLabelText("promoCode"), "NOPE");
    await user.click(screen.getByRole("button", { name: /monthly.cta/ }));

    expect(await screen.findByText("promoCodeInvalid")).toBeInTheDocument();
    expect(window.location.href).toBe(startHref);
  });

  it("given the viewer already has premium access, when the page renders, then checkout is not offered", () => {
    mockUseProStatus.mockReturnValue({ isPro: true, loading: false });

    render(<PricingCards locale="en" />);

    expect(screen.getByText("alreadyPro")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /monthly.cta/ })).not.toBeInTheDocument();
  });
});

/**
 * A plan whose Stripe price ID is missing cannot be bought. Showing it anyway
 * walks a customer who has already decided to pay into a dead end, which is
 * the most expensive moment possible to fail.
 */
describe("PricingCards plan availability", () => {
  it("given only monthly can be sold, when the page renders, then annual and lifetime are not offered", () => {
    render(<PricingCards locale="en" purchasablePlans={["monthly"]} />);

    expect(screen.getByRole("radio", { name: /monthly.title/ })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: /annual.title/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: /lifetime.title/ })).not.toBeInTheDocument();
  });

  it("given monthly cannot be sold, when the page renders, then the first sellable plan is preselected", () => {
    render(<PricingCards locale="en" purchasablePlans={["annual", "lifetime"]} />);

    expect(screen.getByRole("radio", { name: /annual.title/ })).toBeChecked();
    expect(screen.getByRole("button", { name: /annual.cta/ })).toBeInTheDocument();
  });

  it("given no explicit availability, when the page renders, then all three plans are offered", () => {
    render(<PricingCards locale="en" />);

    expect(screen.getByRole("radio", { name: /monthly.title/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /annual.title/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /lifetime.title/ })).toBeInTheDocument();
  });
});
