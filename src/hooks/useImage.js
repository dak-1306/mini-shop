import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getImage } from "@/api/image";

/**
 * useImage hook
 * - size: required (number|string) -> will call https://dummyjson.com/image/:size
 * - options.enabled: optional to control query
 *
 * Returns: { blob, url, isLoading, isError, error, isFetching }
 * - url is a object URL (use directly in <img src={url} />)
 * - hook handles revokeObjectURL when blob changes / on unmount
 */
export default function useImage(size, options = {}) {
  const enabled = options.enabled ?? Boolean(size);

  const query = useQuery({
    queryKey: ["image", size],
    queryFn: async ({ signal }) => {
      const blob = await getImage(size, signal);
      return blob;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: blob, isLoading, isError, error, isFetching } = query;

  const [url, setUrl] = React.useState(null);

  // create object URL when blob available, revoke on change/unmount
  React.useEffect(() => {
    let objectUrl = null;
    if (blob instanceof Blob) {
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    } else {
      setUrl(null);
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [blob]);

  return {
    blob,
    url,
    isLoading,
    isError,
    error,
    isFetching,
    // include full query object for advanced use
    ...query,
  };
}
