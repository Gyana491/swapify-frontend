'use client';

import { useState } from 'react';

interface SocialShareProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
}

const SocialShare = ({ 
  title = 'Swapify - Exchange Items Locally',
  text = 'Check out Swapify - the best place to swap and exchange items in your local community!',
  url,
  className = '' 
}: SocialShareProps) => {
  const [isSharing, setIsSharing] = useState(false);

  // Get the current URL dynamically
  const getCurrentUrl = () => {
    if (url) return url;
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  const shareData = {
    title,
    text,
    url: getCurrentUrl()
  };

  const handleShare = async () => {
    if (isSharing) return;
    
    setIsSharing(true);

    try {
      const currentShareData = {
        title,
        text,
        url: getCurrentUrl()
      };

      // Check if Web Share API is supported
      if (navigator.share) {
        // Check if the data can be shared
        if (navigator.canShare && !navigator.canShare(currentShareData)) {
          throw new Error('Share data not supported');
        }
        await navigator.share(currentShareData);
      } else {
        // Fallback: Copy to clipboard and show notification
        const shareUrl = currentShareData.url || (typeof window !== 'undefined' ? window.location.href : '');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
        } else {
          // Even older fallback for clipboard
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Link copied to clipboard!');
        }
      }
    } catch (error) {
      // Handle error silently or show user-friendly message
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fallback: try to copy to clipboard
        try {
          const shareUrl = getCurrentUrl() || (typeof window !== 'undefined' ? window.location.href : '');
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
          } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Link copied to clipboard!');
          }
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          alert('Unable to share or copy link. Please copy the URL manually.');
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`
        flex items-center justify-center p-2 
        text-gray-700 dark:text-gray-200 
        hover:text-gray-900 dark:hover:text-white 
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105 active:scale-95
        ${className}
      `}
      title={isSharing ? "Sharing..." : "Share this page"}
      aria-label={isSharing ? "Sharing in progress" : "Share this page"}
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className={isSharing ? 'animate-pulse' : ''}
      >
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92S19.61 16.08 18 16.08z"/>
      </svg>
    </button>
  );
};

export default SocialShare;