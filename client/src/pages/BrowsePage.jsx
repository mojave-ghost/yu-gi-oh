import { useSearchParams } from 'react-router-dom'
import FilterSidebar from '../components/filters/FilterSidebar'
import SearchBar     from '../components/search/SearchBar'
import SortControl   from '../components/sort/SortControl'
import CardGrid      from '../components/cards/CardGrid'
import Pagination    from '../components/pagination/Pagination'
import { useCards }  from '../hooks/useCards'

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const query     = searchParams.get('q')         || ''
  const type      = searchParams.get('type')      || ''
  const attribute = searchParams.get('attribute') || ''
  const levelMin  = Number(searchParams.get('levelMin') || 1)
  const levelMax  = Number(searchParams.get('levelMax') || 12)
  const sort      = searchParams.get('sort')      || 'name'
  const page      = Number(searchParams.get('page') || 1)

  const { data, isLoading, isError } = useCards({
    query, type, attribute, levelMin, levelMax, sort, page,
  })

  function updateParam(key, value) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.set('page', '1')
      return next
    })
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--nav-height))' }}>
      <FilterSidebar
        type={type}
        attribute={attribute}
        levelMin={levelMin}
        levelMax={levelMax}
        onUpdate={updateParam}
      />

      <main style={{ flex: 1, padding: 'var(--section-pad)' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
          <SearchBar value={query} onChange={v => updateParam('q', v)} />
          <SortControl value={sort} onChange={v => updateParam('sort', v)} />
        </div>

        <CardGrid cards={data?.cards} isLoading={isLoading} isError={isError} />

        {data && (
          <Pagination
            page={page}
            total={data.total}
            perPage={24}
            onPageChange={p => updateParam('page', p)}
          />
        )}
      </main>
    </div>
  )
}
