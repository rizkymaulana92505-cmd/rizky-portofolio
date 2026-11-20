import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Loader2, Save } from 'lucide-react';
import Field from '@/components/ui/Field';
import Switch from '@/components/ui/Switch';
import {
  optionsOf, rowToValues, slugify, snapshot, validateValues, valuesToRow,
} from '@/lib/admin/formModel';
import { findStaleImages, uploadPendingImages } from '@/services/admin/images';
import { removeImages } from '@/services/admin/storage';
import ImageField from './ImageField';
import Repeater from './Repeater';
import { useToast } from './Toast';
import TagsInput from './TagsInput';

const FULL_TYPES = ['textarea', 'repeater', 'tags', 'lines', 'section', 'switch', 'image'];

/**
 * Form generik berbasis definisi field. Tidak tahu tabel/backend:
 * hasil submit dikirim lewat `onSubmit(row)` (Promise); error yang dilempar ditampilkan.
 */
export default function ResourceForm({
  fields, initialRow, mode, onSubmit, onCancel, onDirtyChange, toForm, fromForm, imageFolder,
}) {
  const toast = useToast();
  const initialValues = useMemo(
    () => rowToValues(fields, toForm ? toForm(initialRow ?? {}) : initialRow ?? {}),
    [fields, initialRow, toForm],
  );
  const initialSnap = useMemo(() => snapshot(initialValues), [initialValues]);

  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null); // { message, field }
  const formRef = useRef(null);
  // Slug otomatis hanya saat membuat baru; slug yang sudah ada tidak ikut berubah (URL publik).
  const slugTouched = useRef(Object.fromEntries(fields.filter((f) => f.type === 'slug').map((f) => [f.name, mode === 'edit'])));

  const errors = useMemo(() => validateValues(fields, values), [fields, values]);
  const dirty = snapshot(values) !== initialSnap;
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);

  const touch = (name) => setTouched((t) => (t[name] ? t : { ...t, [name]: true }));
  const shown = (name) => (serverError?.field === name ? serverError.message : touched[name] ? errors[name] : undefined);

  const change = (name, value) => {
    if (serverError?.field === name) setServerError(null);
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      fields.forEach((f) => {
        if (f.type === 'slug' && f.from === name && !slugTouched.current[f.name]) next[f.name] = slugify(value);
      });
      return next;
    });
  };

  const focusField = (name) => requestAnimationFrame(() => formRef.current?.querySelector(`[data-field="${name}"]`)?.focus());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setTouched(Object.fromEntries(fields.map((f) => [f.name, true])));
    const first = fields.find((f) => errors[f.name]);
    if (first) { focusField(first.name); return; }

    setSubmitting(true);
    setServerError(null);
    let uploaded = [];
    let after = values;
    let saved = false;
    try {
      // 1) unggah gambar baru  2) simpan ke database  3) hapus gambar lama yang tak terpakai
      const up = await uploadPendingImages(fields, values, imageFolder);
      uploaded = up.uploaded;
      after = up.values;
      const row = valuesToRow(fields, after);
      await onSubmit(fromForm ? fromForm(row) : row);
      saved = true;
    } catch (err) {
      // Simpan gagal → buang file yang baru saja diunggah supaya tidak jadi file yatim.
      if (!saved && uploaded.length) await removeImages(uploaded);
      setServerError({ message: err.message || 'Gagal menyimpan data.', field: err.field });
      if (err.field) focusField(err.field);
    }

    if (saved) {
      const stale = findStaleImages(fields, initialValues, after);
      if (stale.length) {
        const { failed } = await removeImages(stale);
        if (failed.length) {
          toast.error(`Data tersimpan, tetapi ${failed.length} gambar lama belum terhapus dari Storage.`);
        }
      }
    }
    setSubmitting(false);
  };

  const renderField = (f) => {
    if (f.showIf && !f.showIf(values)) return null;
    const id = `f-${f.name}`;
    const error = shown(f.name);
    const common = { id, label: f.label, required: f.required, hint: f.hint, error, placeholder: f.placeholder, suffix: f.suffix, 'data-field': f.name };
    const bind = { value: values[f.name], onChange: (e) => change(f.name, e.target.value), onBlur: () => touch(f.name) };
    const counter = f.maxLength && ['text', 'textarea', 'slug', 'url'].includes(f.type)
      ? { current: values[f.name].length, max: f.maxLength } : undefined;

    switch (f.type) {
      case 'section':
        return <h3 className="label border-t border-ink pt-4 text-ink">{f.label}</h3>;
      case 'switch':
        return (
          <div>
            <Switch checked={values[f.name]} onChange={(v) => { change(f.name, v); touch(f.name); }} label={f.label} />
            {f.hint && <p className="mt-2 text-small text-mute">{f.hint}</p>}
            {error && <p className="mt-2 flex items-start gap-1.5 text-small font-medium"><AlertCircle size={15} aria-hidden className="mt-[3px] shrink-0" />{error}</p>}
          </div>
        );
      case 'select': {
        const opts = optionsOf(f, values);
        return (
          <Field {...common} as="select" {...bind}>
            {!f.required && <option value="">— Tidak dipilih —</option>}
            {f.required && !values[f.name] && <option value="">— Pilih —</option>}
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Field>
        );
      }
      case 'textarea':
        return <Field {...common} as="textarea" rows={f.rows ?? 4} counter={counter} {...bind} />;
      case 'lines':
        return <Field {...common} as="textarea" rows={f.rows ?? 4} hint={f.hint ?? 'Satu poin per baris.'} {...bind} />;
      case 'tags':
        return <TagsInput {...common} value={values[f.name]} onChange={(v) => change(f.name, v)} onBlur={() => touch(f.name)} />;
      case 'repeater':
        return (
          <Repeater
            field={f}
            value={values[f.name]}
            errors={shown(f.name)}
            data-field={f.name}
            onChange={(v) => { change(f.name, v); touch(f.name); }}
          />
        );
      case 'image':
        return (
          <ImageField
            {...common}
            bucket={f.bucket}
            disabled={submitting}
            value={values[f.name]}
            onChange={(v) => { change(f.name, v); touch(f.name); }}
          />
        );
      case 'slug':
        return (
          <Field
            {...common}
            counter={counter}
            value={values[f.name]}
            onChange={(e) => { slugTouched.current[f.name] = true; change(f.name, e.target.value); }}
            onBlur={() => touch(f.name)}
            autoComplete="off"
            spellCheck={false}
          />
        );
      case 'number':
        return <Field {...common} type="number" inputMode="numeric" min={f.min} max={f.max} {...bind} />;
      case 'date':
        return <Field {...common} type="date" {...bind} />;
      case 'email':
        return <Field {...common} type="email" inputMode="email" autoComplete="off" {...bind} />;
      case 'url':
        return <Field {...common} type="url" inputMode="url" autoComplete="off" counter={counter} {...bind} />;
      default:
        return <Field {...common} counter={counter} {...bind} />;
    }
  };

  const errorCount = Object.keys(errors).filter((n) => touched[n]).length;

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} aria-label={mode === 'create' ? 'Form tambah data' : 'Form ubah data'}>
      <fieldset disabled={submitting} className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
        {fields.map((f) => {
          const node = renderField(f);
          if (!node) return null;
          const full = f.width === 'full' || FULL_TYPES.includes(f.type);
          return <div key={f.name} className={full ? 'sm:col-span-2' : undefined}>{node}</div>;
        })}
      </fieldset>

      <p className="sr-only" role="alert" aria-live="assertive">
        {errorCount > 0 ? `Ada ${errorCount} isian yang perlu diperbaiki.` : ''}
      </p>

      {serverError && (
        <p role="alert" className="mt-8 flex items-start gap-2 border border-ink p-4 text-small font-medium">
          <AlertCircle size={16} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
          {serverError.message}
        </p>
      )}

      <div className="sticky bottom-0 -mx-5 mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-ink bg-paper px-5 py-4 sm:-mx-8 sm:px-8">
        <p className="label text-ink">{dirty ? 'Ada perubahan belum disimpan' : mode === 'create' ? 'Data baru' : 'Tidak ada perubahan'}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} disabled={submitting} className="h-11 border border-ink px-5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors hover:bg-fog disabled:opacity-50">
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="inline-flex h-11 items-center gap-2 border border-ink bg-ink px-6 font-mono text-[11px] uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-70"
          >
            {submitting ? <Loader2 size={14} aria-hidden className="animate-spin" /> : <Save size={14} strokeWidth={1.75} aria-hidden />}
            {submitting ? 'Menyimpan…' : mode === 'create' ? 'Simpan data' : 'Simpan perubahan'}
          </button>
        </div>
      </div>
    </form>
  );
}
