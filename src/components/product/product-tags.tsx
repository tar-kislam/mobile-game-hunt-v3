import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface ProductTagsProps {
  tags: Array<{
    tag: {
      id: string
      name: string
      slug: string
    }
  }>
}

export function ProductTags({ tags }: ProductTagsProps) {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag }) => (
          <Link key={tag.id} href={`/tags/${tag.slug}`}>
            <Badge 
              variant="secondary" 
              className="hover:bg-primary/10 transition-colors cursor-pointer"
            >
              {tag.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}
