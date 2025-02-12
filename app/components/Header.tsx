'use client'
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const Header = () => {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleLogout = () => {
    // Delete the token cookie
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    toast.success('Logged out successfully!')
    router.push('/auth/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-2 dark:bg-gray-900/80">
      <div className="max-w-screen-xl mx-auto px-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center transition-transform hover:scale-105">
              <div className="flex items-center gap-1 sm:gap-2 bg-transparent">
                <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <Image src="/assets/Swapify.jpg" alt="Logo" width={35} height={35} className="rounded-xl sm:w-[45px] sm:h-[45px]" />
                </div>
                <div className="text-black text-xl sm:text-3xl font-bold leading-none dark:text-white ml-1 sm:ml-2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
                    Swapify
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block flex-grow max-w-2xl">
            <form className="w-full" action="/search">   
              <label htmlFor="default-search" className="sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <input 
                  type="search" 
                  name="q" 
                  id="default-search" 
                  className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white" 
                  placeholder="Search items..."  
                  required
                />
                <button 
                  type="submit" 
                  className="absolute end-1.5 inset-y-1.5 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all text-white font-medium rounded-lg text-sm px-4 py-1.5"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Chat Icon */}
            <Link 
              href="/chat" 
              className="hidden md:flex items-center p-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              </svg>
            </Link>

            {/* Sell Button */}
            <Link href="/create-listing">
              <button className="relative inline-flex items-center justify-center overflow-hidden rounded-lg sm:rounded-xl group transition-all hover:scale-105">
                <span className="px-3 py-2 sm:px-6 sm:py-3 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl font-semibold rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all">
                  + Sell Anything
                </span>
              </button>
            </Link>

            {/* User Menu (Desktop) */}
            <div className="hidden lg:block relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg width="24" height="24" className="dark:text-white" viewBox="0 0 32 32">
                  <path fill="currentColor" d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2ZM10,26.39a6,6,0,0,1,11.94,0,11.87,11.87,0,0,1-11.94,0Zm13.74-1.26a8,8,0,0,0-15.54,0,12,12,0,1,1,15.54,0ZM16,8a5,5,0,1,0,5,5A5,5,0,0,0,16,8Zm0,8a3,3,0,1,1,3-3A3,3,0,0,1,16,16Z" />
                </svg>
                <svg className="w-4 h-4 dark:text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7 10l5 5 5-5z"/>
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-200 dark:border-gray-700">
                  <Link 
                    href="/my-listings" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                    </svg>
                    My Listings
                  </Link>
                  <Link 
                    href="/my-profile" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 32 32">
                      <path fill="currentColor" d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Z" />
                    </svg>
                    My Profile
                  </Link>
                  <Link 
                    href="/chats" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                    Chats
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar - Mobile Only */}
        <div className="mt-4 lg:hidden">
          <form className="max-w-2xl mx-auto" action="/search">   
            <label htmlFor="mobile-search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input 
                type="search" 
                name="q" 
                id="mobile-search" 
                className="block w-full p-2 ps-10 text-xs text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white" 
                placeholder="Search items..."  
                required
              />
              <button 
                type="submit" 
                className="absolute end-1.5 inset-y-1 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all text-white font-medium rounded-lg text-xs px-3 py-1"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </nav>
  )
}

export default Header