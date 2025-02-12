"use client";
import { useRouter } from 'next/navigation';

export default function ChatWithSeller({ listing }) {
    const router = useRouter();

    const handleChatClick = () => {
        // Use dummy chat ID
        const chatId = `dummy_chat_${listing._id}`;
        router.push(`/chat/${chatId}`);
    };

    return (
        <button 
            onClick={handleChatClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-6 py-3 text-center"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.89 5.83L2.29 22l4.17-1.59c1.57 1.01 3.44 1.6 5.54 1.6 5.52 0 10-4.48 10-10S17.52 2 12 2zm.89 14.14l-.12.06c-.92.44-1.92.64-2.77.64-1.55 0-2.94-.59-3.89-1.54-.95-.95-1.54-2.34-1.54-3.89s.59-2.94 1.54-3.89c.95-.95 2.34-1.54 3.89-1.54s2.94.59 3.89 1.54c.95.95 1.54 2.34 1.54 3.89 0 .84-.19 1.84-.64 2.77l-.06.12 1.17 3.14-3.14-1.17z"/>
            </svg>
            Chat with Seller
        </button>
    );
} 