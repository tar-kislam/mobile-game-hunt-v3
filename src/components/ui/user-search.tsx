"use client"

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { X, Search, UserPlus, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface UserSearchProps {
  onUserSelect: (user: User, role: string) => void
  selectedUsers: Array<{ userId: string; role: string; name: string; email: string; image?: string; isCreator?: boolean }>
  onUserRemove: (userId: string) => void
  onRoleChange: (userId: string, role: string) => void
}

const ROLES = [
  { value: 'MAKER', label: 'Maker' },
  { value: 'DESIGNER', label: 'Designer' },
  { value: 'DEVELOPER', label: 'Developer' },
  { value: 'PUBLISHER', label: 'Publisher' },
  { value: 'HUNTER', label: 'Hunter' }
]

export function UserSearch({ onUserSelect, selectedUsers, onUserRemove, onRoleChange }: UserSearchProps) {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setUsers([])
        setShowDropdown(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/users?query=${encodeURIComponent(query)}`)
        const data = await response.json()
        
        // Filter out already selected users
        const filteredUsers = data.filter((user: User) => 
          !selectedUsers.some(selected => selected.userId === user.id)
        )
        
        setUsers(filteredUsers)
        setShowDropdown(filteredUsers.length > 0)
      } catch (error) {
        console.error('Error searching users:', error)
        toast.error('Failed to search users')
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(searchUsers, 300)
    return () => clearTimeout(timeoutId)
  }, [query, selectedUsers])

  const handleUserSelect = (user: User) => {
    onUserSelect(user, 'MAKER')
    setQuery('')
    setShowDropdown(false)
  }

  const handleAddByEmail = () => {
    if (!query.trim()) return
    
    // Check if already added
    if (selectedUsers.some(user => user.email === query || user.name === query)) {
      toast.error('This user is already added')
      return
    }

    // Add as invited user
    const invitedUser = {
      userId: '',
      email: query,
      role: 'MAKER',
      name: query,
      image: undefined,
      isCreator: false
    }
    onUserSelect(invitedUser as any, 'MAKER')
    setQuery('')
  }

  return (
    <div className="space-y-4">
      {/* User Search with Add Button */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
            />
          </div>
          {/* Add Button - visible when typing */}
          {query.trim() && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddByEmail}
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No users found
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full p-3 text-left hover:bg-muted/50 flex items-center gap-3 transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                  </div>
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Users - Displayed as pills below input */}
      {selectedUsers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Selected Makers ({selectedUsers.length}/5)</h4>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div key={user.userId || user.email} className="flex items-center gap-2 p-2 bg-muted/30 rounded-full border">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={user.image} />
                  <AvatarFallback className="text-xs">{user.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">({user.role})</span>
                  {user.isCreator && (
                    <Badge variant="secondary" className="text-xs">Creator</Badge>
                  )}
                </div>
                <select
                  value={user.role}
                  onChange={(e) => onRoleChange(user.userId || user.email, e.target.value)}
                  className="text-xs border border-border rounded px-1 py-0.5 bg-background"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onUserRemove(user.userId || user.email)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
