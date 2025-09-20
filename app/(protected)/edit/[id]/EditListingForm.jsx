"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getToken } from '@/app/utils/getToken';
import { IoLocationSharp, IoImageOutline, IoTrashOutline, IoChevronDown, IoClose, IoAdd } from 'react-icons/io5';
import dynamic from 'next/dynamic';
import { compressImage } from '@/app/utils/compressImage';
import categoriesData from '@/app/data/categories.json';

// Dynamically import LocationModal
const LocationModal = dynamic(() => import('../../create-listing/ListingLocationModal'), {
  ssr: false
});

// Add constants
const MAX_ADDITIONAL_IMAGES = 9;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const EditListingForm = ({ listingId }) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageName, setCoverImageName] = useState('');
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImageNames, setAdditionalImageNames] = useState([]);
  const [isFreeListing, setIsFreeListing] = useState(false);
  const [prevPrice, setPrevPrice] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState({
    display_name: '',
    lat: '',
    lon: ''
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [errors, setErrors] = useState({});

  // Get available subcategories based on selected category
  const getSubcategories = () => {
    const selectedCat = categoriesData.find(cat => cat.id === category);
    return selectedCat ? selectedCat.subcategories : [];
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        const token = getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/listings/${listingId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch listing');
        const data = await response.json();

        // Update form fields
        setTitle(data.title || '');
  setPrice(data.price?.toString() || '');
  setIsFreeListing(Number(data.price) === 0);
  if (Number(data.price) === 0) setPrevPrice('');
        setCategory(data.category || '');
        setSubcategory(data.subcategory || '');
        setDescription(data.description || '');
        setPhoneNumber(data.seller_no || '');
        
        // Set location data
        setSelectedLocation({
          display_name: data.location_display_name || '',
          lat: data.location?.coordinates?.[1] || '',
          lon: data.location?.coordinates?.[0] || ''
        });

        // Set images with CDN URLs and keep filenames
        if (data.cover_image) {
          setCoverImage(`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${data.cover_image}`);
          setCoverImageName(data.cover_image);
        }
        
        if (data.additional_images?.length) {
          setAdditionalImages(
            data.additional_images.map(img => 
              `${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${img}`
            )
          );
          setAdditionalImageNames(data.additional_images);
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast.error('Failed to load listing details');
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!isFreeListing) {
      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        newErrors.price = 'Valid price is required';
      }
    }
    if (!category) newErrors.category = 'Category is required';
    if (!subcategory) newErrors.subcategory = 'Subcategory is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!selectedLocation.display_name) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Note: images are uploaded on selection; no upload here

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsUpdating(true);

    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');

      const updateToast = toast.loading('Updating listing...');
      const finalPrice = isFreeListing ? 0 : parseFloat(price);
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          price: finalPrice,
          description: description.trim(),
          phoneNumber: phoneNumber.trim(),
          coverImageName,
          additionalImageNames,
          category,
          subcategory,
          location: selectedLocation
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to update listing');
      
      toast.success('Listing updated successfully!', { id: updateToast });
      router.push('/my-listings');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update listing');
    } finally {
      setIsUpdating(false);
    }
  };

  // Image handling functions
  const validateImageFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Please upload JPG, PNG or WebP images only');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Image size should be less than 5MB');
    }
    return true;
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file);
      
      const loadingToast = toast.loading('Compressing image...');

      // Compress the image
      const compressed = await compressImage(file, { 
        quality: 0.8, 
        maxWidth: 1920, 
        maxHeight: 1920, 
        mimeType: 'image/jpeg' 
      });

      // Validate post-compression size/type
      if (compressed.size > MAX_FILE_SIZE) {
        toast.error('Image size should be less than 5MB', { id: loadingToast });
        e.target.value = '';
        return;
      }
      if (!compressed.type.startsWith('image/')) {
        toast.error('Please upload a valid image file', { id: loadingToast });
        e.target.value = '';
        return;
      }

      // Upload to server
      toast.loading('Uploading cover image...', { id: loadingToast });
      const formData = new FormData();
      formData.append('files', compressed);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload cover image');
      }
      const data = await response.json();
      const filename = data?.files?.[0]?.filename;
      if (!filename) throw new Error('Upload did not return filename');

      setCoverImageName(filename);
      setCoverImage(`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${filename}`);
      toast.success('Cover image uploaded!', { id: loadingToast });
      
      // Clear error if exists
      if (errors.coverImage) {
        setErrors(prev => ({ ...prev, coverImage: undefined }));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to process image');
      e.target.value = ''; // Reset input
    }
  };

  const handleAdditionalImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + additionalImages.length > MAX_ADDITIONAL_IMAGES) {
      toast.error(`You can only upload up to ${MAX_ADDITIONAL_IMAGES} additional images`);
      e.target.value = ''; // Reset input
      return;
    }

    try {
      // Validate all files first
      files.forEach(validateImageFile);
      
      const loadingToast = toast.loading('Compressing images...');
      
      // Compress all images
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file, { 
          quality: 0.8, 
          maxWidth: 1920, 
          maxHeight: 1920, 
          mimeType: 'image/jpeg' 
        }))
      );

      // Upload each compressed file
      toast.loading('Uploading images...', { id: loadingToast });
      const uploadPromises = compressedFiles.map(async (compressed) => {
        if (compressed.size > MAX_FILE_SIZE || !compressed.type.startsWith('image/')) {
          throw new Error('Invalid image');
        }
        const formData = new FormData();
        formData.append('files', compressed);
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        const fname = data?.files?.[0]?.filename;
        if (!fname) throw new Error('Upload did not return filename');
        return {
          filename: fname,
          url: `${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${fname}`
        };
      });

      const results = await Promise.all(uploadPromises);
      setAdditionalImageNames(prev => [...prev, ...results.map(r => r.filename)]);
      setAdditionalImages(prev => [...prev, ...results.map(r => r.url)]);
      
      toast.success('Images uploaded!', { id: loadingToast });
    } catch (error) {
      toast.error(error.message || 'Failed to upload images');
      e.target.value = ''; // Reset input
    }
  };

  const removeCoverImage = () => {
    setCoverImage('');
    setCoverImageName('');
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setAdditionalImageNames(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-48 bg-gray-300 rounded-xl"></div>
              <div className="h-12 bg-gray-300 rounded-xl"></div>
              <div className="h-12 bg-gray-300 rounded-xl"></div>
            </div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-300 rounded-xl"></div>
              <div className="h-12 bg-gray-300 rounded-xl"></div>
              <div className="h-32 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Left Column - Product Details */}
        <div className="space-y-6 order-2 lg:order-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-shadow duration-200">
            
            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  ${errors.title 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:border-indigo-400'
                  } focus:ring-4 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500`}
                placeholder="What are you selling?"
                maxLength={100}
              />
              {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title}</p>}
            </div>

            {/* Pricing */}
            <div className="mb-6 space-y-3">
              {/* Free listing toggle */}
              <div className="flex items-center justify-between p-3 border rounded-xl bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">List for free</span>
                  {isFreeListing && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Price set to ₹0</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsFreeListing((prev) => {
                      const next = !prev;
                      if (next) {
                        setPrevPrice(price);
                        setPrice('0');
                        if (errors.price) setErrors((p) => ({ ...p, price: undefined }));
                      } else {
                        setPrice(prevPrice || '');
                      }
                      return next;
                    });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFreeListing ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 transition-transform ${isFreeListing ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Price Input (hidden when free) */}
              {!isFreeListing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg font-medium">₹</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                        ${errors.price 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-500' 
                          : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:border-indigo-400'
                        } focus:ring-4 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500`}
                      placeholder="0"
                      min="1"
                      inputMode="numeric"
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-sm mt-2">{errors.price}</p>}
                </div>
              )}
            </div>

            {/* Category Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubcategory('');
                    }}
                    className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 appearance-none text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                      ${errors.category 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:border-indigo-400'
                      } focus:ring-4 focus:outline-none`}
                  >
                    <option value="">Select Category</option>
                    {categoriesData.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none w-5 h-5" />
                </div>
                {errors.category && <p className="text-red-500 text-sm mt-2">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Subcategory *
                </label>
                <div className="relative">
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    disabled={!category}
                    className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 appearance-none text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                      ${errors.subcategory 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:border-indigo-400'
                      } focus:ring-4 focus:outline-none`}
                  >
                    <option value="">Select Subcategory</option>
                    {getSubcategories().map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none w-5 h-5" />
                </div>
                {errors.subcategory && <p className="text-red-500 text-sm mt-2">{errors.subcategory}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 resize-none text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  ${errors.description 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:border-indigo-400'
                  } focus:ring-4 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500`}
                placeholder="Describe your product in detail..."
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{description.length}/1000</span>
              </div>
            </div>

            {/* Phone Number */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  ${errors.phoneNumber 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:border-indigo-400'
                  } focus:ring-4 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500`}
                placeholder="Enter your WhatsApp number"
                inputMode="tel"
                maxLength={15}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-2">{errors.phoneNumber}</p>}
            </div>

            {/* Location Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Location *
              </label>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className={`w-full flex items-center gap-3 p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 rounded-xl text-left transition-all duration-200 min-h-[56px]
                  ${errors.location 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:border-indigo-400'
                  } focus:ring-4 focus:outline-none`}
              >
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoLocationSharp className={`h-5 w-5 ${selectedLocation.display_name ? 'text-indigo-600' : 'text-indigo-400 dark:text-indigo-300'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-base font-medium truncate ${selectedLocation.display_name ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {selectedLocation.display_name || 'Select your location'}
                  </p>
                </div>
              </button>
              {errors.location && <p className="text-red-500 text-sm mt-2">{errors.location}</p>}
            </div>
          </div>
        </div>

  {/* Right Column - Images */}
  <div className="space-y-6 order-1 lg:order-2">
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-shadow duration-200">
            
            {/* Cover Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                Cover Image *
              </label>
              <div className="relative">
                {coverImage ? (
                  <div className="relative group">
                    <img 
                      src={coverImage} 
                      alt="Cover preview" 
                      className="w-full h-64 sm:h-72 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-xl flex items-center justify-center">
                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="opacity-0 group-hover:opacity-100 p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 transform hover:scale-110 shadow-lg"
                      >
                        <IoTrashOutline className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="w-full h-64 sm:h-72 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 active:scale-[0.99]">
                      <IoImageOutline className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-base font-medium text-gray-600 dark:text-gray-300">Click to upload cover image</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">JPG, PNG or WebP (Max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Additional Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                Additional Images ({additionalImages.length}/{MAX_ADDITIONAL_IMAGES})
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {additionalImages.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img 
                      src={image} 
                      alt={`Additional ${index + 1}`} 
                      className="w-full h-full object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg"
                      >
                        <IoClose className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {additionalImages.length < MAX_ADDITIONAL_IMAGES && (
                  <label className="cursor-pointer aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 active:scale-[0.99] min-h-[80px]">
                    <div className="text-center">
                      <IoAdd className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-600 dark:text-gray-300">Add Image</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* Standalone Submit Button at Bottom */}
      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          disabled={isUpdating}
          className="px-6 py-4 min-w-[220px] text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-base"
        >
          {isUpdating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Updating Listing...
            </span>
          ) : (
            'Update Listing'
          )}
        </button>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelect={(location) => {
          setSelectedLocation(location);
          setIsLocationModalOpen(false);
          if (errors.location) {
            setErrors(prev => ({ ...prev, location: undefined }));
          }
        }}
        selectedLocation={selectedLocation}
      />
    </form>
  );
};

export default EditListingForm;
