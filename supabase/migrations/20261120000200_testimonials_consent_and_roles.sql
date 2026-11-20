alter table public.testimonials
  add column if not exists consent_at timestamptz;

grant insert (type, name, role, organization, message, consent_at) on public.testimonials to anon, authenticated;

drop policy if exists testimonials_public_insert on public.testimonials;
create policy testimonials_public_insert on public.testimonials
  for insert to anon, authenticated
  with check (is_published = false and consent_at is not null);
