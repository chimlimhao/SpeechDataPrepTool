"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Settings, LogOut, User } from "lucide-react"
import { useAuth } from "@/providers/auth.provider"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard
    },
    // {
    //   name: "Projects",
    //   href: "/dashboard/projects",
    //   icon: FolderOpen
    // },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings
    }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      // Force a router refresh to update auth state
      router.refresh()
      // Redirect to home page
      router.push('/')
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account",
      })
    } catch (error) {
      console.error('Logout failed:', error)
      toast({
        title: "Logout failed",
        description: "There was a problem signing you out",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen flex-col border-r bg-muted/10 bg-secondary ">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-teal-500 border-transparent border-b-black hover:cursor-pointer">Somleng</h2>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-2", {
                  "bg-teal-500 text-white hover:bg-teal-600": isActive,
                })}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 p-2">
              <div className="flex items-center gap-2 w-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]" side="right">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard/settings">
              <DropdownMenuItem className="hover:cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:text-red-500 focus:text-red-500 focus:bg-red-50 hover:cursor-pointer">
              <LogOut className="mr-2 h-4 w-4 text-red-500" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 