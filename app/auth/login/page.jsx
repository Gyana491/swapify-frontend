"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';


const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Logging in...');
    
    try {
      setIsLoading(true);
      const response = await axios.post('/api/auth/login', { email, password });
      const data = response.data;
      document.cookie = `token=${data.token}; path=/;`;
      toast.success('Login successful!', { id: loadingToast });
      router.push('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK') {
          toast.error('Network error. Please check your connection.', { id: loadingToast });
        } else {
          toast.error(error.response?.data?.message || 'Login failed', { id: loadingToast });
        }
      } else {
        toast.error('An unexpected error occurred', { id: loadingToast });
      }
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center dark:bg-gray-900">
        <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1 dark:bg-gray-800">
          <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
            <Link href="/">   
              <Image
                src="/assets/Swapify.jpg"
                alt="Swapify Logo"
                width={128}
                height={128}
                className="w-32 mx-auto rounded"
              />
            </Link>
            
            <div className="mt-12 flex flex-col items-center">
              <h1 className="text-2xl xl:text-3xl font-extrabold dark:text-white">
                Login to Swapify
              </h1>
              
              <div className="w-full flex-1 mt-8">
                <form onSubmit={handleSubmit}>
                  <div className="mx-auto max-w-xs">
                    <input
                      className="text-md block px-3 py-2 rounded-lg w-full 
                        bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md
                        focus:placeholder-gray-500 focus:bg-white 
                        focus:border-gray-600 focus:outline-none"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                    <div className="py-2 relative">
                      <input
                        className="text-md block px-3 py-2 rounded-lg w-full 
                          bg-white border-2 border-gray-300 placeholder-gray-600 shadow-md
                          focus:placeholder-gray-500 focus:bg-white 
                          focus:border-gray-600 focus:outline-none"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-6 text-gray-700" />
                        ) : (
                          <EyeIcon className="h-6 text-gray-700" />
                        )}
                      </button>
                    </div>

                    {validationMessage && (
                      <p className="text-center text-orange-500 italic text-sm">
                        {validationMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none disabled:bg-indigo-300"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <svg
                            className="w-6 h-6 -ml-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <path d="M20 8v6M23 11h-6" />
                          </svg>
                          <span className="ml-3">Login</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="flex w-full items-center gap-2 py-6 text-sm text-slate-600">
                  <div className="h-px w-full bg-slate-200"></div>
                  <p className="dark:text-white">OR</p>
                  <div className="h-px w-full bg-slate-200"></div>
                </div>

                <p className="mt-2 text-center dark:text-white">
                  Don&apos;t Have an Account
                </p>
                
                <Link href="/auth/register">
                  <button className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
                    <span className="ml-3">Create a New Account</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
    <path fill="currentColor" d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z" />
  </svg>
);

const EyeOffIcon = ({ className }) => (
  <svg className={className} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
    <path fill="currentColor" d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z" />
  </svg>
);

export default Login;
