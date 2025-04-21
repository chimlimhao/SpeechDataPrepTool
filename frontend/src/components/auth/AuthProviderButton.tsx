"use client";

import { useState } from "react";
import { useAuth } from "../../providers/auth.provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { AuthProvider, PROVIDER_CONFIG } from "@/lib/types/auth";

/**
 * Props for the AuthProviderButton component
 */
interface AuthProviderButtonProps {
  /** The OAuth provider to use */
  provider: Exclude<AuthProvider, 'email'>;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Button component for OAuth authentication
 * Displays a button for a specific provider with appropriate styling and logo
 */
export default function AuthProviderButton({ 
  provider, 
  className = "" 
}: AuthProviderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle } = useAuth();
  const config = PROVIDER_CONFIG[provider];

  /**
   * Handle sign in with the provider
   */
  async function handleSignIn() {
    if (provider !== 'google') {
      toast({
        title: "Not Implemented",
        description: `${config.name} sign in is not yet implemented.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: `There was an error signing in with ${config.name}.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignIn}
      disabled={isLoading}
      className={`w-full bg-card hover:bg-accent text-foreground font-medium border border-border h-11 transition-colors duration-200 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <div className="mr-2 relative w-4 h-4">
          <Image
            src={config.logo}
            alt={config.alt}
            fill
            className="object-contain"
          />
        </div>
      )}
      {isLoading ? "Signing in..." : `Continue with ${config.name}`}
    </Button>
  );
} 