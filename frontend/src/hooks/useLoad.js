import { useState, useCallback, useEffect } from "react";
import { api } from "../services/api.js";
function useLoad(path) {
  const [data, setData] = useState(null),
    [error, setError] = useState('');
  const refresh = useCallback(() => {
    setError('');
    api(path).then(setData).catch(e => setError(e.message));
  }, [path]);
  useEffect(refresh, [refresh]);
  return {
    data,
    error,
    refresh
  };
}
export { useLoad };
