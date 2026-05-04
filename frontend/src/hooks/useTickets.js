import { useEffect, useState } from "react";
import { getTicketsApi } from "../api/ticketApi";

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getTicketsApi()
      .then((res) => {
        if (mounted) setTickets(res.data.data || []);
      })
      .catch(() => mounted && setError("Failed to load tickets"))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return { tickets, loading, error, setTickets };
}
