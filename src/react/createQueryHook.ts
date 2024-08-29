import { hashKey, log } from '../utils';
import { QueryConfig, ZustorStore } from '../types';
import { useOnMountUnsafe } from './hooks/useOnMountUnsafe';
import { useState } from 'react';

export function createQueryHook(
  key: ReadonlyArray<unknown>,
  queryFn: () => Promise<any>,
  config: Partial<QueryConfig<any>> = {},
  store: ZustorStore,
) {
  const hashedKey = hashKey(key);
  const { setState, getState } = store;

  return function useQuery() {
    // State to track loading (for the initial load)
    const [isLoading, setIsLoading] = useState(false);
    // State to track background fetching (subsequent refetches)
    const [isFetching, setIsFetching] = useState(false);
    // State to track if an error occurred
    const [error, setError] = useState<Error | null>(null);

    // Default cache time is 1 minute
    const { onSuccess, onError, cacheTime = 60000 } = config;

    // Track if data has been fetched
    let hasFetched = false;

    // Helper function to fetch data and update the cache
    const fetchData = async (isBackgroundFetch = false) => {
      log('info', `[FETCH DATA] Start fetching data for key: ${hashedKey}`);

      if (isBackgroundFetch) {
        setIsFetching(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const data = await queryFn();

        log(
          'info',
          `[FETCH DATA] Successfully fetched data for key: ${hashedKey}`,
          data,
        );

        setState((state) => ({
          ...state,
          [hashedKey]: { data, timestamp: Date.now() },
        }));

        if (onSuccess) onSuccess(data);
      } catch (error) {
        log(
          'error',
          `[FETCH DATA] Error fetching data for key: ${hashedKey}`,
          error,
        );
        setError(error);
        if (onError) onError(error);
      } finally {
        if (isBackgroundFetch) {
          setIsFetching(false);
        } else {
          setIsLoading(false);
        }
      }
    };

    // Get the cached data and check if it's still valid
    const getCachedData = () => {
      const state = getState();
      const cached = state[hashedKey];
      const now = Date.now();
      if (cached && now - cached.timestamp < cacheTime) {
        log('info', `[CACHE] Data for key: ${hashedKey} is valid`);
        return cached.data;
      }
      log('info', `[CACHE] Data for key: ${hashedKey} is expired or missing`);
      hasFetched = false;
      return null;
    };

    // Fetch data if needed and revalidate the cache
    const revalidateCache = async () => {
      log('info', `[REVALIDATE] Revalidating cache for key: ${hashedKey}`);

      const data = getCachedData();
      if (!data) {
        // Mark as fetched
        log(
          'info',
          `[REVALIDATE] Data not in cache or expired, fetching new data for key: ${hashedKey}`,
        );
        await fetchData(false); // Initial fetch
        hasFetched = true;
      } else if (!hasFetched) {
        // Fetch new data in the background if needed
        log(
          'info',
          `[REVALIDATE] Data in cache is valid, fetching new data in the background for key: ${hashedKey}`,
        );
        fetchData(true); // Background fetch
      }
    };

    // Initial data fetch or revalidation
    useOnMountUnsafe(() => {
      log(
        'info',
        `[MOUNT] Initial data fetch or revalidation for key: ${hashedKey}`,
      );
      revalidateCache();
    }, [key]);

    return {
      data: getCachedData(),
      isLoading,
      isFetching,
      error,
      refetch: () => fetchData(true),
    };
  };
}
