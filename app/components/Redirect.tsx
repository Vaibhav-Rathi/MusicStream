"use client"
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const Redirect = () => {
    const router = useRouter();
    const session = useSession();

    useEffect(()=>{
        if (session?.data?.user){
            router.push('/dashboard')
        }
    })

  return null
}

export default Redirect
