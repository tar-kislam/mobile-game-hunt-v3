"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Header } from "@/components/layout/header"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

const profileSchema = z.object({
  name: z.string().min(1, "Required").max(100),
  username: z.string().min(1, "Required").max(50),
  email: z.string().email("Invalid email"),
  image: z.string().optional().or(z.literal(""))
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Min 6 chars"),
  newPassword: z.string().min(8, "Min 8 chars"),
  confirmPassword: z.string().min(8, "Min 8 chars")
}).refine(v => v.newPassword === v.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] })

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile')
  const [dragOver, setDragOver] = useState(false)

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", username: "", email: "", image: "" }
  })

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }
  })

  useEffect(() => {
    const load = async () => {
      if (!session?.user?.email) return
      try {
        const res = await fetch(`/api/user?email=${encodeURIComponent(session.user.email)}`)
        if (!res.ok) return
        const user = await res.json()
        profileForm.reset({ name: user.name || "", username: user.username || "", email: user.email || "", image: user.image || "" })
        // fetch notification settings
        setNotifEnabled(user.notificationsEnabled ?? true)
        setMarketingOptIn(user.marketingOptIn ?? false)
      } catch {}
    }
    load()
  }, [session?.user?.email])

  const onSaveProfile = async (values: z.infer<typeof profileSchema>) => {
    try {
      setLoading(true)
      const res = await fetch('/api/user/update', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update')
      
      // Success toast
      toast.success('Profile updated successfully', { description: 'Your changes have been saved' })
      
      // Update NextAuth session with the new image data
      try {
        await update?.({
          name: data?.user?.name ?? values.name,
          email: data?.user?.email ?? values.email,
          image: data?.user?.image || undefined,
          username: data?.user?.username ?? values.username,
        })
        
        // Force refresh the page to update all components
        window.location.reload()
      } catch (updateError) {
        console.error('Session update error:', updateError)
        // Still refresh the page even if session update fails
        window.location.reload()
      }
    } catch (e: any) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const onChangePassword = async (values: z.infer<typeof passwordSchema>) => {
    try {
      setLoading(true)
      const res = await fetch('/api/user/password', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to change password')
      toast.success('Password updated')
      passwordForm.reset()
    } catch (e: any) {
      toast.error(e.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const toggleNotifications = async (key: 'notificationsEnabled' | 'marketingOptIn', value: boolean) => {
    try {
      const res = await fetch('/api/user/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [key]: value }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update notifications')
      toast.success('Notification settings updated')
    } catch (e: any) {
      toast.error(e.message || 'Failed to update notifications')
    }
  }

  // File selection & drag-n-drop for profile image
  const onPickFile = async (file: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      profileForm.setValue('image', dataUrl, { shouldDirty: true })
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6">
      {/* Mobile tabs header */}
      <div className="md:hidden mb-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="md:col-span-4 lg:col-span-3">
          <Card className="bg-card/60 backdrop-blur border-white/10 md:sticky md:top-20">
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { key: 'profile', label: 'Profile' },
                { key: 'security', label: 'Security' },
                { key: 'notifications', label: 'Notifications' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as any)}
                  className={
                    `w-full text-left px-3 py-2 rounded-md transition-colors ` +
                    (activeTab === (item.key as any)
                      ? 'bg-violet-600/20 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                      : 'hover:bg-muted/40 text-muted-foreground')
                  }
                >
                  {item.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="md:col-span-8 lg:col-span-9">
          <Card className="bg-card/60 backdrop-blur border-white/10">
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsContent value="profile" className="space-y-6">
                  <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" {...profileForm.register('name')} />
                      {profileForm.formState.errors.name && (
                        <p className="text-red-500 text-sm">{profileForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" placeholder="yourhandle" {...profileForm.register('username')} />
                      {profileForm.formState.errors.username && (
                        <p className="text-red-500 text-sm">{profileForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" {...profileForm.register('email')} />
                      {profileForm.formState.errors.email && (
                        <p className="text-red-500 text-sm">{profileForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <Label>Profile image</Label>
                      <Card className="p-4 border-white/10 bg-muted/10 shadow-lg">
                        <div className="flex items-center gap-4">
                          {profileForm.watch('image') ? (
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border border-white/10 shadow-lg">
                              <Image src={profileForm.watch('image') as string} alt="Preview" fill className="object-cover" />
                            </div>
                          ) : (
                            <Avatar className="h-24 w-24 shadow-lg border border-white/10">
                              <AvatarImage src={session?.user?.image || ''} />
                              <AvatarFallback className="bg-purple-600 text-white text-2xl">
                                {(session?.user?.name?.[0] || 'U').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1">
                            <div
                              className={`border border-dashed rounded-lg p-4 text-sm text-muted-foreground transition-colors ${dragOver ? 'border-violet-500 bg-violet-500/10' : 'border-white/15 bg-background/40'}`}
                              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                              onDragLeave={() => setDragOver(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setDragOver(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file) onPickFile(file)
                              }}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span>Drag & drop an image here, or choose a file</span>
                                <label className="px-3 py-1.5 rounded-md bg-violet-600/80 hover:bg-violet-500 text-white cursor-pointer shadow-[0_0_12px_rgba(139,92,246,0.35)]">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) onPickFile(file)
                                    }}
                                  />
                                  Choose File
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]">
                        {loading ? 'Saving...' : 'Save changes'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="currentPassword">Current password</Label>
                      <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-red-500 text-sm">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New password</Label>
                      <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-red-500 text-sm">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm new password</Label>
                      <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-red-500 text-sm">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]">
                        {loading ? 'Updating...' : 'Update password'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-muted/10">
                    <div>
                      <p className="font-medium">Email notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates about activity on your posts and games.</p>
                    </div>
                    <Switch checked={notifEnabled} onCheckedChange={(v) => { setNotifEnabled(v); toggleNotifications('notificationsEnabled', v) }} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-muted/10">
                    <div>
                      <p className="font-medium">Marketing updates</p>
                      <p className="text-sm text-muted-foreground">Occasional product news, tips, and special offers.</p>
                    </div>
                    <Switch checked={marketingOptIn} onCheckedChange={(v) => { setMarketingOptIn(v); toggleNotifications('marketingOptIn', v) }} />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </>
  )
}


