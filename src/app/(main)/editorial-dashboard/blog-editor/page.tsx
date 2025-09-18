'use client'

import { useState, useEffect } from 'react'
import { createEditor, Descendant, Editor, Element as SlateElement, Transforms } from 'slate'
import { Slate, Editable, withReact, ReactEditor, useSelected, useFocused } from 'slate-react'
import { withHistory } from 'slate-history'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'

// Image utilities
type ImageNode = {
  type: 'image'
  url: string
  alt?: string
  width?: string
  align?: 'left' | 'center' | 'right'
  children: { text: string }[]
}

const withImages = (editor: Editor) => {
  const { insertBreak } = editor
  editor.insertBreak = () => {
    const [match] = Editor.nodes(editor, { match: n => (n as any).type === 'image' })
    if (match) {
      // Insert a new paragraph below image to continue typing
      Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] } as any)
      // Move cursor into the newly inserted paragraph
      try {
        const after = Editor.after(editor, editor.selection!, { unit: 'block' })
        if (after) Transforms.select(editor, after)
      } catch {}
      return
    }
    insertBreak()
  }
  return editor
}

const insertImage = (editor: Editor, url: string, alt = '') => {
  const image: ImageNode = { type: 'image', url, alt, width: '100%', align: 'center', children: [{ text: '' }] }
  Transforms.insertNodes(editor, image)
  // Also insert a paragraph after the image for continued typing
  Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] } as any)
  // Move cursor into the newly inserted paragraph
  try {
    const after = Editor.after(editor, editor.selection!, { unit: 'block' })
    if (after) Transforms.select(editor, after)
  } catch {}
}

const toggleMark = (editor: Editor, format: string) => {
  const isActive = (Editor.marks(editor) as any)?.[format] === true
  if (isActive) Editor.removeMark(editor, format)
  else Editor.addMark(editor, format, true)
}

const toggleBlock = (editor: Editor, format: string) => {
  const isActive = (Editor.marks(editor) as any)?.[format] === true
  const isList = ['bulleted-list', 'numbered-list'].includes(format)
  
  if (isList) {
    Transforms.unwrapNodes(editor, {
      match: n => ['bulleted-list', 'numbered-list'].includes((n as any).type),
      split: true,
    })
  }
  
  let newProperties: Partial<SlateElement>
  if (isActive) {
    newProperties = { type: 'paragraph' }
  } else if (isList) {
    newProperties = { type: format }
  } else {
    newProperties = { type: format }
  }
  
  Transforms.setNodes<SlateElement>(editor, newProperties)
  
  if (!isActive && isList) {
    const block = { type: 'list-item', children: [{ text: '' }] }
    Transforms.wrapNodes(editor, block)
  }
}

function ImageElement({ attributes, children, element, editor }: any) {
  const selected = useSelected()
  const focused = useFocused()
  const el = element as ImageNode
  const widthPct = parseInt((el.width || '100%').replace('%','')) || 100
  const align = el.align || 'center'
  const style: any = {
    maxWidth: '100%',
    height: 'auto',
    width: el.width || '100%',
    display: 'block',
    margin: align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0'
  }
  return (
    <div {...attributes} contentEditable={false} className="block mb-4">
      <div style={{ textAlign: align }}>
        <img src={el.url} alt={el.alt || ''} style={style} className="rounded-lg" />
      </div>
      {(selected && focused) && (
        <div className="mt-2 rounded-lg bg-black/50 border border-white/10 p-3 text-white flex items-center gap-3">
          <span className="text-sm text-gray-300">Image tools:</span>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={widthPct}
            onChange={(e)=>{
              const path = ReactEditor.findPath(editor, element)
              Transforms.setNodes(editor, { width: `${e.target.value}%` }, { at: path })
            }}
            className="w-40"
          />
          <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>{
            const path = ReactEditor.findPath(editor, element)
            Transforms.setNodes(editor, { align: 'left' }, { at: path })
          }}>Left</Button>
          <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>{
            const path = ReactEditor.findPath(editor, element)
            Transforms.setNodes(editor, { align: 'center' }, { at: path })
          }}>Center</Button>
          <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>{
            const path = ReactEditor.findPath(editor, element)
            Transforms.setNodes(editor, { align: 'right' }, { at: path })
          }}>Right</Button>
          <Button type="button" variant="ghost" className="text-red-400 hover:bg-red-500/20" onClick={()=>{
            const path = ReactEditor.findPath(editor, element)
            Transforms.removeNodes(editor, { at: path })
          }}>Delete</Button>
        </div>
      )}
      {children}
    </div>
  )
}

