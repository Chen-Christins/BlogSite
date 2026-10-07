import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/api'
import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'
import { Empty, ErrorState, Loading } from '@/components/StateViews'

interface Props {
  title: string
  filter: { tag?: string; category?: string }
}

export default function FilteredPosts({ title, filter }: Props) {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page') || '1'))

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['posts', 'filter', filter, page],
    queryFn: () => publicApi.posts({ page, size: 8, ...filter }),
  })

  return (
    <div>
      <header className="mb-8 border-b border-brand-100 pb-6 dark:border-[#24382a]">
        <h1 className="font-serif text-[30px] font-bold tracking-[1px] text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        {data && <p className="mt-2 text-sm text-slate-400">{data.total} posts</p>}
      </header>
      {isLoading && <Loading />}
      {isError && <ErrorState message={(error as Error).message} />}
      {data && data.list.length === 0 && <Empty label="No posts found" />}
      {data && data.list.length > 0 && (
        <>
          <div className="space-y-5">
            {data.list.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            page={data.page}
            pages={data.pages}
            onChange={(p) => setParams(p > 1 ? { page: String(p) } : {})}
          />
        </>
      )}
    </div>
  )
}
