import { useEffect, useMemo, useState } from "react";
import { getPortafoliosPublicos } from "../../../services/portafolioservice";
import type { PortafolioPublicoResumen } from "../../../types/portafolioTypes";

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DELAY_MS = 300;

export const usePortfolioSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PortafolioPublicoResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);
  const shouldSearch = trimmedQuery.length >= MIN_SEARCH_LENGTH;
  const needsMoreCharacters = trimmedQuery.length > 0 && trimmedQuery.length < MIN_SEARCH_LENGTH;

  useEffect(() => {
    if (!shouldSearch) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      getPortafoliosPublicos(30, trimmedQuery)
        .then((items) => {
          if (active) setResults(items);
        })
        .catch((err) => {
          if (!active) return;

          const message = err?.response?.data?.message ?? "No se pudo realizar la busqueda.";
          setResults([]);
          setError(message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, SEARCH_DELAY_MS);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [shouldSearch, trimmedQuery]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    shouldSearch,
    needsMoreCharacters,
  };
};