export default function BlogEditorPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [thumbPreview, setThumbPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [fontSizePx, setFontSizePx] = useState('16px')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT')

  const initialValue: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }]
  const [editor] = useState(() => withImages(withHistory(withReact(createEditor()))))
  const [ready, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])

  const toSlug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')

  const handleUpload = async (file: File) => {
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    if (!res.ok || !json?.ok) throw new Error(json?.error || 'Upload failed')
    return json.url as string
  }

  const onThumbnailFile = async (file: File) => {
    try {
      // local preview first
      const localUrl = URL.createObjectURL(file)
      setThumbPreview(localUrl)
      // upload to backend
      const uploadedUrl = await handleUpload(file)
      setThumbnailUrl(uploadedUrl)
    } catch (e: any) {
      toast.error(e?.message || 'Thumbnail upload failed')
      setThumbPreview('')
    }
  }

  const resetThumbnail = () => {
    setThumbPreview('')
    setThumbnailUrl('')
  }

  const save = async () => {
    const content = JSON.stringify(editor.children as Descendant[])
    if (!title || !slug) { toast.error('Title and slug are required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/blog', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        coverImage: coverImageUrl || undefined,
        status: status // Use the controlled status state
      }) })
      const json = await res.json()
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Save failed')
      toast.success(status === 'PUBLISHED' ? 'Published' : 'Saved as draft')
      router.push('/editorial-dashboard?section=blog')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  // Active mark utility
  const isActive = (format: string) => ((Editor.marks(editor) as any)?.[format] === true)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-[#121225] to-[#050509]">
      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Left SEO Panel */}
        <div className="md:col-span-3 space-y-3">
          <div className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-4">
            <div className="text-white font-semibold mb-2">SEO & Meta</div>
            <Input placeholder="Title" value={title} onChange={(e)=>{ setTitle(e.target.value); if(!slug) setSlug(toSlug(e.target.value)) }} className="bg-white/10 border-white/20 text-white mb-2" />
            <Input placeholder="Slug" value={slug} onChange={(e)=>setSlug(toSlug(e.target.value))} className="bg-white/10 border-white/20 text-white mb-2" />
            <Input placeholder="Tags (comma separated)" value={tags} onChange={(e)=>setTags(e.target.value)} className="bg-white/10 border-white/20 text-white mb-2" />
            <Input placeholder="Category (e.g., Company, Product, Design)" value={category} onChange={(e)=>setCategory(e.target.value)} className="bg-white/10 border-white/20 text-white mb-2" />
            <Input placeholder="Excerpt" value={excerpt} onChange={(e)=>setExcerpt(e.target.value)} className="bg-white/10 border-white/20 text-white mb-2" />
            
            {/* Status Dropdown */}
            <div className="mb-2">
              <div className="text-white/80 text-sm mb-1">Status</div>
              <Select value={status} onValueChange={(value: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => setStatus(value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/20">
                  <SelectItem value="DRAFT" className="text-white hover:bg-zinc-700">Draft</SelectItem>
                  <SelectItem value="PUBLISHED" className="text-white hover:bg-zinc-700">Published</SelectItem>
                  <SelectItem value="ARCHIVED" className="text-white hover:bg-zinc-700">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Thumbnail uploader: URL or file */}
            <div className="mb-2">
              <div className="text-white/80 text-sm mb-1">Thumbnail</div>
              {!thumbPreview ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Paste thumbnail URL"
                    value={thumbnailUrl}
                    onChange={(e)=>setThumbnailUrl(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <label className="block w-full rounded-lg border-2 border-dashed border-white/20 hover:border-purple-400/60 hover:bg-white/5 transition p-4 text-center text-white/80 cursor-pointer">
                    Drag & drop thumbnail or click to upload
                    <input type="file" accept="image/*" className="hidden" onChange={async (e)=>{
                      const f = e.target.files?.[0]
                      if (!f) return
                      await onThumbnailFile(f)
                    }} />
                  </label>
                </div>
              ) : (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbPreview || thumbnailUrl} alt="thumbnail" className="w-[200px] h-auto object-cover rounded-lg border border-white/20" />
                  <button type="button" onClick={resetThumbnail} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs">✕</button>
                </div>
              )}
            </div>
            <Input placeholder="Cover Image URL" value={coverImageUrl} onChange={(e)=>setCoverImageUrl(e.target.value)} className="bg-white/10 border-white/20 text-white" />
          </div>
          <div className="flex gap-2">
            <Button disabled={loading} onClick={save} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">
              {loading ? 'Saving...' : status === 'PUBLISHED' ? 'Publish' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Center Editor */}
        <div className="md:col-span-7 space-y-3">
          <div className="sticky top-2 z-20 rounded-xl bg-black/40 backdrop-blur-xl border border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.4)] p-2 flex flex-wrap items-center gap-2">
            <Button type="button" variant="ghost" className={`text-white hover:bg-purple-500/20 ${isActive('bold')?'bg-white/10':''}`} onClick={()=>toggleMark(editor,'bold')}>Bold</Button>
            <Button type="button" variant="ghost" className={`text-white hover:bg-purple-500/20 ${isActive('italic')?'bg-white/10':''}`} onClick={()=>toggleMark(editor,'italic')}>Italic</Button>
            <Button type="button" variant="ghost" className={`text-white hover:bg-purple-500/20 ${isActive('underline')?'bg-white/10':''}`} onClick={()=>toggleMark(editor,'underline')}>Underline</Button>
            <Button type="button" variant="ghost" className={`text-white hover:bg-purple-500/20 ${isActive('strikethrough')?'bg-white/10':''}`} onClick={()=>toggleMark(editor,'strikethrough')}>Strike</Button>
            <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleMark(editor,'code')}>Inline Code</Button>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-white/70 text-sm">Font</span>
              <select value={fontSizePx} onChange={(e)=>{ setFontSizePx(e.target.value); Editor.addMark(editor,'fontSize', e.target.value) }} className="bg-zinc-800/80 text-white border border-white/10 rounded px-2">
                <option value="12px">12</option>
                <option value="14px">14</option>
                <option value="16px">16</option>
                <option value="18px">18</option>
                <option value="24px">24</option>
                <option value="32px">32</option>
              </select>
            </div>
            <div className="h-6 w-px bg-white/20 mx-1" />
            <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleBlock('heading-one')}>H1</Button>
            <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleBlock('heading-two')}>H2</Button>
            <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleBlock('heading-three')}>H3</Button>
            <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleBlock('block-quote')}>Quote</Button>
            <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleBlock('bulleted-list')}>UL</Button>
            <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>toggleBlock('numbered-list')}>OL</Button>
            <div className="h-6 w-px bg-white/20 mx-1" />
            <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>{
              const url = prompt('Enter URL')
              if (url) {
                const link: any = { type: 'link', href: url, children: [{ text: 'link' }] }
                Transforms.insertNodes(editor, link)
              }
            }}>Link</Button>
            <Button type="button" variant="ghost" className="text-white hover:bg-purple-500/20" onClick={()=>{
              const url = prompt('Image URL')
              if (url) insertImage(editor, url, prompt('Alt text') || '')
            }}>Image URL</Button>
            <label className="px-3 py-2 border border-white/20 rounded-md text-white cursor-pointer hover:bg-purple-500/20">Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={async (e)=>{
                const f = e.target.files?.[0]
                if (!f) return
                try { const url = await handleUpload(f); insertImage(editor, url, f.name) } catch(e:any){ toast.error(e?.message || 'Upload failed') }
              }} />
            </label>
          </div>
          <div className="rounded-xl bg-black/40 backdrop-blur-xl border border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.4)] p-6">
            {ready && (
              <Slate editor={editor} initialValue={initialValue} onChange={()=>{}}>
                <Editable
                  className="min-h-[60vh] w-full text-white prose prose-invert leading-relaxed"
                  renderElement={({ attributes, children, element }) => {
                    const el: any = element
                    if (el.type === 'image') {
                      return <ImageElement attributes={attributes} children={children} element={element} editor={editor} />
                    }
                    switch (el.type) {
                      case 'heading-one': return <h1 {...attributes} className="text-3xl font-bold">{children}</h1>
                      case 'heading-two': return <h2 {...attributes} className="text-2xl font-bold">{children}</h2>
                      case 'heading-three': return <h3 {...attributes} className="text-xl font-bold">{children}</h3>
                      case 'block-quote': return <blockquote {...attributes} className="border-l-4 pl-4 italic text-gray-300">{children}</blockquote>
                      case 'bulleted-list': return <ul {...attributes} className="list-disc list-inside">{children}</ul>
                      case 'numbered-list': return <ol {...attributes} className="list-decimal list-inside">{children}</ol>
                      case 'list-item': return <li {...attributes}>{children}</li>
                      case 'code-block': return <pre {...attributes} className="bg-black/60 p-4 rounded-md overflow-x-auto"><code>{children}</code></pre>
                      case 'link': return <a {...attributes} href={el.href} className="text-purple-300 underline hover:text-purple-200" target="_blank" rel="noreferrer">{children}</a>
                      default: return <p {...attributes} style={{ textAlign: el.align }} className="leading-relaxed">{children}</p>
                    }
                  }}
                  renderLeaf={({ attributes, children, leaf }) => {
                    let style: any = {}
                    if ((leaf as any).fontSize) style.fontSize = (leaf as any).fontSize
                    if ((leaf as any).bold) children = <strong>{children}</strong>
                    if ((leaf as any).italic) children = <em>{children}</em>
                    if ((leaf as any).underline) children = <u>{children}</u>
                    if ((leaf as any).strikethrough) children = <s>{children}</s>
                    if ((leaf as any).code) children = <code className="bg-black/40 px-1 rounded">{children}</code>
                    return <span {...attributes} style={style}>{children}</span>
                  }}
                />
              </Slate>
            )}
          </div>
        </div>

        {/* Right Toolbar (additional room if needed) */}
        <div className="md:col-span-2 space-y-3">
          <div className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-4 text-white">
            <div className="font-semibold mb-2">Tips</div>
            <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
              <li>Use headings to structure the article.</li>
              <li>Images should be at least 1200px wide.</li>
              <li>Write a clear excerpt for SEO.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
