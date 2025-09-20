import { Fragment, useMemo, useState, useEffect } from "react";
import { Combobox, Transition } from "@headlessui/react";
import speciesList from "../data/speciesList";
export default function SearchBar({ onSelect, resetSearch }) {
  const [query, setQuery] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  // Effect to clear search when resetSearch prop changes to true
  useEffect(() => {
    if (resetSearch) {
      setQuery("");
      setSelectedSpecies(null);
    }
  }, [resetSearch]);

  const filtered = useMemo(() => {
    if (!query) return speciesList;
    const q = query.toLowerCase();
    return speciesList.filter((s) => s.name.toLowerCase().includes(q));
  }, [query]);
  const handleSelect = (species) => {
    setSelectedSpecies(species);
    setQuery(species?.name || "");
    onSelect(species);
  };
  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-4">
      <Combobox value={selectedSpecies} onChange={handleSelect}>
        <div className="relative">
          <div className="relative w-full cursor-text overflow-hidden rounded-2xl bg-ocean-800/80 backdrop-blur ring-1 ring-white/10 shadow-soft">
            <Combobox.Input
              placeholder="Search species (scientific name)…"
              className="w-full bg-transparent py-3 pl-4 pr-10 text-slate-100 placeholder:text-slate-400 focus:outline-none"
              onChange={(e) => setQuery(e.target.value)}
              displayValue={(species) => species?.name || ""}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 3 10.5a7.5 7.5 0 0 0 13.65 6.15z"
                />
              </svg>
            </div>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-ocean-800/95 backdrop-blur ring-1 ring-white/10 shadow-soft focus:outline-none">
              {filtered.length === 0 && (
                <div className="px-4 py-3 text-slate-400">No matches.</div>
              )}
              {filtered.map((s) => (
                <Combobox.Option
                  key={s.id}
                  value={s}
                  className={({ active }) =>
                    `cursor-pointer select-none px-4 py-3 text-sm flex items-center gap-3 ${
                      active ? "bg-white/5" : ""
                    }`
                  }
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: s.color }}
                  ></span>
                  <span className="text-slate-100">{s.name}</span>
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}
