import { useEffect, useRef } from 'react';
import { hashKey } from '../utils';
import { QueryConfig, ZustorStore } from '../types';

export function createQueryHook(
  key: ReadonlyArray<unknown>,
  queryFn: () => Promise<any>,
  config: Partial<QueryConfig<any>> = {},
  store: ZustorStore,
) {
  const hashedKey = hashKey(key);
  return function useQuery() {
    const { setState, getState } = store;

    // Default cache time is 1 minute
    const { onSuccess, onError, cacheTime = 60000 } = config;

    // Track if data has been fetched
    const hasFetched = useRef(false);

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
      hasFetched.current = false;
      return null;
    };

    // Fetch data if needed and revalidate the cache
    const revalidateCache = async () => {
      const data = getCachedData();
      if (!data) {
        await fetchData();
        // Mark as fetched
        hasFetched.current = true;
      } else if (!hasFetched.current) {
        // Fetch new data in the background if needed
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
