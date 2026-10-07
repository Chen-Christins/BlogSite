import { Route, Routes } from 'react-router-dom'
import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import ProtectedRoute from './ProtectedRoute'

import Home from '@/pages/public/Home'
import PostDetail from '@/pages/public/PostDetail'
import Archive from '@/pages/public/Archive'
import Tags from '@/pages/public/Tags'
import TagPosts from '@/pages/public/TagPosts'
import CategoryPosts from '@/pages/public/CategoryPosts'
import Search from '@/pages/public/Search'
import About from '@/pages/public/About'
import NotFound from '@/pages/public/NotFound'

import Login from '@/pages/admin/Login'
import Dashboard from '@/pages/admin/Dashboard'
import PostList from '@/pages/admin/PostList'
import PostEditor from '@/pages/admin/PostEditor'
import MediaPage from '@/pages/admin/Media'
import CommentsAdmin from '@/pages/admin/Comments'
import CategoriesAdmin from '@/pages/admin/Categories'
import TagsAdmin from '@/pages/admin/TagsAdmin'
import SettingsPage from '@/pages/admin/Settings'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="posts/:slug" element={<PostDetail />} />
        <Route path="archive" element={<Archive />} />
        <Route path="tags" element={<Tags />} />
        <Route path="tags/:slug" element={<TagPosts />} />
        <Route path="category/:slug" element={<CategoryPosts />} />
        <Route path="search" element={<Search />} />
        <Route path="about" element={<About />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="posts" element={<PostList />} />
        <Route path="posts/new" element={<PostEditor />} />
        <Route path="posts/:id" element={<PostEditor />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="comments" element={<CommentsAdmin />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="tags" element={<TagsAdmin />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
