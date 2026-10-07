import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/api'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: publicApi.settings,
    staleTime: 5 * 60 * 1000,
  })
}
