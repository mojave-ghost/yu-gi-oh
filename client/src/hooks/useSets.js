import { useQuery } from '@tanstack/react-query'
import { fetchSets } from '../utils/api'

export function useSets() {
  return useQuery({
    queryKey: ['sets'],
    queryFn:  fetchSets,
    staleTime: 1000 * 60 * 60 * 24, // 24hr — matches server cache
  })
}
