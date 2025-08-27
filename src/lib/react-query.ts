import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds - shorter for real-time feel
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchInterval: 60 * 1000, // Poll every 60 seconds
      refetchIntervalInBackground: false, // Don't poll when tab is inactive
    },
    mutations: {
      retry: 1,
    },
  },
});
