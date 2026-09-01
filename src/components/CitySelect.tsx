import React, { useState, useRef, useEffect } from "react";
import { COUNTRIES } from "../constants/countries";
import { CITIES_BY_COUNTRY } from "../constants/cities";

interface CitySelectProps {
  selectedCountry: string;
  value: string;
  onChange: (city: string) => void;
  onBlur?: () => void;
  darkMode?: boolean;
  hasError?: boolean;
  placeholder?: string;
}

const CitySelect: React.FC<CitySelectProps> = ({
  selectedCountry,
  value,
  onChange,
  onBlur,
  darkMode = false,
  hasError = false,
  placeholder = "Enter city",
}) => {
  const countryCode = COUNTRIES.find((c) => c.name === selectedCountry)?.code;
  const cities = countryCode ? CITIES_BY_COUNTRY[countryCode] : undefined;
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(
    value ? !(cities && cities.includes(value)) : false
  );
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cities && value && !cities.includes(value)) {
      setCustomMode(true);
    } else if (cities && !value) {
      setCustomMode(false);
    }
  }, [cities, value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onBlur]);

  // No predefined cities — fallback to text input
  if (!cities) {
    return (
      <input
        ref={inputRef as React.Ref<HTMLInputElement>}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border backdrop-blur-xl font-body transition-all ${
          hasError
            ? "border-red-500"
            : darkMode
              ? "bg-white/[0.04] border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:bg-white/[0.08]"
              : "bg-white/80 border-cyan-200/60 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:bg-white"
        } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
      />
    );
  }

  return (
    <div ref={ref} className="relative">
      {customMode ? (
        <div className="flex gap-2">
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`flex-1 px-4 py-3 rounded-xl border backdrop-blur-xl font-body transition-all ${
              hasError
                ? "border-red-500"
                : darkMode
                  ? "bg-white/[0.04] border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:bg-white/[0.08]"
                  : "bg-white/80 border-cyan-200/60 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:bg-white"
            } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
          />
          <button
            type="button"
            onClick={() => { setCustomMode(false); onChange(""); }}
            className={`px-3 py-3 rounded-xl border backdrop-blur-xl transition-all font-body text-sm ${
              darkMode
                ? "bg-white/[0.04] border-cyan-500/30 text-cyan-300 hover:bg-white/[0.08]"
                : "bg-white/80 border-cyan-200/60 text-cyan-700 hover:bg-white"
            } focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shrink-0`}
            title="Pick from list"
          >
            List
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl transition-all text-left font-body ${
              hasError
                ? "border-red-500"
                : darkMode
                  ? "bg-white/[0.04] border-cyan-500/30 text-white hover:bg-white/[0.08]"
                  : "bg-white/80 border-cyan-200/60 text-gray-900 hover:bg-white"
            } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
          >
            <span className={`flex-1 text-sm ${value ? "" : (darkMode ? "text-gray-500" : "text-gray-400")}`}>
              {value || placeholder}
            </span>
            <svg
              className={`w-4 h-4 transition-transform shrink-0 ${open ? "rotate-180" : ""} ${darkMode ? "text-gray-500" : "text-gray-400"}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div
              className={`absolute left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-xl border shadow-xl z-30 backdrop-blur-xl ${
                darkMode
                  ? "bg-gray-900/95 border-cyan-500/20"
                  : "bg-white/95 border-black/10"
              }`}
            >
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => { onChange(city); setOpen(false); onBlur?.(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left font-body ${
                    city === value
                      ? darkMode
                        ? "bg-cyan-500/15 text-cyan-300"
                        : "bg-cyan-50/80 text-cyan-700"
                      : darkMode
                        ? "text-gray-300 hover:bg-white/[0.04]"
                        : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex-1">{city}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setCustomMode(true); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left font-body border-t ${
                  darkMode
                    ? "text-cyan-300 hover:bg-white/[0.04] border-cyan-500/20"
                    : "text-cyan-700 hover:bg-gray-50 border-black/5"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Type manually…</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CitySelect;
