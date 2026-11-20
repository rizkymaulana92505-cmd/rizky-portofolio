import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, Loader2, RotateCcw, Send } from 'lucide-react';
import { testimonialTypes } from '@/data';
import { cn } from '@/lib/cn';
import { describePublicError } from '@/lib/publicError';
import {
  FIELD_ORDER, LIMITS, emptyDraft, normalizeDraft, validateDraft,
} from '@/lib/testimonials';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';

function SuccessPanel({ simulated, onReset, onClose }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div ref={ref} tabIndex={-1} role="status" className="border border-ink p-6 outline-none sm:p-8">
      <span className="flex h-12 w-12 items-center justify-center bg-ink text-paper">
        <Check size={22} strokeWidth={2} aria-hidden />
      </span>
      <h3 className="mt-6 font-display text-xl font-extrabold uppercase tracking-tight">
        {simulated ? 'Testimoni tercatat sementara' : 'Testimoni terkirim'}
      </h3>
      <p className="mt-3 max-w-xl text-ink-soft">
        {simulated ? (
          'Mode simulasi: isianmu belum dikirim ke server dan hanya tampil di browser ini. Aktifkan Supabase untuk menerima testimoni pengunjung.'
        ) : (
          'Terima kasih. Testimoni masuk sebagai draf dan akan ditinjau pemilik portofolio sebelum ditampilkan di halaman ini.'
        )}
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw size={14} strokeWidth={1.75} aria-hidden />
          Tulis lagi
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>Tutup</Button>
      </div>
    </div>
  );
}

export default function TestimonialForm({ onSubmit, simulated = false, onClose, className, bare = false }) {
  const [values, setValues] = useState(emptyDraft);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef(null);

  const errors = useMemo(() => validateDraft(values), [values]);
  const shown = (field) => (touched[field] ? errors[field] : undefined);
  const submitting = status === 'submitting';

  const touch = (field) => setTouched((t) => (t[field] ? t : { ...t, [field]: true }));
  const setValue = (field, value) => setValues((v) => ({ ...v, [field]: value }));
  const bind = (field) => ({
    value: values[field],
    onChange: (e) => setValue(field, e.target.value),
    onBlur: () => touch(field),
    'data-field': field,
  });

  const focusField = (field) => {
    requestAnimationFrame(() => formRef.current?.querySelector(`[data-field="${field}"]`)?.focus());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setTouched(Object.fromEntries(FIELD_ORDER.map((f) => [f, true])));
    const firstInvalid = FIELD_ORDER.find((f) => errors[f]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    setStatus('submitting');
    setErrorMessage('');
    try {
      const next = await onSubmit(normalizeDraft(values));
      setResult(next);
      setStatus('success');
    } catch (err) {
      setErrorMessage(describePublicError(err));
      setStatus('error');
    }
  };

  const reset = () => {
    setValues(emptyDraft);
    setTouched({});
    setResult(null);
    setErrorMessage('');
    setStatus('idle');
    focusField('type');
  };

  const errorCount = Object.keys(errors).filter((f) => touched[f]).length;
  const simulatedResult = result ? result.simulated !== false : simulated;

  return (
    <div className={cn(!bare && 'border border-ink bg-paper p-6 sm:p-8', className)}>
      {status === 'success' ? (
        <SuccessPanel simulated={simulatedResult} onReset={reset} onClose={onClose} />
      ) : (
        <form ref={formRef} noValidate onSubmit={handleSubmit} aria-label="Formulir testimoni">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label text-ink">Bagikan pengalamanmu</p>
              <h3 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-tight">
                Tulis testimoni
              </h3>
            </div>
            <button type="button" onClick={onClose} aria-label="Tutup formulir" className="label text-ink hover:underline">
              Tutup
            </button>
          </div>

          <fieldset disabled={submitting} className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            <legend className="sr-only">Isi formulir testimoni</legend>

            <Field id="testi-type" label="Jenis testimoni" as="select" required error={shown('type')} {...bind('type')}>
              <option value="">— Pilih —</option>
              {testimonialTypes.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </Field>
            <Field id="testi-name" label="Nama lengkap" required autoComplete="name" placeholder="Nama kamu" maxLength={LIMITS.name.max} error={shown('name')} {...bind('name')} />
            <Field id="testi-role" label="Peran / hubungan (opsional)" placeholder="mis. Guru pembimbing" maxLength={LIMITS.role.max} error={shown('role')} {...bind('role')} />
            <Field id="testi-organization" label="Instansi (opsional)" placeholder="mis. SMK Nusantara" maxLength={LIMITS.organization.max} error={shown('organization')} {...bind('organization')} />
            <Field
              id="testi-message" as="textarea" rows={6} label="Isi testimoni" required
              placeholder="Tulis pengalamanmu secara jujur…" maxLength={LIMITS.message.max * 2}
              error={shown('message')}
              counter={{ current: values.message.length, max: LIMITS.message.max }}
              className="sm:col-span-2" {...bind('message')}
            />
            <div className="sm:col-span-2">
              <label className="flex items-start gap-3 text-small text-ink-soft">
                <input
                  type="checkbox"
                  checked={values.consent}
                  onChange={(e) => setValue('consent', e.target.checked)}
                  onBlur={() => touch('consent')}
                  aria-invalid={shown('consent') ? 'true' : undefined}
                  aria-describedby={shown('consent') ? 'testi-consent-error' : undefined}
                  data-field="consent"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
                />
                <span>Saya memberikan izin agar testimoni ini ditinjau dan ditampilkan di situs jika disetujui.</span>
              </label>
              {shown('consent') && <p id="testi-consent-error" role="alert" className="mt-2 text-small text-ink">{shown('consent')}</p>}
            </div>
          </fieldset>

          <p className="sr-only" role="alert" aria-live="assertive">
            {errorCount > 0 ? `Ada ${errorCount} isian yang perlu diperbaiki.` : ''}
          </p>

          {status === 'error' && (
            <p role="alert" className="mt-6 flex items-start gap-2 border border-ink p-4 text-small font-medium">
              <AlertCircle size={16} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
              <span>{errorMessage || 'Testimoni belum berhasil dikirim.'} Isianmu masih tersimpan — coba lagi.</span>
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting} aria-busy={submitting} className="disabled:pointer-events-none disabled:opacity-70">
              {submitting ? (
                <><Loader2 size={14} strokeWidth={2} aria-hidden className="animate-spin" /> Mengirim…</>
              ) : (
                <><Send size={14} strokeWidth={1.75} aria-hidden /> Kirim testimoni</>
              )}
            </Button>
            <Button variant="ghost" onClick={reset} disabled={submitting}>
              <RotateCcw size={14} strokeWidth={1.75} aria-hidden /> Kosongkan
            </Button>
          </div>

          <p className="mt-5 max-w-xl text-small text-mute">
            Hanya testimoni asli yang diterima. Nama dan isian akan tampil publik jika disetujui pemilik portofolio.
          </p>
        </form>
      )}
    </div>
  );
}
