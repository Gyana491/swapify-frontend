'use client'

import { useMemo, useEffect, useState } from 'react'
import Image from 'next/image'

const GRADIENTS = [
	'from-purple-500 to-purple-600',
	'from-blue-500 to-blue-600',
	'from-pink-500 to-pink-600',
	'from-emerald-500 to-emerald-600',
	'from-orange-500 to-orange-600',
	'from-teal-500 to-teal-600',
	'from-red-500 to-red-600',
	'from-indigo-500 to-indigo-600',
	'from-cyan-500 to-cyan-600',
	'from-amber-500 to-amber-600'
]

const resolveUploadedAvatar = (value) => {
	if (!value) return null
	if (/^(data:|https?:\/\/)/i.test(value)) {
		return value
	}

	const base = process.env.NEXT_PUBLIC_MEDIACDN || ''

	if (value.startsWith('/')) {
		return base ? `${base}${value}` : value
	}

	if (!base) {
		return `/uploads/${value}`
	}

	return `${base}/uploads/${value}`
}

const normaliseGoogleAvatar = (value) => {
	if (!value) return null
	return value.includes('=s96-c') ? value.replace('=s96-c', '=s256-c') : value
}

const getDisplayName = (user) => {
	if (!user) return ''
	return (
		user.full_name ||
		user.first_name ||
		user.username ||
		user.name ||
		user.email ||
		''
	)
}

const getInitials = (name) => {
	if (!name) return '?'
	const parts = name.trim().split(/\s+/)
	if (parts.length === 1) {
		return parts[0][0]?.toUpperCase() || '?'
	}
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const useGradients = (seed) => useMemo(() => {
	if (!seed) return GRADIENTS[0]
	const charCode = seed.toUpperCase().charCodeAt(0)
	return GRADIENTS[charCode % GRADIENTS.length]
}, [seed])

const UserAvatar = ({
	user,
	size = 40,
	className = '',
	showBorder = false,
	borderWidth = 2,
	alt
}) => {
	const displayName = getDisplayName(user)
	const initials = getInitials(displayName)
	const gradient = useGradients(initials)

	const uploadedSrc = resolveUploadedAvatar(user?.user_avatar)
	const googleSrc = normaliseGoogleAvatar(user?.google_user_avatar)

	const [uploadedError, setUploadedError] = useState(false)
	const [googleError, setGoogleError] = useState(false)

	useEffect(() => {
		setUploadedError(false)
		setGoogleError(false)
	}, [uploadedSrc, googleSrc])

		const borderClass = useMemo(() => {
			if (!showBorder) return ''
			if (borderWidth === 4) return 'ring-4 ring-white dark:ring-gray-800'
			if (borderWidth === 3) return 'ring-[3px] ring-white dark:ring-gray-800'
			return 'ring-2 ring-white dark:ring-gray-800'
		}, [showBorder, borderWidth])

		const containerStyle = {
		width: size,
		height: size
	}

	const fallback = (
		<div
			className={`flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white font-semibold select-none`}
		>
			<span style={{ fontSize: Math.max(12, size * 0.4) }}>{initials}</span>
		</div>
	)

	if (uploadedSrc && !uploadedError) {
		return (
			<span
				className={`relative inline-flex overflow-hidden rounded-xl ${borderClass} ${className}`}
				style={containerStyle}
			>
				<Image
					src={uploadedSrc}
					alt={alt || `${displayName || 'User'} avatar`}
					width={size}
					height={size}
					className="h-full w-full object-cover"
					onError={() => setUploadedError(true)}
				/>
			</span>
		)
	}

	if (googleSrc && !googleError) {
		return (
			<span
				className={`relative inline-flex overflow-hidden rounded-xl ${borderClass} ${className}`}
				style={containerStyle}
			>
				<Image
					src={googleSrc}
					alt={alt || `${displayName || 'User'} avatar`}
					width={size}
					height={size}
					className="h-full w-full object-cover"
					onError={() => setGoogleError(true)}
				/>
			</span>
		)
	}

	return (
		<span
			className={`relative inline-flex overflow-hidden rounded-xl ${borderClass} ${className}`}
			style={containerStyle}
		>
			{fallback}
		</span>
	)
}

export const SmallAvatar = ({ user, className = '', showBorder = false }) => (
	<UserAvatar user={user} size={28} className={className} showBorder={showBorder} />
)

export const CompactAvatar = ({ user, className = '', showBorder = false }) => (
	<UserAvatar user={user} size={32} className={className} showBorder={showBorder} />
)

export const MediumAvatar = ({ user, className = '', showBorder = false }) => (
	<UserAvatar user={user} size={40} className={className} showBorder={showBorder} />
)

export const LargeAvatar = ({ user, className = '', showBorder = false, borderWidth = 3 }) => (
	<UserAvatar user={user} size={64} className={className} showBorder={showBorder} borderWidth={borderWidth} />
)

export const XLAvatar = ({ user, className = '', showBorder = false, borderWidth = 4 }) => (
	<UserAvatar user={user} size={128} className={className} showBorder={showBorder} borderWidth={borderWidth} />
)

export default UserAvatar
