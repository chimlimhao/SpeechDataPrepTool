"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/hooks/use-toast"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { login, loginWithGoogle, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password })
      router.push("/dashboard")
      router.refresh() // Force a refresh to update the session
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      })
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      // Don't redirect here - the callback will handle it
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login with Google",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login to Khmer Speech Tool</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground mb-2">Or continue with</p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Login with Google
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/register" className="text-primary hover:underline">
            Register here
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}

