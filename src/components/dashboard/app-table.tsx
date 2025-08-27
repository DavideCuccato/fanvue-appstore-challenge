import React, { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AppRow } from "./app-row";
import { useApps, useAppAction } from "@/hooks/use-apps";
import { useFilterStore } from "@/store/filters";
import { AppAction } from "@/types";
import { Loader2 } from "lucide-react";

interface AppTableProps {
  searchTerm: string;
}

export const AppTable = React.memo<AppTableProps>(({ searchTerm }) => {
  const { filters } = useFilterStore();
  const appActionMutation = useAppAction();

  // Combine search term with filters
  const combinedFilters = useMemo(
    () => ({
      ...filters,
      search: searchTerm || filters.search,
    }),
    [filters, searchTerm],
  );

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useApps(combinedFilters);

  const allApps = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleAction = useCallback(
    (action: AppAction) => {
      appActionMutation.mutate({ appId: action.appId, action });
    },
    [appActionMutation],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading apps...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading apps. Please try again.</p>
      </div>
    );
  }

  if (allApps.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No apps found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg h-full flex flex-col">
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-fanvue-light sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-fanvue-dark uppercase tracking-wider">
                App
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-fanvue-dark uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-fanvue-dark uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-fanvue-dark uppercase tracking-wider">
                Developer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-fanvue-dark uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-fanvue-dark uppercase tracking-wider">
                Metrics
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-fanvue-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allApps.map((app) => (
              <AppRow
                key={app.id}
                app={app}
                onAction={handleAction}
                isLoading={appActionMutation.isPending}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      <div className="px-6 py-4 border-t border-gray-200 text-center flex-shrink-0 bg-white">
        <div className="text-sm text-gray-500 mb-3">
          Showing {allApps.length} apps
          {data?.pages[0]?.pagination?.totalCount
            ? ` of ${data.pages[0].pagination.totalCount}`
            : ""}
        </div>
        {hasNextPage && (
          <Button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading more...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        )}
      </div>
    </div>
  );
});

AppTable.displayName = "AppTable";
