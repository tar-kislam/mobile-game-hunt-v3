"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Download, GamepadIcon, Mail, Star, MessageCircle, TrendingUp, FileText } from 'lucide-react'
import { toast } from 'sonner'
import DarkVeil from '@/components/DarkVeil'
import { createEditor, Descendant, Editor, Element as SlateElement, Transforms } from 'slate'
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react'
import { withHistory } from 'slate-history'

interface Product {
  id: string
  title: string
  upvotes: number
  comments: number
  rating: number | null
  editorial_boost: boolean
  editorial_override: boolean
  _count: {
    votes: number
    comments: number
  }
}

interface NewsletterSubscriber {
  id: string
  email: string
  createdAt: string
}

type ActiveSection = 'games' | 'newsletter' | 'campaigns' | 'blog'

interface AdRequest {
  id: string
  userEmail?: string | null
  package: 'daily' | 'weekly' | 'monthly'
  promotions: any
  gameName: string
  totalPrice: number
  status?: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

interface BlogPostRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  status: string
  createdAt: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
}

function BlogCreateForm({ onCreated }: { onCreated: (p: any) => void }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const initialSlateValue: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }]
  const [content, setContent] = useState<Descendant[]>(initialSlateValue)
  const [thumbnail, setThumbnail] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [fontSizeValue, setFontSizeValue] = useState('base')

  const toSlug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')
  const editor = useState(() => withHistory(withReact(createEditor())))[0]
  // Ensure editor has initial content on mount
  useEffect(() => {
    if (!(Array.isArray(editor.children) && editor.children.length)) {
      editor.children = initialSlateValue as any
    }
    if (!Array.isArray(content) || !content.length) {
      setContent(initialSlateValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [ready, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])

  const uploadImage = async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    if (!res.ok || !json?.ok) throw new Error(json?.error || 'Upload failed')
    return json.url as string
  }

  const isMarkActive = (format: string) => {
    const marks: any = Editor.marks(editor) || {}
    return !!marks[format]
  }
  const toggleMark = (format: string) => {
    const active = isMarkActive(format)
    if (active) Editor.removeMark(editor, format)
    else Editor.addMark(editor, format, true)
  }
  const isBlockActive = (format: string) => {
    const [match] = Array.from(Editor.nodes(editor, {
      match: (n: any) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    }))
    return !!match
  }
  const toggleBlock = (format: string) => {
    const isActive = isBlockActive(format)
    const isList = ['numbered-list', 'bulleted-list'].includes(format)
    Transforms.unwrapNodes(editor, {
      match: (n: any) => !Editor.isEditor(n) && SlateElement.isElement(n) && ['numbered-list', 'bulleted-list'].includes(n.type as string),
      split: true,
    })
    let newType: any = isActive ? 'paragraph' : isList ? 'list-item' : format
    Transforms.setNodes(editor, { type: newType })
    if (!isActive && isList) {
      const block = { type: format, children: [] } as any
      Transforms.wrapNodes(editor, block)
    }
  }
  const setAlign = (align: 'left' | 'center' | 'right') => {
    Transforms.setNodes(editor, { align }, { match: n => SlateElement.isElement(n as any) })
  }
  const setColor = (color: string) => {
    Editor.addMark(editor, 'color', color)
  }
  const applyFontSize = (size: string) => {
    Editor.addMark(editor, 'fontSize', size)
  }
  const insertLink = (href: string) => {
    const link: any = { type: 'link', href, children: [{ text: 'link' }] }
    Transforms.insertNodes(editor, link)
  }
  const insertImage = (url: string) => {
    const image: any = { type: 'image', url, children: [{ text: '' }] }
    Transforms.insertNodes(editor, image)
  }

  return (
    <div className="space-y-3">
      <Input placeholder="Title" value={title} onChange={(e)=>{ setTitle(e.target.value); if (!slug) setSlug(toSlug(e.target.value)) }} className="bg-zinc-800/50 border-zinc-600 text-white" />
      <Input placeholder="Slug" value={slug} onChange={(e)=>setSlug(toSlug(e.target.value))} className="bg-zinc-800/50 border-zinc-600 text-white" />
      <Input placeholder="Thumbnail URL (optional)" value={thumbnail} onChange={(e)=>setThumbnail(e.target.value)} className="bg-zinc-800/50 border-zinc-600 text-white focus:border-purple-400 focus:ring-purple-500/30" />
      <Input placeholder="Cover Image URL (optional)" value={coverImage} onChange={(e)=>setCoverImage(e.target.value)} className="bg-zinc-800/50 border-zinc-600 text-white focus:border-purple-400 focus:ring-purple-500/30" />
      <Input placeholder="Tags (comma separated)" value={tags} onChange={(e)=>setTags(e.target.value)} className="bg-zinc-800/50 border-zinc-600 text-white" />
      <Input placeholder="Excerpt" value={excerpt} onChange={(e)=>setExcerpt(e.target.value)} className="bg-zinc-800/50 border-zinc-600 text-white" />
      {/* Editor Container */}
      <div className="relative mx-auto w-[90%]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 p-2 md:p-3 sticky top-1 z-20 rounded-xl bg-black/40 backdrop-blur-xl border border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
        <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleBlock('heading-one')}>H1</Button>
        <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleBlock('heading-two')}>H2</Button>
        <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleBlock('heading-three')}>H3</Button>
        <Button type="button" variant="ghost" className={`text-white hover:bg-purple-500/20 ${isMarkActive('bold')?'bg-white/10':''}`} onClick={()=>toggleMark('bold')}>Bold</Button>
        <Button type="button" variant="ghost" className={`text-white hover:bg-purple-500/20 ${isMarkActive('italic')?'bg-white/10':''}`} onClick={()=>toggleMark('italic')}>Italic</Button>
        <Button type="button" variant="ghost" className={`text-white hover:bg-purple-500/20 ${isMarkActive('underline')?'bg-white/10':''}`} onClick={()=>toggleMark('underline')}>Underline</Button>
        <Button type="button" variant="ghost" className={`text-white hover:bg-purple-500/20 ${isMarkActive('strikethrough')?'bg-white/10':''}`} onClick={()=>toggleMark('strikethrough')}>Strike</Button>
        <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleBlock('block-quote')}>Quote</Button>
        <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleBlock('bulleted-list')}>UL</Button>
        <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleBlock('numbered-list')}>OL</Button>
        <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleMark('code')}>Inline Code</Button>
        <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleBlock('code-block')}>Code Block</Button>
        <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>setAlign('left')}>Left</Button>
        <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>setAlign('center')}>Center</Button>
        <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>setAlign('right')}>Right</Button>
        <input type="color" onChange={(e)=>setColor(e.target.value)} className="h-9 w-9 rounded border border-white/20 bg-transparent hover:scale-105 transition" />
        <select value={fontSizeValue} onChange={(e)=>{ setFontSizeValue(e.target.value); applyFontSize(e.target.value) }} className="bg-zinc-800/80 text-white border border-white/10 rounded px-2 hover:bg-purple-500/10">
          <option value="sm">sm</option>
          <option value="base">base</option>
          <option value="lg">lg</option>
          <option value="xl">xl</option>
        </select>
        <Button type="button" variant="ghost" className="text-white" onClick={()=>{
          const url = prompt('Enter URL')
          if (url) insertLink(url)
        }}>Link</Button>
        <Button type="button" variant="ghost" className="text-white" onClick={()=>{
          const url = prompt('Image URL')
          if (url) insertImage(url)
        }}>Image URL</Button>
        <label className="px-3 py-2 border border-white/20 rounded-md text-white cursor-pointer hover:bg-purple-500/20">Upload Image
          <input type="file" accept="image/*" className="hidden" onChange={async (e)=>{
            const f = e.target.files?.[0]
            if (!f) return
            try {
              const url = await uploadImage(f)
              insertImage(url)
            } catch (err:any) {
              toast.error(err?.message || 'Upload failed')
            }
          }} />
        </label>
        <Button type="button" variant="ghost" className="ml-auto text-white hover:bg-purple-500/20" onClick={()=>setPreview(p=>!p)}>{preview ? 'Edit' : 'Preview'}</Button>
      </div>
      {!preview ? (
        ready ? (
        <Slate editor={editor} initialValue={initialSlateValue} onChange={() => { const next = (editor.children as Descendant[]); setContent(Array.isArray(next) && next.length ? next : initialSlateValue) }}>
          <Editable
            className="min-h-[400px] w-full rounded-xl bg-black/40 backdrop-blur-xl border border-purple-500/40 p-6 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] prose prose-invert text-lg leading-relaxed"
            renderElement={({ attributes, children, element }) => {
              const el: any = element
              switch (el.type) {
                case 'heading-one': return <h1 {...attributes} className="text-2xl font-bold">{children}</h1>
                case 'heading-two': return <h2 {...attributes} className="text-xl font-bold">{children}</h2>
                case 'heading-three': return <h3 {...attributes} className="text-lg font-bold">{children}</h3>
                case 'block-quote': return <blockquote {...attributes} className="border-l-4 pl-4 italic text-gray-300">{children}</blockquote>
                case 'bulleted-list': return <ul {...attributes} className="list-disc list-inside">{children}</ul>
                case 'numbered-list': return <ol {...attributes} className="list-decimal list-inside">{children}</ol>
                case 'list-item': return <li {...attributes}>{children}</li>
                case 'code-block': return <pre {...attributes} className="bg-black/50 p-4 rounded-md overflow-x-auto"><code>{children}</code></pre>
                case 'link': return <a {...attributes} href={el.href} className="text-purple-300 underline hover:text-purple-200" target="_blank" rel="noreferrer">{children}</a>
                case 'image': return <img {...attributes as any} src={el.url} alt="" className="w-full rounded-lg resize overflow-hidden" />
                default: return <p {...attributes} style={{ textAlign: el.align }} className="leading-relaxed" >{children}</p>
              }
            }}
            renderLeaf={({ attributes, children, leaf }) => {
              let style: any = {}
              if ((leaf as any).color) style.color = (leaf as any).color
              if ((leaf as any).fontSize) {
                const map: any = { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' }
                style.fontSize = map[(leaf as any).fontSize] || '1rem'
              }
              if ((leaf as any).bold) children = <strong>{children}</strong>
              if ((leaf as any).italic) children = <em>{children}</em>
              if ((leaf as any).underline) children = <u>{children}</u>
              if ((leaf as any).strikethrough) children = <s>{children}</s>
              if ((leaf as any).code) children = <code className="bg-black/40 px-1 rounded">{children}</code>
              return <span {...attributes} style={style}>{children}</span>
            }}
          />
        </Slate>
        ) : (
          <div className="min-h-[400px] w-full rounded-xl bg-black/40 backdrop-blur-xl border border-purple-500/40 p-6 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)]" />
        )
      ) : (
        <div className="min-h-[400px] w-full rounded-xl bg-black/40 backdrop-blur-xl border border-purple-500/40 p-6 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] prose prose-invert text-lg leading-relaxed">
          {/* Simple preview using same element renderer */}
          {content.map((node: any, i: number) => {
            const el = node
            const attributes: any = { key: i }
            switch (el.type) {
              case 'heading-one': return <h1 {...attributes} className="text-2xl font-bold">{el.children?.map((c:any)=>c.text).join('')}</h1>
              case 'heading-two': return <h2 {...attributes} className="text-xl font-bold">{el.children?.map((c:any)=>c.text).join('')}</h2>
              case 'heading-three': return <h3 {...attributes} className="text-lg font-bold">{el.children?.map((c:any)=>c.text).join('')}</h3>
              case 'block-quote': return <blockquote {...attributes} className="border-l-4 pl-4 italic text-gray-300">{el.children?.map((c:any)=>c.text).join('')}</blockquote>
              case 'bulleted-list': return <ul {...attributes} className="list-disc list-inside">{el.children?.map((li:any,idx:number)=><li key={idx}>{li.children?.map((c:any)=>c.text).join('')}</li>)}</ul>
              case 'numbered-list': return <ol {...attributes} className="list-decimal list-inside">{el.children?.map((li:any,idx:number)=><li key={idx}>{li.children?.map((c:any)=>c.text).join('')}</li>)}</ol>
              case 'code-block': return <pre {...attributes} className="bg-black/50 p-4 rounded-md overflow-x-auto"><code>{el.children?.map((c:any)=>c.text).join('')}</code></pre>
              case 'link': return <a {...attributes} href={el.href} className="text-purple-300 underline hover:text-purple-200" target="_blank" rel="noreferrer">{el.children?.map((c:any)=>c.text).join('')}</a>
              case 'image': return <img {...attributes} src={el.url} alt="" className="w-full rounded-lg" />
              default: return <p {...attributes} style={{ textAlign: el.align }} className="leading-relaxed">{el.children?.map((c:any)=>c.text).join('')}</p>
            }
          })}
        </div>
      )}
      </div>
      <Button
        onClick={async ()=>{
          const valueForSave = (Array.isArray(content) && content.length ? content : initialSlateValue)
          if (!title || !slug || (Array.isArray(valueForSave) && valueForSave.length===1 && !(valueForSave[0] as any).children?.[0]?.text)) { toast.error('Fill required fields'); return }
          setLoading(true)
          try {
            const res = await fetch('/api/blog', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title, slug, excerpt, content: JSON.stringify(valueForSave), coverImage: coverImage || undefined, status: 'DRAFT' }) })
            const json = await res.json()
            if (!res.ok || !json?.ok) throw new Error(json?.error || 'Failed')
            toast.success('Post created')
            onCreated({ id: json.data.id, title, slug, createdAt: new Date().toISOString() })
            // Redirect to post
            window.location.href = `/blog/${json.data.slug}`
            setTitle(''); setSlug(''); setExcerpt(''); setContent([{ type:'paragraph', children:[{text:''}] }]); setThumbnail(''); setTags('')
          } catch (e:any) {
            toast.error(e?.message || 'Failed to create')
          } finally {
            setLoading(false)
          }
        }}
        disabled={loading}
        className="bg-gradient-to-r from-purple-600 to-blue-600"
      >
        {loading ? 'Creating…' : 'Create Post'}
      </Button>
    </div>
  )
}

