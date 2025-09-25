'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import UserAvatar from '../UserAvatar'

const UserMenu = () => {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userData, setUserData] = useState(null)
  const [token, setToken] = useState(null)

  // Safely extract the token from document.cookie
  useEffect(() => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='))
    const extractedToken = tokenCookie ? tokenCookie.split('=')[1] : null
    setToken(extractedToken)
  }, [])

  // Fetch the user data if logged in
  useEffect(() => {
    if (!token) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/auth/verify-token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData(null);
      }
    };

    fetchUserData();
  }, [token]);

  if (!token) {
    return (
      <Link
        href="/auth/login"
        aria-label="Sign In"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            router.push('/auth/login')
          }
        }}
        className="relative inline-flex items-center justify-center overflow-hidden rounded-xl group transition-all hover:scale-105"
      >
        <span className="px-4 py-2 lg:px-6 lg:py-3 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl font-semibold rounded-xl text-sm transition-all">
          Sign In
        </span>
      </Link>
    )
  }

  const handleLogout = () => {
    // Delete the token cookie securely
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    toast.success('Logged out successfully!')
    router.push('/auth/login')
  }

  return (
    <div className="relative z-40">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label="User menu"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsDropdownOpen(!isDropdownOpen)
          }
        }}
        className="flex items-center gap-1 p-1.5 lg:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <UserAvatar 
          user={userData} 
          size={35}
          className="lg:w-[35px] lg:h-[35px] w-8 h-8" 
        />

        <svg className="w-4 h-4 dark:text-white" viewBox="0 0 24 24">
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 lg:w-56 bg-white dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg py-2 border border-gray-100 dark:border-gray-700 z-50">
          <Link
            href="/my-listings"
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <svg className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24">
              <path fill="currentColor" d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
            </svg>
            My Listings
          </Link>
          <Link
            href="/my-profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <svg className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" viewBox="0 0 32 32">
              <path fill="currentColor" d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Z" />
            </svg>
            My Profile
          </Link>
          <div className="h-[1px] bg-gray-100 dark:bg-gray-700 my-1.5"></div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu