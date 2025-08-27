"use client";

import React, { useState } from "react";
import { SearchBar } from "@/components/dashboard/search-bar";
import { FiltersSidebar } from "@/components/dashboard/filters-sidebar";
import { AppTable } from "@/components/dashboard/app-table";
import { useFilterStore } from "@/store/filters";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const { filters, setFilters, resetFilters } = useFilterStore();

  return (
    <div className="h-screen bg-fanvue-light flex flex-col max-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-fanvue-light flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/fanvue_logo.png" alt="Fanvue" className="w-12 h-12" />
              <h1 className="text-xl font-semibold text-fanvue-dark">
                Fanvue AppStore Dashboard
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <FiltersSidebar
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Content Area */}
        <main className="flex-1 p-6 flex flex-col min-h-0">
          <div className="flex-shrink-0 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-fanvue-dark mb-2">
                  App Submissions
                </h2>
                <p className="text-gray-600">
                  Review and moderate app submissions for the Fanvue AppStore.
                </p>
              </div>
              <div className="lg:max-w-md">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search apps by name, developer, or category..."
                />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <AppTable searchTerm={searchTerm} />
          </div>
        </main>
      </div>
    </div>
  );
}
