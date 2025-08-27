import React from "react";
import { Button } from "@/components/ui/button";
import { AppStatus, AppCategory, AppFilters } from "@/types";
import { X } from "lucide-react";

interface FiltersSidebarProps {
  filters: AppFilters;
  onFiltersChange: (filters: Partial<AppFilters>) => void;
  onReset: () => void;
}

export const FiltersSidebar = React.memo<FiltersSidebarProps>(
  ({ filters, onFiltersChange, onReset }) => {
    const handleStatusToggle = (status: AppStatus) => {
      const currentStatus = filters.status || [];
      const newStatus = currentStatus.includes(status)
        ? currentStatus.filter((s) => s !== status)
        : [...currentStatus, status];

      onFiltersChange({ status: newStatus });
    };

    const handleCategoryToggle = (category: AppCategory) => {
      const currentCategory = filters.category || [];
      const newCategory = currentCategory.includes(category)
        ? currentCategory.filter((c) => c !== category)
        : [...currentCategory, category];

      onFiltersChange({ category: newCategory });
    };

    const handleSortChange = (
      sortBy: AppFilters["sortBy"],
      sortOrder: AppFilters["sortOrder"],
    ) => {
      onFiltersChange({ sortBy, sortOrder });
    };

    return (
      <div className="w-80 bg-white border-r border-fanvue-light shadow-lg">
        <div className="p-6 border-b border-fanvue-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-fanvue-green rounded-full"></div>
              <h3 className="text-lg font-bold text-fanvue-dark">Filters</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-3 hover:bg-red-50 text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Status Filter */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-fanvue-blue rounded-full"></div>
              <h4 className="font-semibold text-fanvue-dark">Status</h4>
            </div>
            <div className="space-y-3">
              {Object.values(AppStatus).map((status) => (
                <label
                  key={status}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(status) || false}
                    onChange={() => handleStatusToggle(status)}
                    className="w-4 h-4 text-fanvue-blue bg-gray-100 border-gray-300 rounded focus:ring-fanvue-blue focus:ring-2"
                  />
                  <span className="text-sm font-medium text-fanvue-dark capitalize">
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-fanvue-green rounded-full"></div>
              <h4 className="font-semibold text-fanvue-dark">Category</h4>
            </div>
            <div className="space-y-3">
              {Object.values(AppCategory).map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.category?.includes(category) || false}
                    onChange={() => handleCategoryToggle(category)}
                    className="w-4 h-4 text-fanvue-green bg-gray-100 border-gray-300 rounded focus:ring-fanvue-green focus:ring-2"
                  />
                  <span className="text-sm font-medium text-fanvue-dark capitalize">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <h4 className="font-semibold text-fanvue-dark">Sort By</h4>
            </div>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-") as [
                  AppFilters["sortBy"],
                  AppFilters["sortOrder"],
                ];
                handleSortChange(sortBy, sortOrder);
              }}
              className="w-full px-4 py-3 text-sm font-medium border border-gray-300 rounded-lg bg-white text-fanvue-dark focus:border-fanvue-blue focus:ring-2 focus:ring-fanvue-blue focus:ring-opacity-20 transition-all cursor-pointer"
            >
              <option value="submittedAt-desc">Newest First</option>
              <option value="submittedAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>
    );
  },
);

FiltersSidebar.displayName = "FiltersSidebar";
