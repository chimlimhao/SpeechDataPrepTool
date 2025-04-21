import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

export function NavBar() {
  const [activeLink, setActiveLink] = useState("#home")

  const handleLinkClick = (href: string) => {
    setActiveLink(href)
  }

  return (
    <header className="container mx-auto px-4 py-6 flex justify-between items-center border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Somleng</h1>
      </div>
      
      <div className="hidden md:block">
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/login">
            Get started →
          </Link>
        </Button>
      </div>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col space-y-4 mt-8">
              <Link href="/login" className="text-lg text-foreground hover:text-primary font-medium">
                Get Started →
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
} 