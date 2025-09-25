import Link from 'next/link'
import Image from 'next/image'
import Header from '@/app/components/header/Header'
import MobileNavigation from '@/app/components/MobileNavigation'
import UserAvatar from '@/app/components/UserAvatar'
// Removed grid card in favor of list view on this page

// Server helpers
async function getUser(userId) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST || ''}/api/users/${userId}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch (e) {
    return null
  }
}

async function getUserListings(userId, page = 1, limit = 12) {
  try {
    const base = process.env.NEXT_PUBLIC_HOST || ''
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) }).toString()
    const res = await fetch(`${base}/api/users/${userId}/listings?${qs}`, { cache: 'no-store' })
    if (!res.ok) return { listings: [], total: 0, page: 1, totalPages: 1 }
    return res.json()
  } catch (e) {
    return { listings: [], total: 0, page: 1, totalPages: 1 }
  }
}

export default async function UserProfile({ params, searchParams }) {
  const { userid } = await params
  const page = Number((await searchParams)?.page || 1)
  const [user, listingsData] = await Promise.all([
    getUser(userid),
    getUserListings(userid, page)
  ])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
        User not found
      </div>
    )
  }

  const displayName = user?.full_name || user?.username || 'User'
  const handle = user?.username ? `@${user.username}` : ''
  const joinedText = (() => {
    try {
      if (!user?.created_at) return null
      const d = new Date(user.created_at)
      if (isNaN(d.getTime())) return null
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    } catch {
      return null
    }
  })()

  const listings = Array.isArray(listingsData?.listings) ? listingsData.listings : []
  const totalPages = Number(listingsData?.totalPages || 1)

  const formatPrice = (price) => {
    if (price === 0) return 'Free'
    if (typeof price !== 'number') return ''
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatDistance = (distance) => {
    if (!distance && distance !== 0) return null
    if (distance === 0) return 'On Spot'
    if (distance < 1) return `${Math.round(distance * 1000)}m away`
    return `${Math.round(distance * 10) / 10}km away`
  }
  
  const formatRelativeTime = (dateLike) => {
    try {
      const d = new Date(dateLike)
      if (isNaN(d.getTime())) return ''
      const diffMs = Date.now() - d.getTime()
      const sec = Math.floor(diffMs / 1000)
      if (sec < 5) return 'just now'
      if (sec < 60) return `${sec} ${sec === 1 ? 'second' : 'seconds'} ago`
      const min = Math.floor(sec / 60)
      if (min < 60) return `${min} ${min === 1 ? 'minute' : 'minutes'} ago`
      const hr = Math.floor(min / 60)
      if (hr < 24) return `${hr} ${hr === 1 ? 'hour' : 'hours'} ago`
      const day = Math.floor(hr / 24)
      if (day < 30) return `${day} ${day === 1 ? 'day' : 'days'} ago`
      const month = Math.floor(day / 30)
      if (month < 12) return `${month} ${month === 1 ? 'month' : 'months'} ago`
      const year = Math.floor(month / 12)
      return `${year} ${year === 1 ? 'year' : 'years'} ago`
    } catch {
      return ''
    }
  }

  const Pagination = () => (
    <div className="mt-6 flex justify-center gap-2">
      <Link
        href={{ pathname: `/u/${userid}`, query: { page: Math.max(1, page - 1) } }}
        aria-disabled={page <= 1}
        className={`px-3 py-1 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
      >
        Prev
      </Link>
      <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300">Page {page} of {totalPages}</span>
      <Link
        href={{ pathname: `/u/${userid}`, query: { page: Math.min(totalPages, page + 1) } }}
        aria-disabled={page >= totalPages}
        className={`px-3 py-1 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
      >
        Next
      </Link>
    </div>
  )

  return (
    <>
      <Header />
      <MobileNavigation />

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-6 sm:py-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile */}
        <div className="block lg:hidden mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500">
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <UserAvatar 
                  user={user} 
                  size={128} 
                  className="rounded-full border-4 border-white shadow-lg"
                />
              </div>
            </div>
            <div className="pt-16 px-4 pb-4">
              <div className="text-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{displayName}</h1>
                {handle && <p className="text-sm text-gray-600 dark:text-gray-300">{handle}</p>}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"><p className="text-xl font-bold text-center text-gray-900 dark:text-white">{listingsData?.total || 0}</p><p className="text-center text-xs text-gray-600 dark:text-gray-300">Listings</p></div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"><p className="text-xl font-bold text-center text-gray-900 dark:text-white">{joinedText || '—'}</p><p className="text-center text-xs text-gray-600 dark:text-gray-300">Joined</p></div>
              </div>
              {(user?.city || user?.state || user?.country) && (
                <div className="mt-4 flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <svg className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-sm">{[user?.city, user?.state, user?.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden sticky top-8">
              <div className="relative h-32 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500">
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 lg:left-8 lg:transform-none">
                  <UserAvatar 
                    user={user} 
                    size={128} 
                    className="rounded-full border-4 border-white shadow-lg"
                  />
                </div>
              </div>
              <div className="pt-20 px-6 pb-6">
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{displayName}</h1>
                  {handle && <p className="text-sm text-gray-600 dark:text-gray-300">{handle}</p>}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"><p className="text-xl font-bold text-center text-gray-900 dark:text-white">{listingsData?.total || 0}</p><p className="text-center text-xs text-gray-600 dark:text-gray-300">Listings</p></div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"><p className="text-xl font-bold text-center text-gray-900 dark:text-white">{joinedText || '—'}</p><p className="text-center text-xs text-gray-600 dark:text-gray-300">Joined</p></div>
                </div>
                {(user?.city || user?.state || user?.country) && (
                  <div className="mt-4 flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <svg className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-sm">{[user?.city, user?.state, user?.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-5">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">{listings.length > 0 ? 'Active Listings' : 'No Active Listings'}</h2>
              {listings.length > 0 ? (
                <>
                  <ul className="space-y-3">
                    {listings.map((listing) => {
                      const imageUrl = listing?.cover_image
                        ? `${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${listing.cover_image}`
                        : '/assets/place-holder.jpg'
                      return (
                        <li key={listing._id} className="p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                          <div className="flex gap-3 sm:gap-4 items-center">
                            <Link href={`/listing/${listing._id}`} className="relative w-24 h-16 sm:w-28 sm:h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                              <Image src={imageUrl} alt={listing?.title || 'Listing'} fill sizes="112px" className="object-cover" />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-baseline gap-2">
                                <Link href={`/listing/${listing._id}`} className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white hover:underline truncate">
                                  {listing?.title || 'Untitled'}
                                </Link>
                              </div>
                              {/* Description removed for a cleaner, price-forward card */}
                              <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {/* Prominent price badge for quick scanning */}
                                {typeof listing?.price === 'number' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-violet-600 text-white dark:bg-violet-500">
                                    {formatPrice(listing.price)}
                                  </span>
                                )}
                                {listing?.location_display_name && (
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="truncate max-w-[240px]">{listing.location_display_name}</span>
                                  </span>
                                )}
                                {listing?.distance != null && (
                                  <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    {formatDistance(listing.distance)}
                                  </span>
                                )}
                                {listing?.created_at && (
                                  <time dateTime={new Date(listing.created_at).toISOString()}>
                                    {formatRelativeTime(listing.created_at)}
                                  </time>
                                )}
                              </div>
                            </div>
                            <div className="hidden sm:block flex-shrink-0">
                              <Link href={`/listing/${listing._id}`} className="inline-flex items-center px-2.5 py-1 text-xs sm:text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                View
                              </Link>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  {totalPages > 1 && <Pagination />}
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">This user hasn't posted any listings yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}