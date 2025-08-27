import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AppFilters,
  PaginatedResponse,
  AppSubmission,
  AppAction,
  ApiResponse,
} from "@/types";
import { env } from "@/lib/env";

const API_BASE = env.NEXT_PUBLIC_API_BASE_URL;

// Fecth apps with filters and pagination
export function useApps(filters: AppFilters, enablePolling = true) {
  return useInfiniteQuery({
    queryKey: ["apps", filters],
    queryFn: async ({
      pageParam,
    }): Promise<PaginatedResponse<AppSubmission>> => {
      const params = new URLSearchParams();

      if (pageParam) params.set("cursor", pageParam);
      if (filters.search) params.set("search", filters.search);
      if (filters.status?.length) {
        filters.status.forEach((status) => params.append("status", status));
      }
      if (filters.category?.length) {
        filters.category.forEach((cat) => params.append("category", cat));
      }
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

      const response = await fetch(`${API_BASE}/apps?${params}`);
      if (!response.ok) throw new Error("Failed to fetch apps");

      const data: ApiResponse<PaginatedResponse<AppSubmission>> =
        await response.json();
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: enablePolling ? 45 * 1000 : false, // 45 seconds
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

// Mutation for app actions with optimistic updates
export function useAppAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appId,
      action,
    }: {
      appId: string;
      action: AppAction;
    }) => {
      const response = await fetch(`${API_BASE}/apps/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });

      if (!response.ok) throw new Error("Failed to update app");

      const data: ApiResponse<AppSubmission> = await response.json();
      return data.data;
    },
    onMutate: async ({ appId, action }) => {
      await queryClient.cancelQueries({ queryKey: ["apps"] });

      queryClient.setQueriesData({ queryKey: ["apps"] }, (old: any) => {
        if (!old?.pages) return old;

        const updatedPages = old.pages.map(
          (page: PaginatedResponse<AppSubmission>) => ({
            ...page,
            data: page.data.map((app) =>
              app.id === appId
                ? {
                    ...app,
                    status:
                      action.type === "approve"
                        ? ("approved" as const)
                        : action.type === "reject"
                          ? ("rejected" as const)
                          : ("flagged" as const),
                    updatedAt: new Date().toISOString(),
                  }
                : app,
            ),
          }),
        );

        return { ...old, pages: updatedPages };
      });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
    onSuccess: () => {
      // Refetch on success to sync ffrom server
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}
