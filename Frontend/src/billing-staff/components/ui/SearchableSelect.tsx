import React, { useState, useRef, useEffect } from "react";

export interface Option {
  value: string;
  label: string;
  searchKeywords?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function SearchableSelect({ options, value, onChange, placeholder = "Select...", className = "", id }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      (opt.searchKeywords && opt.searchKeywords.toLowerCase().includes(q)) ||
      opt.value.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        id={id}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setQuery("");
        }}
      >
        <div className={`flex-1 truncate ${!selectedOption && !isOpen ? "text-ink-500" : "text-ink-900"}`}>
          {isOpen ? (
            <input
              type="text"
              className="w-full bg-transparent outline-none p-0 border-none focus:ring-0"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            selectedOption ? selectedOption.label : placeholder
          )}
        </div>
        <div className="pointer-events-none ml-2 flex items-center shrink-0">
          <svg className="h-4 w-4 text-ink-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {filteredOptions.length === 0 ? (
            <div className="relative cursor-default select-none px-4 py-2 text-ink-500">
              Nothing found.
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-brand-50 hover:text-brand-900 ${
                  opt.value === value ? "bg-brand-50 font-semibold text-brand-900" : "text-ink-900"
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span className="block truncate">{opt.label}</span>
                {opt.value === value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-600">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
