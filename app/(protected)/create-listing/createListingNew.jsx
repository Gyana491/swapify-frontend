"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { IoLocationSharp, IoImageOutline, IoTrashOutline, IoChevronDown, IoClose, IoAdd } from 'react-icons/io5';
import dynamic from 'next/dynamic';
import { compressImage } from '@/app/utils/compressImage';
import categoriesData from '@/app/data/categories.json';

// Dynamically import LocationModal (reusing the existing component)
const LocationModal = dynamic(() => import('./ListingLocationModal'), { ssr: false });

// Constants
const MAX_ADDITIONAL_IMAGES = 9;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const CreateListing = () => {
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    display_name: '',
    lat: '',
    lon: ''
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFreeListing, setIsFreeListing] = useState(false);
  const [prevPrice, setPrevPrice] = useState('');

  // Helpers
  const getSubcategories = () => {
    const selectedCat = categoriesData.find(cat => cat.id === category);
    return selectedCat ? selectedCat.subcategories : [];
  };

  // Validation
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
    if (!coverImageName) newErrors.coverImage = 'Cover image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image validation
  const validateImageFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Please upload JPG, PNG or WebP images only');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Image size should be less than 5MB');
    }
    return true;
  };

  // Cover image change -> compress + upload immediately
  const handleCoverImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      validateImageFile(file);
      const loadingToast = toast.loading('Compressing image...');
      const compressed = await compressImage(file, { quality: 0.8, maxWidth: 1920, maxHeight: 1920, mimeType: 'image/jpeg' });
      if (compressed.size > MAX_FILE_SIZE || !compressed.type.startsWith('image/')) {
        toast.error('Invalid image file', { id: loadingToast });
        e.target.value = '';
        return;
      }
      toast.loading('Uploading cover image...', { id: loadingToast });
      const formData = new FormData();
      formData.append('files', compressed);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to upload cover image');
      const data = await response.json();
      const filename = data?.files?.[0]?.filename;
      if (!filename) throw new Error('Upload did not return filename');
      setCoverImageName(filename);
      setCoverImage(`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${filename}`);
      toast.success('Cover image uploaded!', { id: loadingToast });
      if (errors.coverImage) setErrors(prev => ({ ...prev, coverImage: undefined }));
    } catch (error) {
      toast.error(error.message || 'Failed to process image');
      e.target.value = '';
    }
  };

  // Additional images change -> compress + upload immediately
  const handleAdditionalImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + additionalImages.length > MAX_ADDITIONAL_IMAGES) {
      toast.error(`You can only upload up to ${MAX_ADDITIONAL_IMAGES} additional images`);
      e.target.value = '';
      return;
    }
    try {
      files.forEach(validateImageFile);
      const loadingToast = toast.loading('Compressing images...');
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file, { quality: 0.8, maxWidth: 1920, maxHeight: 1920, mimeType: 'image/jpeg' }))
      );
      toast.loading('Uploading images...', { id: loadingToast });
      const results = await Promise.all(
        compressedFiles.map(async (compressed) => {
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
          return { filename: fname, url: `${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${fname}` };
        })
      );
      setAdditionalImageNames(prev => [...prev, ...results.map(r => r.filename)]);
      setAdditionalImages(prev => [...prev, ...results.map(r => r.url)]);
      toast.success('Images uploaded!', { id: loadingToast });
    } catch (error) {
      toast.error(error.message || 'Failed to upload images');
      e.target.value = '';
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

  // Submit create
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setIsUpdating(true);
    try {
      const finalPrice = isFreeListing ? 0 : parseFloat(price);
      const body = {
        title: title.trim(),
        price: finalPrice,
        description: description.trim(),
        phoneNumber: phoneNumber.trim(),
        coverImageName,
        additionalImageNames,
        category,
        subcategory,
        location: selectedLocation
      };
      const submitToast = toast.loading('Creating listing...');
      const response = await fetch(`/api/create-listing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to create listing');
      toast.success('Listing created successfully!', { id: submitToast });
      router.push('/my-listings');
    } catch (error) {
      console.error('Create error:', error);
      toast.error(error.message || 'Failed to create listing');
    } finally {
      setIsUpdating(false);
    }
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
        {/* Details second on mobile */}
        <div className="space-y-6 order-2 lg:order-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-base ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-4 focus:outline-none placeholder-gray-400`}
                placeholder="What are you selling?"
                maxLength={100}
              />
              {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title}</p>}
            </div>

            {/* Pricing */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-xl bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">List for free</span>
                  {isFreeListing && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Price set to ₹0</span>
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFreeListing ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isFreeListing ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              {!isFreeListing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">₹</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-base ${errors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-4 focus:outline-none placeholder-gray-400`}
                      placeholder="0"
                      min="1"
                      inputMode="numeric"
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-sm mt-2">{errors.price}</p>}
                </div>
              )}
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setSubcategory(''); }}
                    className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 appearance-none text-base bg-white ${errors.category ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-4 focus:outline-none`}
                  >
                    <option value="">Select Category</option>
                    {categoriesData.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                  <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                </div>
                {errors.category && <p className="text-red-500 text-sm mt-2">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
                <div className="relative">
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    disabled={!category}
                    className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 appearance-none text-base bg-white disabled:bg-gray-50 disabled:cursor-not-allowed ${errors.subcategory ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-4 focus:outline-none`}
                  >
                    <option value="">Select Subcategory</option>
                    {getSubcategories().map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                </div>
                {errors.subcategory && <p className="text-red-500 text-sm mt-2">{errors.subcategory}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 resize-none text-base ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-4 focus:outline-none placeholder-gray-400`}
                placeholder="Describe your product in detail..."
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                <span className="text-xs text-gray-400 ml-auto">{description.length}/1000</span>
              </div>
            </div>

            {/* WhatsApp Number */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number *</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-base ${errors.phoneNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-4 focus:outline-none placeholder-gray-400`}
                placeholder="Enter your WhatsApp number"
                inputMode="tel"
                maxLength={15}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-2">{errors.phoneNumber}</p>}
            </div>

            {/* Location Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className={`w-full flex items-center gap-3 p-4 bg-white hover:bg-gray-50 border-2 rounded-xl text-left transition-all duration-200 min-h-[56px] ${errors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-4 focus:outline-none`}
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoLocationSharp className={`h-5 w-5 ${selectedLocation.display_name ? 'text-indigo-600' : 'text-indigo-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-base font-medium truncate ${selectedLocation.display_name ? 'text-gray-900' : 'text-gray-500'}`}>
                    {selectedLocation.display_name || 'Select your location'}
                  </p>
                </div>
              </button>
              {errors.location && <p className="text-red-500 text-sm mt-2">{errors.location}</p>}
            </div>
          </div>
        </div>

        {/* Images first on mobile */}
        <div className="space-y-6 order-1 lg:order-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">

            {/* Cover Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Cover Image *</label>
              <div className="relative">
                {coverImage ? (
                  <div className="relative group">
                    <img src={coverImage} alt="Cover preview" className="w-full h-64 sm:h-72 object-cover rounded-xl border-2 border-gray-200" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-xl flex items-center justify-center">
                      <button type="button" onClick={removeCoverImage} className="opacity-0 group-hover:opacity-100 p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 transform hover:scale-110 shadow-lg">
                        <IoTrashOutline className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="w-full h-64 sm:h-72 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 active:scale-[0.99]">
                      <IoImageOutline className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-base font-medium text-gray-600">Click to upload cover image</p>
                      <p className="text-sm text-gray-400 mt-1">JPG, PNG or WebP (Max 5MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageChange} />
                  </label>
                )}
              </div>
              {errors.coverImage && <p className="text-red-500 text-sm mt-2">{errors.coverImage}</p>}
            </div>

            {/* Additional Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Additional Images ({additionalImages.length}/{MAX_ADDITIONAL_IMAGES})</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {additionalImages.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img src={image} alt={`Additional ${index + 1}`} className="w-full h-full object-cover rounded-lg border-2 border-gray-200" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <button type="button" onClick={() => removeAdditionalImage(index)} className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg">
                        <IoClose className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {additionalImages.length < MAX_ADDITIONAL_IMAGES && (
                  <label className="cursor-pointer aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 active:scale-[0.99] min-h-[80px]">
                    <div className="text-center">
                      <IoAdd className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Add Image</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleAdditionalImagesChange} />
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
              Creating Listing...
            </span>
          ) : (
            'Create Listing'
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
          if (errors.location) setErrors(prev => ({ ...prev, location: undefined }));
        }}
        selectedLocation={selectedLocation}
      />
    </form>
  );
};

export default CreateListing;
