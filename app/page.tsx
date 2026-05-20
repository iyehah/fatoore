"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { LoaderCircle } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

export default function HomePage() {
  const {t} = useLanguage()
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard")
      } else {
        router.replace("/login")
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <LoaderCircle className="animate-spin "/>
        <p className="text-muted-foreground text-sm">
          {t("loading")}
        </p>
      </div>
    </div>
  )
}
