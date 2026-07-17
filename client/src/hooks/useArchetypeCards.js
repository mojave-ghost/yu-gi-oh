import { useQuery } from '@tanstack/react-query'
import { fetchCardsByArchetype } from '../utils/api'

export function useArchetypeCards(name) {
  return useQuery({
    queryKey: ['archetype', name],
    queryFn:  () => fetchCardsByArchetype(name),
    enabled:  !!name,
    staleTime: 60 * 60 * 1000, // 1hr
  })
}
