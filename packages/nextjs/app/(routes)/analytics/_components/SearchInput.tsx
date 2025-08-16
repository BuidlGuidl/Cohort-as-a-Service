"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search cohorts...",
  debounceTime = 500,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  debounceTime?: number;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
      onChange(localValue);
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [localValue, debounceTime, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setIsTyping(true);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <motion.div
      className="relative flex-1 max-w-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="input input-bordered w-full pl-10 pr-10 rounded-md input-sm"
        />
        {localValue && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      {isTyping && (
        <motion.div
          className="absolute top-full mt-1 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Searching...
        </motion.div>
      )}
    </motion.div>
  );
};
