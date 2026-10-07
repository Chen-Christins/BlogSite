import { useParams } from 'react-router-dom'
import FilteredPosts from '@/components/FilteredPosts'

export default function CategoryPosts() {
  const { slug = '' } = useParams()
  return <FilteredPosts title={`Category: ${slug}`} filter={{ category: slug }} />
}
