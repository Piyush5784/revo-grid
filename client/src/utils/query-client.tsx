import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
// import { TRPCClientError } from '@trpc/client';
import { toast } from 'sonner';

// Query Client with UI notification logging
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 60 * 24, // 1 day
		},
	},
	queryCache: new QueryCache({
		onError: (error, query) => {
			
		},
	}),
	mutationCache: new MutationCache({
		onError: (error, mutation) => {
			
		},
	}),
});
