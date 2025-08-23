"use client"

import { useWallet } from "@/contexts/wallet-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"

export function WalletStatus() {
  const { error, clearError, isConnecting } = useWallet()

  if (!error && !isConnecting) return null

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError} className="h-auto p-1">
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isConnecting && (
        <Alert className="mb-4">
          <AlertDescription>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Connecting wallet...</span>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
