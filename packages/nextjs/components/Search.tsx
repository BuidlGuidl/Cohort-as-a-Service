"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";
import qs from "query-string";

interface SearchProps {
  placeholder?: string;
  paramName?: string;
  debounceTime?: number;
}

export const Search = ({ placeholder = "Search...", paramName = "search", debounceTime = 500 }: SearchProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramName) || "");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
      const url = qs.stringifyUrl(
        {
          url: pathname,
          query: {
            ...Object.fromEntries(searchParams),
            [paramName]: value || undefined,
          },
        },
        { skipNull: true, skipEmptyString: true },
      );
      router.push(url);
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams, paramName, debounceTime]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsTyping(true);
  };

  const handleClear = () => {
    setValue("");
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
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="input input-bordered w-full pl-10 pr-10 rounded-md input-sm"
        />
        {value && (
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
