-- QPort landing page: demo request capture
-- Create this table in your Postgres database (recommended: Neon via Vercel integration).

create table if not exists demo_requests (
  id bigserial primary key,
  created_at timestamptz not null default now(),

  name text not null,
  company text not null,
  role text not null,
  email text not null,

  page_url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,

  ip text,
  user_agent text,

  honeypot text,
  suspicious boolean not null default false,

  resend_team_id text,
  resend_lead_id text,
  email_team_sent boolean not null default false,
  email_lead_sent boolean not null default false,
  email_team_error text,
  email_lead_error text
);

create index if not exists demo_requests_created_at_idx on demo_requests (created_at desc);
