"use client";
import { useRouter } from 'next/navigation';
import { WhatsAppIcon } from './Icons';

export default function ChatWithSeller({ seller }) {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.push(`/messages?seller=${seller}`)}
      className="flex items-center justify-center gap-2 text-white bg-green-700 max-w-sm hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-bold rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
    >
      <WhatsAppIcon />
      Chat With Seller
    </button>
  );
} 