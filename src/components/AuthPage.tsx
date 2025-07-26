import { useState } from 'react'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { blink } from '../blink/client'

interface AuthPageProps {
  onBack: () => void
}

export default function AuthPage({ onBack }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      // For now, we'll use the default Blink auth which handles Google
      await blink.auth.login()
    } catch (error) {
      console.error('Google auth failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubAuth = async () => {
    setIsLoading(true)
    try {
      // For now, we'll use the default Blink auth which handles GitHub
      await blink.auth.login()
    } catch (error) {
      console.error('GitHub auth failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    
    setIsLoading(true)
    try {
      await blink.auth.login()
    } catch (error) {
      console.error('Email auth failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="text-lg font-semibold text-gray-900">
              Super Headshot <span className="text-primary">AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-gray-600">
              {authMode === 'signup' 
                ? 'Get started with your professional AI headshots' 
                : 'Sign in to continue to your dashboard'
              }
            </p>
          </div>

          <div className="space-y-4">
            {/* Google Auth */}
            <Button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-3 border-gray-300 hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* GitHub Auth */}
            <Button
              onClick={handleGitHubAuth}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-3 border-gray-300 hover:bg-gray-50"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
              >
                <Mail className="h-4 w-4 mr-2" />
                {authMode === 'signup' ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            {/* Toggle Auth Mode */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  {authMode === 'signup' ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-primary hover:text-primary/80">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:text-primary/80">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}