export default function EditorialDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<ActiveSection>('games')
  const [products, setProducts] = useState<Product[]>([])
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([])
  const [adRequests, setAdRequests] = useState<AdRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [campaignPlacement, setCampaignPlacement] = useState<'ALL' | string>('ALL')
  const [blogPosts, setBlogPosts] = useState<BlogPostRow[]>([])

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Check admin access
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/editorial-dashboard')
      return
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/403')
      return
    }
  }, [session, status, router])

  // Fetch data
  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') return
    
    const fetchData = async () => {
      try {
        setLoading(true)
        const [gamesRes, newsletterRes, adReqRes, blogRes] = await Promise.all([
          fetch('/api/admin/games'),
          fetch('/api/admin/newsletter'),
          fetch('/api/ad-requests'),
          fetch('/api/posts')
        ])

        if (gamesRes.ok) {
          const gamesData = await gamesRes.json()
          setProducts(gamesData)
        } else {
          toast.error('Failed to load games data')
        }

        if (newsletterRes.ok) {
          const newsletterData = await newsletterRes.json()
          setNewsletterSubscribers(newsletterData)
        } else {
          toast.error('Failed to load newsletter data')
        }

        if (adReqRes.ok) {
          const adReqJson = await adReqRes.json()
          setAdRequests(adReqJson?.data || [])
        } else {
          toast.error('Failed to load ad requests')
        }

        if (blogRes.ok) {
          const blogJson = await blogRes.json()
          const all = blogJson || []
          setBlogPosts(all)
        } else {
          toast.error('Failed to load blog posts')
        }
      } catch (error) {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  const handleEditorialToggle = async (gameId: string, field: 'editorial_boost' | 'editorial_override', value: boolean) => {
    try {
      setSaving(gameId)
      const response = await fetch(`/api/admin/games/${gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [field]: value
        })
      })

      if (response.ok) {
        const result = await response.json()
        setProducts(prev => prev.map(p => 
          p.id === gameId ? { ...p, [field]: value } : p
        ))
        toast.success(`${field === 'editorial_boost' ? 'Editorial Boost' : 'Editorial Override'} updated successfully`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update setting')
      }
    } catch (error) {
      console.error('Error updating setting:', error)
      toast.error('Failed to update setting')
    } finally {
      setSaving(null)
    }
  }

  const handleDownloadCSV = () => {
    try {
      // Create CSV header
      const csvHeader = 'Email,Signup Date\n'
      
      // Convert newsletter subscribers data to CSV rows
      const csvRows = newsletterSubscribers.map(subscriber => {
        const email = subscriber.email
        const signupDate = new Date(subscriber.createdAt).toLocaleDateString('de-DE') // Format as DD.MM.YYYY
        return `${email},${signupDate}`
      }).join('\n')
      
      // Combine header and rows
      const csvContent = csvHeader + csvRows
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'newsletter-subscribers.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('CSV downloaded successfully')
    } catch (error) {
      console.error('Error downloading CSV:', error)
      toast.error('Failed to download CSV')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative">
        <DarkVeil className="min-h-screen w-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    )
  }

  if (!(session?.user?.role === 'ADMIN' || session?.user?.role === 'EDITOR')) {
    return null
  }

  // Helpers
  const prettyGoal = (promotions: any): string => {
    if (promotions && typeof promotions === 'object' && 'goal' in promotions) {
      return String((promotions as any).goal)
    }
    return '-'
  }

  const prettyPromotions = (promotions: any): string => {
    if (Array.isArray(promotions)) return promotions.join(', ')
    if (promotions && typeof promotions === 'object') {
      // try common keys
      const arr = (promotions as any).promotions || (promotions as any).placements || []
      if (Array.isArray(arr)) return arr.join(', ')
    }
    return String(promotions ?? '-')
  }

  return (
    <div className="min-h-screen w-full relative">
      <DarkVeil className="min-h-screen w-full p-6" />
      <div className="absolute inset-0 max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Editorial Dashboard</h1>
          <p className="text-gray-300">Manage featured games, newsletter subscribers, and ad requests</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
              <CardHeader>
                <CardTitle className="text-white">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeSection === 'games' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeSection === 'games' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection('games')}
                >
                  <GamepadIcon className="w-4 h-4 mr-2" />
                  Featured Games Control
                </Button>
                <Button
                  variant={activeSection === 'newsletter' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeSection === 'newsletter' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection('newsletter')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Newsletter Subscribers
                </Button>
                <Button
                  variant={activeSection === 'campaigns' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeSection === 'campaigns' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection('campaigns')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Advertising Campaigns
                </Button>
                <Button
                  variant={activeSection === 'blog' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeSection === 'blog' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection('blog')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Blog Management
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeSection === 'games' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <GamepadIcon className="w-5 h-5" />
                    Featured Games Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Input
                      type="text"
                      placeholder="Search games..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-zinc-800/50 border-zinc-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 focus:ring-2 rounded-lg"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Game Title</TableHead>
                          <TableHead className="text-gray-300">Upvotes</TableHead>
                          <TableHead className="text-gray-300">Comments</TableHead>
                          <TableHead className="text-gray-300">Rating</TableHead>
                          <TableHead className="text-gray-300">Editorial Boost</TableHead>
                          <TableHead className="text-gray-300">Editorial Override</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <TableRow key={product.id} className="border-gray-700">
                              <TableCell className="text-white font-medium">
                                {product.title}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                <div className="flex items:center gap-1">
                                  <TrendingUp className="w-4 h-4" />
                                  {product.upvotes || 0}
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300">
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  {product.comments || 0}
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {product.rating ? (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    {product.rating.toFixed(1)}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">No rating</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={product.editorial_boost}
                                  onCheckedChange={(checked) => 
                                    handleEditorialToggle(product.id, 'editorial_boost', checked)
                                  }
                                  disabled={saving === product.id}
                                />
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={product.editorial_override}
                                  onCheckedChange={(checked) => 
                                    handleEditorialToggle(product.id, 'editorial_override', checked)
                                  }
                                  disabled={saving === product.id}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow className="border-gray-700">
                            <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                              No games found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'newsletter' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Newsletter Subscribers
                    </CardTitle>
                    <Button
                      onClick={handleDownloadCSV}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Email</TableHead>
                          <TableHead className="text-gray-300">Signup Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newsletterSubscribers.map((subscriber) => (
                          <TableRow key={subscriber.id} className="border-gray-700">
                            <TableCell className="text-white">
                              {subscriber.email}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(subscriber.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'campaigns' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Ad Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">User Email</TableHead>
                          <TableHead className="text-gray-300">Goal</TableHead>
                          <TableHead className="text-gray-300">Package</TableHead>
                          <TableHead className="text-gray-300">Promotions</TableHead>
                          <TableHead className="text-gray-300">Game</TableHead>
                          <TableHead className="text-gray-300">Total Price</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adRequests.map((r) => {
                          const userEmail = r.userEmail || 'N/A'
                          const goal = prettyGoal(r.promotions)
                          const pkg = r.package
                          const promos = prettyPromotions(r.promotions)
                          const game = r.gameName || '-'
                          const price = r.totalPrice ?? 0
                          const status = r.status || 'pending'
                          const created = r.createdAt
                          return (
                            <TableRow key={r.id} className="border-gray-700">
                              <TableCell className="text-white">{userEmail}</TableCell>
                              <TableCell className="text-gray-300">{goal}</TableCell>
                              <TableCell className="text-gray-300">{pkg}</TableCell>
                              <TableCell className="text-gray-300">{promos}</TableCell>
                              <TableCell className="text-gray-300">{game}</TableCell>
                              <TableCell className="text-gray-300">${price}</TableCell>
                              <TableCell className="text-gray-300">{status}</TableCell>
                              <TableCell className="text-gray-300">{created ? new Date(created).toLocaleString() : '-'}</TableCell>
                            </TableRow>
                          )
                        })}
                        {adRequests.length === 0 && (
                          <TableRow className="border-gray-700">
                            <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                              No ad requests yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'blog' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Blog Management
                    </CardTitle>
                    <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600">
                      <a href="/editorial-dashboard/blog-editor">Create New Post</a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Title</TableHead>
                          <TableHead className="text-gray-300">Author</TableHead>
                          <TableHead className="text-gray-300">Slug</TableHead>
                          <TableHead className="text-gray-300">Created</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blogPosts.map((p: any) => (
                          <TableRow key={p.id} className="border-gray-700">
                            <TableCell className="text-white">{p.title}</TableCell>
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={p.author?.image || ''} />
                                  <AvatarFallback className="text-xs">
                                    {p.author?.name?.charAt(0) || 'A'}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{p.author?.name || 'Anonymous'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">{p.slug}</TableCell>
                            <TableCell className="text-gray-300">{new Date(p.createdAt).toLocaleString()}</TableCell>
                            <TableCell className="text-gray-300 uppercase">{(p.status || 'draft')}</TableCell>
                            <TableCell>
                              <a href={`/blog/${p.slug}`} className="text-purple-300 hover:underline mr-3">View</a>
                              <a href={`/editorial-dashboard/blog-editor?slug=${p.slug}`} className="text-blue-300 hover:underline mr-3">Edit</a>
                              {/* Delete can be wired to API in future */}
                            </TableCell>
                          </TableRow>
                        ))}
                        {blogPosts.length === 0 && (
                          <TableRow className="border-gray-700">
                            <TableCell colSpan={6} className="text-center text-gray-400 py-6">No posts yet</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
