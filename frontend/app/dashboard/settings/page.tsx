"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/settings/profile-form"
import { AccountForm } from "@/components/settings/account-form"
import { PreferencesForm } from "@/components/settings/preferences-form"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Profile</h3>
            <p className="text-sm text-muted-foreground">
              Update your profile information.
            </p>
          </div>
          <ProfileForm />
        </TabsContent>
        <TabsContent value="account" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Account</h3>
            <p className="text-sm text-muted-foreground">
              Update your account settings.
            </p>
          </div>
          <AccountForm />
        </TabsContent>
        <TabsContent value="preferences" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Customize your application experience.
            </p>
          </div>
          <PreferencesForm />
        </TabsContent>
      </Tabs>
    </div>
  )
} 