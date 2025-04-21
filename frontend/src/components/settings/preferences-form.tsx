"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"

export function PreferencesForm() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    autoSave: true,
    compactView: false,
  })

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement preferences update logic
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated delay
      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Prevent hydration mismatch
  if (!mounted) return null

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Appearance</h4>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={theme}
                    onValueChange={setTheme}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred theme for the application.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact-view">Compact view</Label>
                    <p className="text-sm text-muted-foreground">
                      Use a more compact view for lists and tables.
                    </p>
                  </div>
                  <Switch
                    id="compact-view"
                    checked={preferences.compactView}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, compactView: checked })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications about your account activity.
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, emailNotifications: checked })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Auto-save</h4>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto-save changes</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save changes as you work.
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={preferences.autoSave}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, autoSave: checked })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save preferences"}
          </Button>
        </div>
      </div>
    </form>
  )
} 