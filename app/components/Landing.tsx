"use client"
import Link from "next/link"
import { signIn, useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Music, Radio } from "lucide-react"
import Appbar from "./Appbar"
import { JSX } from "react/jsx-dev-runtime"
import { useRouter } from "next/navigation"

export default function Dashboard(): JSX.Element {
  const router = useRouter();
  const session = useSession();
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white">
      <Appbar />
      <main className="flex-1 flex flex-col justify-center overflow-y-auto">
        <section className="h-full w-full flex flex-col justify-center py-8 md:py-12 overflow-hidden relative">
          {/* Music-themed animated background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48ZyB0cmFuc2Zvcm09InJvdGF0ZSg0NSAxIDEpIiBzdHJva2U9IiM4QjVDRjYiIHN0cm9rZS1vcGFjaXR5PSIuMSIgc3Ryb2tlLXdpZHRoPSIuNSI+PHJlY3QgeD0iLjUiIHk9Ii41IiB3aWR0aD0iMTciIGhlaWdodD0iMTciIHJ4PSI1Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            {/* Music note patterns */}
            <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNOSAxOFYxM00xNSAxMlY3TTkgOGwzIDN2N2E0IDQgMCAwIDAgOCAwdi0zIi8+PC9zdmc+')]"></div>
          </div>
          
          <div className="container px-4 md:px-6 mx-auto flex flex-col justify-between h-full">
            <div className="text-center mb-8">
              <div className="mb-4 inline-flex items-center justify-center">
                <div className="relative h-14 w-14 mr-2">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full opacity-80 blur-[4px]"></div>
                  <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                    <Radio className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 mb-3">
                MusicStream
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-4 rounded-full"></div>
              <p className="max-w-[600px] mx-auto text-purple-200 text-lg">
                Experience the rhythm of the crowd share and discover music with fans around the world.
              </p>
            </div>
            
            <div className="flex-grow flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-px w-12 bg-purple-700"></div>
                  <h2 className="text-xl font-bold text-center mx-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Start Streaming
                  </h2>
                  <div className="h-px w-12 bg-purple-700"></div>
                </div>
                
                <div className="text-center p-8 bg-black/40 backdrop-blur-sm rounded-xl shadow-lg border border-purple-500/20 mx-auto">
                  <Music className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white">Ready to be in the Stream?</h3>
                  <p className="text-purple-300 mt-2 mb-4">
                    Join our community of music creators and fans
                  </p>
                  <Button 
                    onClick={() => {
                      if (session?.data?.user) {
                        router.push('/dashboard');
                      } else {
                        signIn();
                      }
                    }} 
                    className="mt-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white border-0 w-full"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="w-full py-4 border-t border-purple-900/30 backdrop-blur-sm bg-black/20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link className="flex items-center justify-start group" href="#">
              <div className="relative h-8 w-8 mr-2">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full opacity-80 blur-[2px] group-hover:blur-[3px] transition-all"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Radio className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                MusicStream
              </span>
            </Link>
            <p className="text-xs text-purple-400/70 mt-4 md:mt-0">
              © 2025 MusicStream. Connecting creators and fans through music.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}