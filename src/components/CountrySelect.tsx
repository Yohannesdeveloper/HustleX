import React, { useState, useRef, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { COUNTRIES } from "../constants/countries";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  darkMode?: boolean;
  hasError?: boolean;
  placeholder?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  onBlur,
  darkMode = false,
  hasError = false,
  placeholder = "Select country",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = COUNTRIES.find((c) => c.name === value);

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

  return (
    <div ref={ref} className="relative">
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
        {selected ? (
          <>
            <ReactCountryFlag
              countryCode={selected.code}
              svg
              style={{ width: '1.25em', height: '1.25em' }}
              className="shrink-0"
            />
            <span className="flex-1 text-sm">{selected.name}</span>
            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{selected.code}</span>
          </>
        ) : (
          <span className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{placeholder}</span>
        )}
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
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onChange(c.name); setOpen(false); onBlur?.(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left font-body ${
                c.name === value
                  ? darkMode
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "bg-cyan-50/80 text-cyan-700"
                  : darkMode
                    ? "text-gray-300 hover:bg-white/[0.04]"
                    : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ReactCountryFlag
                countryCode={c.code}
                svg
                style={{ width: '1.25em', height: '1.25em' }}
                className="shrink-0"
              />
              <span className="flex-1">{c.name}</span>
              <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
