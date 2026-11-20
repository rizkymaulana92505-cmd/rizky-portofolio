-- Testimoni dari pengunjung masuk sebagai draf (is_published = false).
-- Publik hanya boleh mengisi kolom isian; admin yang meninjau dan menerbitkan.

grant insert (type, name, role, organization, message) on public.testimonials to anon;

create policy testimonials_public_insert on public.testimonials
  for insert to anon
  with check (is_published = false);

alter table public.testimonials
  add constraint testimonials_role_len check (role is null or char_length(btrim(role)) between 1 and 120),
  add constraint testimonials_organization_len check (organization is null or char_length(btrim(organization)) between 1 and 120);
