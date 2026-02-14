// client/src/hooks/useFetch.js
import { useState, useEffect } from 'react';

const useFetch = (url, options = {}) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!url) return;
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Pull JWT token from localStorage — same key AuthContext uses
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,  // allow caller to override
          },
        });

        if (!response.ok) {
          throw new Error(`Request failed — status ${response.status}`);
        }

        const result = await response.json();
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };  // cleanup on unmount

  }, [url]);  // re-fetches automatically if URL changes

  return { data, loading, error };
};

export default useFetch;
