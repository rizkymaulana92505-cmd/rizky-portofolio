import { BUCKETS, resolveImageUrl, table, unwrap } from './core';

const clean = (value) => (typeof value === 'string' ? value.trim() : '');
const optional = (value) => clean(value) || null;

/** Bentuk sama dengan src/data/testimonials.js. */
export async function submitTestimonial(draft) {
  const { type, name, role, organization, message, consent } = draft;
  unwrap(await table('testimonials').insert({
    type: clean(type),
    name: clean(name),
    role: optional(role),
    organization: optional(organization),
    message: clean(message),
    consent_at: consent ? new Date().toISOString() : null,
  }));
  return { simulated: false };
}

export async function getTestimonials() {
  const rows = unwrap(
    await table('testimonials')
      .select('id, type, name, role, organization, message, photo_path')
      .eq('is_published', true)
      .order('type')
      .order('sort_order')
      .order('created_at', { ascending: false }),
  );
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    name: r.name,
    role: r.role,
    organization: r.organization,
    message: r.message,
    photo: resolveImageUrl(BUCKETS.testimonial, r.photo_path),
    placeholder: false,
  }));
}
