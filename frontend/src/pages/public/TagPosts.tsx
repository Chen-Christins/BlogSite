import { useParams } from 'react-router-dom'
import FilteredPosts from '@/components/FilteredPosts'

export default function TagPosts() {
  const { slug = '' } = useParams()
  return <FilteredPosts title={`Tag: #${slug}`} filter={{ tag: slug }} />
}
