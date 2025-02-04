"use client";
import { useState } from 'react';

export default function MakeOffer() {
  const [showModal, setShowModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    // Handle offer submission
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full lg:w-2/4 flex items-center justify-center gap-2 text-white bg-yellow-500 hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-300 font-bold text-center rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
      >
        Make Offer
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          {/* ... existing modal code ... */}
        </div>
      )}
    </>
  );
} 