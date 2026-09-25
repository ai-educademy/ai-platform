import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  primaryKey,
  uniqueIndex,
  unique,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/* ─────────────── Auth Tables (next-auth / Drizzle adapter) ─────────────── */

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: text("role", { enum: ["free", "pro", "admin"] })
    .notNull()
    .default("free"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  password: text("password"),
  referralCode: text("referral_code").unique(),
  /** Preferred language, used to pick the language of outbound email. */
  locale: text("locale").notNull().default("en"),
  /**
   * Set when the user opts out of product marketing. Transactional mail
   * (receipts, password resets, verification) is unaffected and must still
   * send: opting out of marketing is not the same as closing the account.
   */
  marketingOptOutAt: timestamp("marketing_opt_out_at", { mode: "date" }),
  /**
   * Unguessable token for one-click unsubscribe links. Kept separate from the
   * user id so an unsubscribe URL cannot be used to enumerate or act on
   * accounts.
   */
  unsubscribeToken: text("unsubscribe_token").unique(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

/* ─────────────── Subscription Tables ─────────────── */

export const subscriptions = pgTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  plan: text("plan", { enum: ["monthly", "annual", "lifetime"] }).notNull(),
  status: text("status", {
    enum: ["active", "cancelled", "past_due", "trialing", "incomplete"],
  })
    .notNull()
    .default("active"),
  currentPeriodStart: timestamp("current_period_start", { mode: "date" }),
  currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

/* ─────────────── Progress Tracking ─────────────── */

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonSlug: text("lesson_slug").notNull(),
    programSlug: text("program_slug").notNull(),
    locale: text("locale").notNull().default("en"),
    completedAt: timestamp("completed_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (lp) => [
    uniqueIndex("lesson_progress_unique").on(
      lp.userId,
      lp.lessonSlug,
      lp.programSlug,
    ),
  ],
);

/* ─────────────── Referral System ─────────────── */

export const referrals = pgTable(
  "referrals",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    referrerUserId: text("referrer_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    refereeUserId: text("referee_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    referralCode: text("referral_code").notNull(),
    refereeEmail: text("referee_email"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeInvoiceId: text("stripe_invoice_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    refereePaymentFingerprint: text("referee_payment_fingerprint"),
    rewardStripeBalanceTransactionId: text(
      "reward_stripe_balance_transaction_id",
    ),
    abuseReason: text("abuse_reason"),
    status: text("status", {
      enum: ["pending", "signed_up", "completed_lesson", "rewarded", "blocked"],
    })
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { mode: "date" }),
    rewardedAt: timestamp("rewarded_at", { mode: "date" }),
  },
  (referral) => [
    uniqueIndex("referrals_referee_user_id_unique").on(referral.refereeUserId),
    uniqueIndex("referrals_stripe_invoice_id_unique").on(
      referral.stripeInvoiceId,
    ),
    uniqueIndex("referrals_reward_balance_tx_unique").on(
      referral.rewardStripeBalanceTransactionId,
    ),
  ],
);

/* ─────────────── Newsletter Subscribers ─────────────── */

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  locale: text("locale").default("en"),
  subscribedAt: timestamp("subscribed_at", { mode: "date" }).defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at", { mode: "date" }),
});

/* ─────────────── Lesson Feedback ─────────────── */

export const lessonFeedback = pgTable("lesson_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonSlug: text("lesson_slug").notNull(),
  programSlug: text("program_slug").notNull(),
  rating: text("rating", { enum: ["up", "down"] }).notNull(),
  comment: text("comment"),
  locale: text("locale").default("en"),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

/* ─────────────── Lesson Comments / Discussion ─────────────── */

export const lessonComments = pgTable("lesson_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lessonSlug: text("lesson_slug").notNull(),
  programSlug: text("program_slug").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

/* ─────────────── Contact Submissions ─────────────── */

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status", {
    enum: ["new", "read", "replied", "archived"],
  }).default("new"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

/* ─────────────── User Streaks ─────────────── */

export const userStreaks = pgTable("user_streaks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: text("last_activity_date").notNull(), // ISO date YYYY-MM-DD
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ─────────────── Playground Scores ─────────────── */

export const playgroundScores = pgTable(
  "playground_scores",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameId: text("game_id").notNull(),
    bestScore: integer("best_score").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.userId, table.gameId)],
);

/* ─────────────── Lesson Bookmarks / Favorites ─────────────── */

export const lessonBookmarks = pgTable(
  "lesson_bookmarks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    programSlug: text("program_slug").notNull(),
    lessonSlug: text("lesson_slug").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.userId, table.programSlug, table.lessonSlug)],
);

/* ─────────────── Marketing Campaigns ─────────────── */

/**
 * One row per (campaign, recipient) actually sent.
 *
 * The unique constraint is the idempotency guarantee: a campaign run can be
 * retried, resumed after a crash, or accidentally triggered twice without
 * emailing anybody a second time. Without it a partial failure halfway through
 * a send leaves no safe way to finish the job.
 */
export const campaignSends = pgTable(
  "campaign_sends",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaign: text("campaign").notNull(),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    email: text("email").notNull(),
    locale: text("locale").notNull().default("en"),
    sentAt: timestamp("sent_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.campaign, table.email)],
);

/* ─────────────── First-party Funnel Analytics ─────────────── */

export const funnelEvents = pgTable(
  "funnel_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    event: text("event").notNull(),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    anonId: text("anon_id").notNull(),
    locale: text("locale"),
    path: text("path"),
    programSlug: text("program_slug"),
    lessonSlug: text("lesson_slug"),
    plan: text("plan"),
    country: text("country"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("funnel_events_created_at_idx").on(table.createdAt),
    index("funnel_events_event_created_at_idx").on(
      table.event,
      table.createdAt,
    ),
    index("funnel_events_anon_id_idx").on(table.anonId),
    index("funnel_events_user_id_idx").on(table.userId),
  ],
);
