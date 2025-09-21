'use client';

import MakeOffer from './MakeOffer';

export default function ListingActions({ listing }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Actions
      </h2>
      
      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <MakeOffer listing={listing} />
      </div>
    </div>
  );
} 