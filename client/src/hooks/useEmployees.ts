import { useQuery } from "@tanstack/react-query";
import { fetchEmployees } from "@/lib/api";

export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    staleTime: 60_000,
  });
};
