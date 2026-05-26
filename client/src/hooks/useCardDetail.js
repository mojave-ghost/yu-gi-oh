import { useQuery } from '@tanstack/react-query'
import { fetchCardById } from '../utils/api'

export function useCardDetail(id) {
  return useQuery({
    queryKey: ['card', id],
    queryFn:  () => fetchCardById(id),
    enabled:  !!id,
  })
}
