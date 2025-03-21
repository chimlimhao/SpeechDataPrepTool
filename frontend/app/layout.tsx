import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { AuthProvider } from "@/providers/auth.provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ProjectProvider } from "@/providers/project.provider"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Khmer Speech Tool",
  description: "A powerful tool for Khmer speech transcription and analysis",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ProjectProvider>
              {children}
            </ProjectProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 

