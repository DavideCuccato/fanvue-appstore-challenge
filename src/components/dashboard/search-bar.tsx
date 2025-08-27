import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { debounce } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = React.memo<SearchBarProps>(
  ({ onChange, placeholder = "Search apps..." }) => {
    // Debounced search to reduce API calls
    const debouncedOnChange = useMemo(
      () => debounce((value: string) => onChange(value), 300),
      [onChange],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedOnChange(e.target.value);
    };

    return (
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          onChange={handleChange}
          className="pl-12 w-full h-14 text-lg font-medium shadow-lg border-2 border-gray-200 hover:border-fanvue-blue focus:border-fanvue-blue focus:shadow-xl transition-all duration-200"
        />
      </div>
    );
  },
);

SearchBar.displayName = "SearchBar";
