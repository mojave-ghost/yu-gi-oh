import { useQuery } from '@tanstack/react-query'
import { fetchArchetypes } from '../utils/api'

export function useArchetypes() {
  return useQuery({
    queryKey: ['archetypes'],
    queryFn:  fetchArchetypes,
    staleTime: 24 * 60 * 60 * 1000, // 24hr
  })
}
