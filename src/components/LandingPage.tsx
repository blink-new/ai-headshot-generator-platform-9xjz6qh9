import { ArrowRight, Star, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { blink } from '../blink/client'

interface LandingPageProps {
  onNavigateToAuth: () => void
  onNavigateToDashboard: () => void
}

export default function LandingPage({ onNavigateToAuth, onNavigateToDashboard }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignUp = () => {
    onNavigateToAuth()
  }

  const handleGoToDashboard = () => {
    onNavigateToDashboard()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">
                Super Headshot <span className="text-primary">AI</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Examples
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Blog
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                FAQ
              </a>
              <Button 
                onClick={handleGoToDashboard}
                className="bg-primary hover:bg-primary/90 text-white px-6"
              >
                Go to Dashboard
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-4 py-4 space-y-4">
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                Examples
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                Blog
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                FAQ
              </a>
              <Button 
                onClick={handleGoToDashboard}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <Badge className="mb-8 bg-orange-50 text-primary border-primary/20 hover:bg-orange-50">
            ✨ AI-Powered Professional Headshots
          </Badge>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Professional{' '}
            <span className="text-primary">AI Headshots</span>
            <br />
            in Minutes
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your photos into stunning professional headshots with our advanced AI technology. 
            Perfect for LinkedIn, resumes, and professional profiles.
          </p>

          {/* CTA Button */}
          <Button 
            onClick={handleSignUp}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold group"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Google Reviews */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600 font-medium">4.9/5 on Google</span>
            </div>

            {/* Trustpilot */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-green-500 text-green-500" />
                ))}
              </div>
              <span className="text-gray-600 font-medium">4.8/5 on Trustpilot</span>
            </div>

            {/* Users count */}
            <div className="text-gray-600 font-medium">
              Trusted by 50,000+ professionals
            </div>
          </div>
        </div>
      </div>

      {/* Sample Headshots Gallery */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See the <span className="text-primary">AI Magic</span>
            </h2>
            <p className="text-xl text-gray-600">
              Real transformations from our users
            </p>
          </div>

          {/* Before/After Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500 mb-2">Before</p>
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">Sample Photo {i}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-primary mb-2">After</p>
                    <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-medium">Professional Headshot</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <Button 
              onClick={handleSignUp}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold group"
            >
              Create Your Headshots
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-4">
              Super Headshot <span className="text-primary">AI</span>
            </div>
            <p className="text-gray-600 mb-8">
              Professional AI headshots in minutes
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}