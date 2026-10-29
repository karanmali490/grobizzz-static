-- Run in Supabase SQL Editor
create table if not exists public.profile_events (
  id bigserial primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  slug text,
  event_type text not null check (event_type in ('view','call','whatsapp','maps','share')),
  created_at timestamptz default now()
);

create index if not exists profile_events_business_idx on public.profile_events (business_id, created_at desc);
create index if not exists profile_events_slug_idx on public.profile_events (slug, event_type);

alter table public.profile_events enable row level security;

-- Anyone can insert analytics (public profile clicks)
drop policy if exists "public insert events" on public.profile_events;
create policy "public insert events" on public.profile_events
  for insert to anon, authenticated with check (true);

-- Owners can read events for their businesses
drop policy if exists "owners read events" on public.profile_events;
create policy "owners read events" on public.profile_events
  for select to authenticated
  using (
    business_id in (select id from public.businesses where user_id = auth.uid())
  );
