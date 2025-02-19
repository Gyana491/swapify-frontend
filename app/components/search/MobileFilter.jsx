'use client';
import { useCallback } from 'react';
import categories from '../../data/categories.json';

const MobileFilter = ({ searchParams, setSearchParams }) => {
  const handleInputChange = useCallback((field, value) => {
    setSearchParams(prev => {
      const newParams = { ...prev, [field]: value };
      if (field === 'category') {
        newParams.subcategory = '';
      }
      return newParams;
    });
  }, [setSearchParams]);

  const ranges = [
    { value: "1", label: "Nearby" },
    { value: "5", label: "5 km" },
    { value: "10", label: "10 km" },
    { value: "25", label: "25 km" },
    { value: "50", label: "50 km" },
    { value: "100", label: "100 km" },
    { value: "500", label: "Within State" }
  ];

  return (
    <div className="md:hidden space-y-5 mb-8">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchParams.query}
          onChange={(e) => handleInputChange('query', e.target.value)}
          placeholder="Search for items..."
          className="w-full p-3.5 border border-gray-200 rounded-xl pl-11 pr-4 text-base shadow-sm 
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all
            dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
        />
        <svg 
          className="absolute left-3.5 top-4 w-5 h-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
      </div>

      {/* Filter Sections */}
      <div className="space-y-4">
        {/* Section Label - Range */}
        <div className="px-1">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
            Distance Range
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {ranges.map(range => (
              <button
                key={range.value}
                onClick={() => handleInputChange('range', range.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${searchParams.range === range.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Label - Categories */}
        <div className="px-1">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
            Categories
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleInputChange('category', '')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${!searchParams.category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleInputChange('category', cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${searchParams.category === cat.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategories - Only show if category is selected */}
        {searchParams.category && (
          <div className="px-1">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
              Subcategories
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => handleInputChange('subcategory', '')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${!searchParams.subcategory
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
              >
                All Subcategories
              </button>
              {categories
                .find(cat => cat.id === searchParams.category)
                ?.subcategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => handleInputChange('subcategory', sub)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${searchParams.subcategory === sub
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                  >
                    {sub}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileFilter; 