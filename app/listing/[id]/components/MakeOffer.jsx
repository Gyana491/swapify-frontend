"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function MakeOffer({ listing }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    offerPrice: '',
    message: '',
    phoneNumber: '',
    name: ''
  });

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserDataLoading(true);
        // Get token from cookies
        const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
        const token = tokenCookie ? tokenCookie.split('=')[1] : null;
        
        if (!token) {
          setUserDataLoading(false);
          return;
        }

        // First verify token to get user ID
        const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/auth/verify-token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!verifyResponse.ok) {
          setUserDataLoading(false);
          return;
        }

        const verifyData = await verifyResponse.json();
        if (!verifyData.isLoggedIn) {
          setUserDataLoading(false);
          return;
        }

        // Now get the user ID by calling the backend verify-token directly
        const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/verify-token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!backendResponse.ok) {
          setUserDataLoading(false);
          return;
        }

        const backendData = await backendResponse.json();
        if (backendData.isLoggedIn && backendData.user) {
          setUserData(backendData.user);
        }
      } catch (error) {
        // Silently ignore fetch errors
      } finally {
        setUserDataLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Update form data when userData changes and modal is open
  useEffect(() => {
    if (showModal && userData) {
      setFormData(prev => ({
        ...prev,
        phoneNumber: userData.phone_number || prev.phoneNumber,
        name: userData.full_name || userData.username || prev.name
      }));
    }
  }, [userData, showModal]);

  // Determine if listing has a price greater than 0
  const hasPrice = listing?.price && listing.price > 0;
  const totalSteps = hasPrice ? 4 : 3; // If price > 0: Price -> Message -> Contact -> Summary, else: Message -> Contact -> Summary

  // Reset form when modal opens and pre-fill with user data
  const openModal = () => {
    // Check auth token – if absent, redirect to login
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;
    if (!token) {
      const next = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/';
      router.push(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    }

    setShowModal(true);
    setCurrentStep(1);

    // Pre-fill form with user data if available
    const prefilledData = {
      offerPrice: '',
      message: '',
      phoneNumber: userData?.phone_number || '',
      name: userData?.full_name || userData?.username || ''
    };
    setFormData(prefilledData);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentStep(1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (hasPrice) {
          return formData.offerPrice && parseFloat(formData.offerPrice) > 0;
        } else {
          return formData.message.trim().length > 0;
        }
      case 2:
        if (hasPrice) {
          return formData.message.trim().length > 0;
        } else {
          return formData.name.trim().length > 0 && formData.phoneNumber.length >= 10;
        }
      case 3:
        if (hasPrice) {
          return formData.name.trim().length > 0 && formData.phoneNumber.length >= 10;
        }
        return true; // Summary step
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      if (submitting) return;
      setSubmitting(true);

      const offerData = {
        listingId: listing._id,
        offerAmount: hasPrice ? parseFloat(formData.offerPrice) : 0,
        message: formData.message,
        contactName: formData.name,
        contactPhone: formData.phoneNumber,
      };

      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit offer');
      }

      if (data.success) {
        toast.success('Offer submitted successfully! The seller will review and get back to you.');
        closeModal();
      } else {
        throw new Error(data.message || 'Failed to submit offer');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong while submitting your offer.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    // Step numbering adjustment based on whether listing has price
    const stepNumber = hasPrice ? currentStep : currentStep + 1;

    if (hasPrice && currentStep === 1) {
      // Step 1: Offer Price (only if listing has price > 0)
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              What's your offer?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Current asking price: ₹{listing.price?.toLocaleString('en-IN')}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Offer Price (₹) *
            </label>
            <input
              type="number"
              value={formData.offerPrice}
              onChange={(e) => handleInputChange('offerPrice', e.target.value)}
              placeholder="Enter your offer amount"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="1"
            />
          </div>
        </div>
      );
    }

    if ((hasPrice && currentStep === 2) || (!hasPrice && currentStep === 1)) {
      // Step 2 (with price) or Step 1 (without price): Message
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Add a message
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Let the seller know why you're interested or ask any questions
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Hi! I'm interested in this item..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>
        </div>
      );
    }

    if ((hasPrice && currentStep === 3) || (!hasPrice && currentStep === 2)) {
      // Step 3 (with price) or Step 2 (without price): Contact Details
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Your contact details
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              How should the seller contact you back?
            </p>
            {userDataLoading && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                🔄 Loading your profile information...
              </p>
            )}
            {!userDataLoading && userData && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
                ✓ Pre-filled with your profile information
              </p>
            )}
            {!userDataLoading && !userData && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mb-4">
                ⚠️ Please fill in your contact details manually
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Enter your phone number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      );
    }

    if (currentStep === totalSteps) {
      // Final Step: Summary
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Review your offer
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please review your details before sending
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Item:</span>
              <p className="text-sm text-gray-900 dark:text-white">{listing.title}</p>
            </div>
            
            {hasPrice && (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Offer:</span>
                <p className="text-sm text-gray-900 dark:text-white">₹{formData.offerPrice}</p>
              </div>
            )}
            
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Message:</span>
              <p className="text-sm text-gray-900 dark:text-white">{formData.message}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact:</span>
              <p className="text-sm text-gray-900 dark:text-white">
                {formData.name} - {formData.phoneNumber}
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="w-full sm:w-auto flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-3 text-center"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Make Offer
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Make an Offer
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              {renderStepContent()}
            </div>

            {/* Footer */}
            <div className="flex justify-between gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              
              {currentStep === totalSteps ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Offer'}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!validateCurrentStep()}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 