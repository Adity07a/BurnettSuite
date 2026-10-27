export default function ModelSelector({ models, value, onChange, disabled, loading = true }) {
  return <label className="block text-sm font-semibold text-slate-700">AI model
    <select value={value} disabled={disabled || !models.length} onChange={(event) => onChange(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900">
      {!models.length && <option value="">{loading ? "Loading models..." : "Models unavailable"}</option>}
      {models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
    </select>
  </label>;
}
