import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import Field, { FieldMessage } from '@/components/ui/Field';
import { makeKey, optionsOf } from '@/lib/admin/formModel';
import ImageField from './ImageField';

function SubField({ id, field, item, onChange }) {
  const common = { id, label: field.label, required: field.required, hint: field.hint, placeholder: field.placeholder, maxLength: field.maxLength ? field.maxLength * 2 : undefined };
  const bind = { value: item[field.name], onChange: (e) => onChange(field.name, e.target.value) };

  if (field.type === 'image') {
    return (
      <ImageField
        id={id} label={field.label} required={field.required} hint={field.hint} bucket={field.bucket}
        value={item[field.name]} onChange={(v) => onChange(field.name, v)}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <Field {...common} as="select" {...bind}>
        {optionsOf(field, item).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Field>
    );
  }
  if (field.type === 'textarea') return <Field {...common} as="textarea" rows={field.rows ?? 4} {...bind} />;
  return <Field {...common} type={field.type === 'date' ? 'date' : field.type === 'url' ? 'url' : 'text'} {...bind} />;
}

/** Daftar baris dinamis (tambah / hapus / urutkan). Dipakai untuk jsonb array. */
export default function Repeater({ field, value, onChange, errors, 'data-field': dataField }) {
  const blank = () => {
    const item = { _key: makeKey() };
    field.itemFields.forEach((f) => { item[f.name] = f.defaultValue ?? ''; });
    return item;
  };
  const update = (index, name, val) => onChange(value.map((it, i) => (i === index ? { ...it, [name]: val } : it)));
  const move = (index, dir) => {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const iconBtn = 'flex h-10 w-10 items-center justify-center border border-transparent transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-30';

  return (
    <div>
      <p className="label text-ink">{field.label}{field.required && <span aria-hidden> *</span>}</p>
      {field.hint && <p className="mt-1 text-small text-mute">{field.hint}</p>}

      <ul className="mt-3 space-y-3">
        {value.map((item, i) => (
          <li key={item._key} className="border border-line-strong p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="label text-ink">{field.itemLabel ?? 'Baris'} {i + 1}</span>
              <div className="flex">
                <button type="button" className={iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Naikkan ${field.itemLabel ?? 'baris'} ${i + 1}`}><ArrowUp size={16} aria-hidden /></button>
                <button type="button" className={iconBtn} onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Turunkan ${field.itemLabel ?? 'baris'} ${i + 1}`}><ArrowDown size={16} aria-hidden /></button>
                <button type="button" className={iconBtn} onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Hapus ${field.itemLabel ?? 'baris'} ${i + 1}`}><Trash2 size={16} aria-hidden /></button>
              </div>
            </div>
            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              {field.itemFields.filter((sf) => !sf.showIf || sf.showIf(item)).map((sf) => (
                <div key={sf.name} className={sf.type === 'textarea' || sf.type === 'image' || sf.width === 'full' ? 'sm:col-span-2' : undefined}>
                  <SubField id={`${field.name}-${i}-${sf.name}`} field={sf} item={item} onChange={(n, v) => update(i, n, v)} />
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        data-field={dataField}
        onClick={() => onChange([...value, blank()])}
        className="mt-3 inline-flex h-10 items-center gap-2 border border-ink px-4 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors hover:bg-ink hover:text-paper"
      >
        <Plus size={14} aria-hidden /> {field.addLabel ?? 'Tambah baris'}
      </button>

      {Array.isArray(errors) && errors.length > 0 && (
        <ul id={`${field.name}-error`} className="mt-2 space-y-1">
          {errors.map((e) => <li key={e}><FieldMessage id={`${field.name}-${e.length}`} error={e} /></li>)}
        </ul>
      )}
    </div>
  );
}
