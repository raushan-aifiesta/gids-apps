import { useQuery } from "@tanstack/react-query";
import { fetchModels } from "@/lib/api";
import type { MeshModel } from "@/lib/types";

export function useModels() {
  return useQuery<MeshModel[]>({
    queryKey: ["invoice-models"],
    queryFn: fetchModels,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
