import speciesList from "../data/speciesList";

export default function SpeciesLegend({ activeId }) {
  return (
    <div className="pointer-events-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 p-3 w-full sm:w-auto">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
        Species Legend
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
        {speciesList.map((s) => (
          <div
            key={s.id}
            className={`flex items-center gap-2 text-sm ${
              activeId && activeId === s.id
                ? "text-slate-900"
                : "text-slate-600"
            }`}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: s.color }}
            ></span>
            <span>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
