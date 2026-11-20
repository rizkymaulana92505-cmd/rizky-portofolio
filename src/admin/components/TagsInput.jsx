import { useState } from 'react';
import { X } from 'lucide-react';
import { FieldMessage } from '@/components/ui/Field';

/** Input daftar kata kunci: Enter / koma menambah, Backspace (kolom kosong) menghapus yang terakhir. */
export default function TagsInput({ id, label, value, onChange, onBlur, placeholder, hint, error, 'data-field': dataField }) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const parts = draft.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...new Set([...value, ...parts])]);
    setDraft('');
  };

  return (
    <div>
      <label htmlFor={id} className="label text-ink">{label}</label>
      <div className={`mt-1 flex flex-wrap items-center gap-2 border-b py-2 transition-colors focus-within:border-ink hover:border-ink ${error ? 'border-ink' : 'border-line-strong'}`}>
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 border border-ink px-2 py-1 font-mono text-[11px] uppercase tracking-[0.08em]">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Hapus ${tag}`} className="-m-1 flex h-8 w-8 items-center justify-center hover:opacity-60">
              <X size={12} aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={id}
          data-field={dataField}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
            else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => { commit(); onBlur?.(); }}
          placeholder={value.length ? '' : placeholder}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          aria-invalid={error ? 'true' : undefined}
          className="min-w-[8rem] flex-1 bg-transparent py-1 text-lead outline-none placeholder:text-mute/70"
        />
      </div>
      <FieldMessage id={id} error={error} hint={hint ?? 'Tekan Enter atau koma untuk menambah.'} />
    </div>
  );
}
