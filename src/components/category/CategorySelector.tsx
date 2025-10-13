"use client"

import { useEffect, useMemo, useState } from "react"

type Category = { id: string; name: string }

interface CategorySelectorProps {
  selectedCategoryIds: string[]
  onChange: (ids: string[]) => void
  maxSelections?: number
}

const TOP_TEN_NAMES = [
  "Action",
  "RPG",
  "Strategy",
  "MOBA",
  "Casual",
  "Adventure",
  "Shooter",
  "Simulation",
  "Puzzle",
  "Sports",
]

export function CategorySelector({
  selectedCategoryIds,
  onChange,
  maxSelections = 5,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  const reachedMax = selectedCategoryIds.length >= maxSelections

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/categories")
        if (!res.ok) return
        const data: Category[] = await res.json()
        if (!cancelled)
          setCategories(data.sort((a, b) => a.name.localeCompare(b.name)))
      } catch {}
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = (id: string) => {
    if (selectedCategoryIds.includes(id)) {
      onChange(selectedCategoryIds.filter((x) => x !== id))
    } else if (!reachedMax) {
      onChange([...selectedCategoryIds, id])
    }
  }

  const topTen = useMemo(() => {
    // Pick in the order of TOP_TEN_NAMES if present, else fill by A–Z
    const byName = (a: Category, b: Category) => a.name.localeCompare(b.name)
    const map = new Map(categories.map((c) => [c.name, c] as const))
    const prioritized: Category[] = []
    for (const n of TOP_TEN_NAMES) {
      const c = map.get(n)
      if (c) prioritized.push(c)
    }
    if (prioritized.length < 10) {
      const rest = categories
        .filter((c) => !prioritized.some((p) => p.id === c.id))
        .sort(byName)
      prioritized.push(...rest.slice(0, 10 - prioritized.length))
    }
    return prioritized
  }, [categories])

  const visible = isExpanded ? categories : topTen

  return (
    <div className="space-y-3">
      {/* Placeholder for future AI suggestion chips */}
      {/* TODO: 🧠 Suggested Categories will appear here via /api/suggest-categories */}

      {/* Pills container with smooth expand/collapse */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isExpanded ? 1000 : 160 }}
      >
        <div className="flex flex-wrap gap-2">
          {visible.map((c) => {
            const isSelected = selectedCategoryIds.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                className={`rounded-full px-3 py-2 text-sm transition-all duration-200 border ${
                  isSelected
                    ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                    : "bg-[#0a0a0a] border-[#1e1e1e] text-white hover:bg-[#1b1b1b] hover:shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                } ${!isSelected && reachedMax ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-pressed={isSelected}
              >
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Toggle button */}
      <div className="w-full flex justify-center">
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          className="text-purple-400 hover:text-purple-300 text-sm mt-2 cursor-pointer select-none"
        >
          {isExpanded ? "Show less" : "Show all categories"}
        </button>
      </div>
    </div>
  )
}

export default CategorySelector


