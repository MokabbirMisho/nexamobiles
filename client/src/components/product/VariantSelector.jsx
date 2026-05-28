export default function VariantSelector({ variants, selected, onSelect }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-graphite">Choose a configuration</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const label = [v.storage, v.color].filter(Boolean).join(' · ') || 'Standard';
          const out = v.stock <= 0;
          const active = selected?.id === v.id;
          return (
            <button key={v.id} disabled={out} onClick={() => onSelect(v)}
              className={`rounded-xl border px-3 py-2 text-sm transition ${
                active ? 'border-accent bg-accent/5 text-accent'
                : out ? 'cursor-not-allowed border-gray-200 text-gray-300'
                : 'border-gray-300 hover:border-gray-400'}`}>
              {label}{out ? ' (Out of stock)' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
