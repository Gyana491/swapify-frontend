'use client';

import Link from "next/link";
import { useOffersCount } from "../../hooks/useOffersCount";
import { getToken } from "../../utils/getToken";
import { useEffect, useState } from "react";

interface OffersButtonProps {
	className?: string;
	showText?: boolean;
}

const OffersButton = ({ className = "", showText = false }: OffersButtonProps) => {
	const { offersCount, loading } = useOffersCount();
	const total = offersCount.totalOffers;
	// Prevent hydration mismatch by gating cookie access / badge until mounted
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const isLoggedIn = mounted && Boolean(getToken());

	return (
		<Link 
			href="/offers" 
			className={`relative flex items-center gap-2 p-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors ${className}`}
		>
			<div className="relative">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
					<path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6h4v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
					<path d="M7 11h4v2H7zM13 11h4v2h-4zM7 15h4v2H7zM13 15h4v2h-4z"/>
				</svg>
				{/* Badge (render only after mount to avoid SSR/client mismatch) */}
				{mounted && isLoggedIn && (
					<span
						className={`absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-bold text-white ${
							loading ? 'bg-gray-400' : total > 0 ? 'bg-purple-600' : 'bg-gray-400'
						}`}
						aria-label={loading ? 'Loading offers' : `${total} total offers`}
					>
						{loading ? '…' : Math.min(total, 99)}
					</span>
				)}
			</div>
			{showText && <span className="text-sm font-medium">Offers</span>}
		</Link>
	);
}

export default OffersButton;

