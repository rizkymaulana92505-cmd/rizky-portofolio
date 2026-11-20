import { testimonialTypes } from '@/data';

export const LIMITS = {
  name: { min: 2, max: 120 },
  role: { max: 120 },
  organization: { max: 120 },
  message: { min: 10, max: 2000 },
};

export const FIELD_ORDER = ['type', 'name', 'role', 'organization', 'message', 'consent'];

export const emptyDraft = {
  type: '', name: '', role: '', organization: '', message: '', consent: false,
};

const clean = (v) => (typeof v === 'string' ? v.trim() : '');

export function validateField(field, rawValue) {
  if (field === 'consent') {
    return rawValue ? undefined : 'Berikan izin agar testimoni dapat ditinjau dan ditampilkan.';
  }
  const value = clean(rawValue);

  switch (field) {
    case 'type':
      if (!value) return 'Pilih jenis testimoni.';
      if (!testimonialTypes.some((t) => t.key === value)) return 'Jenis testimoni tidak dikenal.';
      return undefined;
    case 'name':
      if (!value) return 'Nama wajib diisi.';
      if (value.length < LIMITS.name.min) return `Nama minimal ${LIMITS.name.min} karakter.`;
      if (value.length > LIMITS.name.max) return `Nama maksimal ${LIMITS.name.max} karakter.`;
      return undefined;
    case 'role':
      if (value.length > LIMITS.role.max) return `Peran maksimal ${LIMITS.role.max} karakter.`;
      return undefined;
    case 'organization':
      if (value.length > LIMITS.organization.max) return `Instansi maksimal ${LIMITS.organization.max} karakter.`;
      return undefined;
    case 'message':
      if (!value) return 'Isi testimoni wajib diisi.';
      if (value.length < LIMITS.message.min) {
        return `Isi testimoni minimal ${LIMITS.message.min} karakter (baru ${value.length}).`;
      }
      if (value.length > LIMITS.message.max) return `Isi testimoni maksimal ${LIMITS.message.max} karakter.`;
      return undefined;
    default:
      return undefined;
  }
}

export function validateDraft(draft) {
  const errors = {};
  FIELD_ORDER.forEach((field) => {
    const error = validateField(field, draft[field]);
    if (error) errors[field] = error;
  });
  return errors;
}

export function normalizeDraft(draft) {
  return {
    type: clean(draft.type),
    name: clean(draft.name),
    role: clean(draft.role),
    organization: clean(draft.organization),
    message: clean(draft.message),
    consent: Boolean(draft.consent),
  };
}
