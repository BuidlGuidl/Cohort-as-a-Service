"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export const FilterDropdown = ({ label, options, value, onChange }: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="btn btn-sm btn-outline flex items-center gap-2">
        {label}: {selectedOption?.label || "All"}
        {selectedOption?.count !== undefined && <span className="badge badge-sm">{selectedOption.count}</span>}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 z-10 bg-base-100 border border-base-300 rounded-lg shadow-lg min-w-[200px]"
          >
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-base-200 flex items-center justify-between ${
                  value === option.value ? "bg-primary/10" : ""
                }`}
              >
                <span>{option.label}</span>
                {option.count !== undefined && <span className="badge badge-sm">{option.count}</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
