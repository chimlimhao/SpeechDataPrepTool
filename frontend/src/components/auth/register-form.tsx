"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/providers/auth.provider"
import { toast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import AuthProviderButton from "./AuthProviderButton"

export function RegisterForm() {
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password })
      router.push("/dashboard")
      router.refresh() // Force a refresh to update the session
    } catch (err) {
      console.error("Login failed:", err)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen justify-center items-center bg-background">
      {/* <div className="absolute -z-20 top-0 left-0 w-full h-full"
        style={{
          backgroundImage: 'radial-gradient(circle, #e6e6e6 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}>
      </div> */}

      <div className="relative w-full max-w-md px-6 py-12">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-teal-500" />
            <span className="text-2xl font-bold text-foreground">
              Somleng
            </span>
          </Link>
        </div>

        <div className="bg-card/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Get started with your free account
            </p>
          </div>

          {/* <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-teal-500 hover:bg-teal-600 text-white font-medium"
            >
              {loading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form> */}


          <div className="space-y-3">
            <AuthProviderButton provider="google" />
            <AuthProviderButton provider="github" />
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or</span>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-teal-500 hover:text-teal-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

