"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { client } from "@/lib/client"

interface UseUserSyncProps {
  redirectTo?: string
}

export function useUserSync({ redirectTo = "/dashboard" }: UseUserSyncProps = {}) {
  const [isSynced, setIsSynced] = useState(false)
  const [syncTime, setSyncTime] = useState(3) // Default sync time in seconds
  const router = useRouter()

  useEffect(() => {
    let isMounted = true
    const startTime = Date.now()

    const syncUser = async () => {
      try {
        // Call the getDatabaseSyncStatus endpoint we created
        const response = await client.user.getDatabaseSyncStatus.$get()
        const data = await response.json()
        
        if (!isMounted) return
        
        // Calculate how long the sync took
        const syncDuration = (Date.now() - startTime) / 1000
        setSyncTime(syncDuration)
        
        // If sync is successful, update state and redirect
        if (data.isSynced) {
          setIsSynced(true)
          
          // Add a small delay before redirecting for better UX
          setTimeout(() => {
            if (isMounted && redirectTo) {
              router.push(redirectTo)
            }
          }, 1000)
        }
      } catch (error) {
        console.error("Error syncing user:", error)
        // On error, we could retry or handle differently
      }
    }

    syncUser()

    return () => {
      isMounted = false
    }
  }, [router, redirectTo])

  return { isSynced, syncTime }
}