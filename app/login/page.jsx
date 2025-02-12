import Link from 'next/link';
import { LoginForm } from './components/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>
        
        <LoginForm />
        
        <div className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-purple-600 hover:text-purple-500">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
} 