import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import CodeBlock from './CodeBlock'

interface Props {
  content: string
  className?: string
}

export default function Markdown({ content, className }: Props) {
  return (
    <div className={`markdown-body ${className ?? ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'append', properties: { className: 'header-anchor' }, content: { type: 'text', value: '#' } }],
          [rehypeHighlight, { detect: true, ignoreMissing: true }],
        ]}
        components={{
          pre: CodeBlock as never,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
