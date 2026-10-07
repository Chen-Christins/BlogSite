import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/api'
import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'
import { Empty, ErrorState, Loading } from '@/components/StateViews'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const page = Math.max(1, Number(params.get('page') || '1'))

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['search', q, page],
    queryFn: () => publicApi.search(q, page, 8),
    enabled: q.length > 0,
  })

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl font-bold tracking-[1px]">
        Search
        {q && <span className="ml-2 text-lg font-normal text-slate-400">“{q}”</span>}
      </h1>
      {!q && <Empty label="Enter a search keyword" />}
      {q && isLoading && <Loading />}
      {q && isError && <ErrorState message={(error as Error).message} />}
      {q && data && data.list.length === 0 && <Empty label="No matching posts found" />}
      {q && data && data.list.length > 0 && (
        <>
          <p className="mb-4 text-sm text-slate-400">{data.total} results</p>
          <div className="space-y-5">
            {data.list.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            page={data.page}
            pages={data.pages}
            onChange={(p) =>
              setParams(p > 1 ? { q, page: String(p) } : { q })
            }
          />
        </>
      )}
    </div>
  )
}
