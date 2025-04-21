"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/providers/auth.provider"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"

export function ProfileForm() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    bio: "",
    avatar: user?.user_metadata?.avatar_url || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement profile update logic
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated delay
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.avatar} alt={formData.name} />
              <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" disabled={isLoading}>
              Change avatar
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
              />
              <p className="text-sm text-muted-foreground">
                Your email address is managed through your authentication provider.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={isLoading}
                placeholder="Tell us a little bit about yourself"
                className="resize-none"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
} 