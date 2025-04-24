"use client"
import { signIn, useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Radio } from "lucide-react"
import React from 'react'
import { logout } from '@/lib/auth'

const Appbar = () => {
    const session = useSession();
  return (
      <header className="px-4 lg:px-6 h-15 flex items-center backdrop-blur-sm bg-white/70 dark:bg-black/70 sticky top-0 z-50 border-b border-purple-100 dark:border-purple-900/20">
      <Link className="flex items-center justify-center" href="#">
        <div className="relative h-10 w-10 mr-2">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full opacity-80 blur-[2px]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Radio className="h-6 w-6 text-white" />
          </div>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          MusicStream
        </span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
      </nav>
      {session?.data?.user ? (
        <Button onClick={()=>logout()} className="ml-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white border-0">
        Logout
        </Button>
      ):(
        <Button onClick={()=>signIn()} className="ml-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white border-0">
        Sign Up
        </Button>
      )}
    </header>
  )
}

export default Appbar
