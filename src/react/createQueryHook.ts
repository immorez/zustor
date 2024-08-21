import { useEffect } from 'react';
import { StoreApi } from 'zustand';
import { hashKey } from '../utils';

export function createQueryHook(
  key: ReadonlyArray<unknown>,
  queryFn: () => Promise<any>,
  config: Partial<QueryConfig<any>> = {},
  store: StoreApi<any>,
) {
  const hashedKey = hashKey(key)
  return function useQuery() {
    const { setState, getState } = store;
    const { onSuccess, onError, cacheTime = 60000 } = config; // Default cache time is 1 minute

    // Helper function to fetch data and update the cache
    const fetchData = async () => {
      try {
        const data = await queryFn();
        setState((state) => ({
          ...state,
          [hashedKey]: { data, timestamp: Date.now() },
        }));
        if (onSuccess) onSuccess(data);
      } catch (error) {
        if (onError) onError(error);
      }
    };

    // Get the cached data and check if it's still valid
    const getCachedData = () => {
      const state = getState();
      const cached = state[hashedKey];
      const now = Date.now();
      if (cached && now - cached.timestamp < cacheTime) {
        return cached.data;
      }
      return null;
    };

    // Fetch data if needed and revalidate the cache
    const revalidateCache = async () => {
      const data = getCachedData();
      if (!data) {
        await fetchData();
      } else {
        // Fetch new data in the background
        fetchData();
      }
    };

    // Initial data fetch or revalidation
    useEffect(() => {
      revalidateCache();
    }, [key]);

    return {
      data: getCachedData(),
      refetch: fetchData,
    };
  };
}
