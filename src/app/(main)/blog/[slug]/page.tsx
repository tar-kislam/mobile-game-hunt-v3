import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DOMPurify from 'isomorphic-dompurify'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } })
  if (!post) return { title: 'Post not found' }
  return {
    title: `${post.title} | Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : (post.thumbnail ? [post.thumbnail] : []),
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } })
  if (!post) return notFound()

  const recent = await prisma.blogPost.findMany({
    where: { slug: { not: params.slug } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, slug: true, createdAt: true }
  })

  const related = post.tags?.length ? await prisma.blogPost.findMany({
    where: { slug: { not: params.slug }, tags: { hasSome: post.tags } },
    orderBy: { createdAt: 'desc' },
    take: 6,
    select: { id: true, title: true, slug: true }
  }) : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    image: post.coverImage ? [post.coverImage] : (post.thumbnail ? [post.thumbnail] : undefined),
    author: [{ '@type': 'Person', name: 'Editorial Team' }],
  }
  const safeHtml = DOMPurify.sanitize(post.content)

  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#121225] to-[#050509]" />
      <div className="relative max-w-3xl mx-auto px-4 py-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {(post.coverImage || post.thumbnail) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage || post.thumbnail!} alt={post.title} className="w-full h-64 object-cover rounded-xl mb-6 border border-white/20" />
        ) : null}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{post.title}</h1>
        <div className="text-gray-400 mb-6">{new Date(post.createdAt).toLocaleDateString()}</div>
        <article className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-200">
          <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
        </article>
        {post.tags?.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-200">#{tag}</span>
            ))}
          </div>
        ) : null}

        {related && related.length ? (
          <div className="mt-10">
            <h3 className="text-white font-semibold mb-3">Related Posts</h3>
            <ul className="list-disc list-inside text-gray-300">
              {related.map(r => (
                <li key={r.id}>
                  <a href={`/blog/${r.slug}`} className="text-purple-300 hover:underline">{r.title}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {recent && recent.length ? (
          <div className="mt-10">
            <h3 className="text-white font-semibold mb-3">Recent Posts</h3>
            <ul className="list-disc list-inside text-gray-300">
              {recent.map(r => (
                <li key={r.id}>
                  <a href={`/blog/${r.slug}`} className="text-purple-300 hover:underline">{r.title}</a> <span className="text-xs text-gray-500">({new Date(r.createdAt as any).toLocaleDateString()})</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
