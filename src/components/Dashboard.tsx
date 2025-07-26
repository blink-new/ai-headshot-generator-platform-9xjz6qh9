import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Upload, Sparkles, Download, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Checkbox } from './ui/checkbox'
import { blink } from '../blink/client'
import { useToast } from '../hooks/use-toast'

interface User {
  id: string
  email: string
  displayName?: string
}

interface DashboardProps {
  user: User | null
  onNavigateToLanding: () => void
}

interface Generation {
  id: string
  referenceImages: string[]
  selectedStyle: string
  selectedBackground: string
  generatedImages: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}

type WizardStep = 'welcome' | 'upload' | 'style' | 'background' | 'generate' | 'results'

const STYLE_OPTIONS = [
  { id: 'professional', name: 'Professional', description: 'Clean, corporate look' },
  { id: 'creative', name: 'Creative', description: 'Artistic and modern' },
  { id: 'casual', name: 'Casual', description: 'Relaxed and approachable' },
  { id: 'executive', name: 'Executive', description: 'Leadership presence' }
]

const BACKGROUND_OPTIONS = [
  { id: 'office', name: 'Office', description: 'Professional office setting' },
  { id: 'studio', name: 'Studio', description: 'Clean studio backdrop' },
  { id: 'outdoor', name: 'Outdoor', description: 'Natural outdoor environment' },
  { id: 'gradient', name: 'Gradient', description: 'Modern gradient background' }
]

export default function Dashboard({ user, onNavigateToLanding }: DashboardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedBackground, setSelectedBackground] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [generations, setGenerations] = useState<Generation[]>([])
  const [termsAccepted, setTermsAccepted] = useState(false)
  const { toast } = useToast()

  const loadGenerations = useCallback(async () => {
    try {
      const data = await blink.db.headshotGenerations.list({
        where: { userId: user?.id },
        orderBy: { createdAt: 'desc' }
      })
      
      const formattedGenerations = data.map((gen: any) => ({
        id: gen.id,
        referenceImages: JSON.parse(gen.referenceImages || '[]'),
        selectedStyle: gen.selectedStyle,
        selectedBackground: gen.selectedBackground,
        generatedImages: JSON.parse(gen.generatedImages || '[]'),
        status: gen.status,
        createdAt: gen.createdAt
      }))
      
      setGenerations(formattedGenerations)
    } catch (error) {
      console.error('Failed to load generations:', error)
    }
  }, [user?.id])

  useEffect(() => {
    if (user) {
      loadGenerations()
    }
  }, [user, loadGenerations])

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files)
    setUploadedFiles(fileArray)

    // Upload files to storage
    const urls: string[] = []
    for (const file of fileArray) {
      try {
        const { publicUrl } = await blink.storage.upload(
          file,
          `headshots/${user?.id}/${Date.now()}-${file.name}`,
          { upsert: true }
        )
        urls.push(publicUrl)
      } catch (error) {
        console.error('Upload failed:', error)
        toast({
          title: 'Upload Failed',
          description: 'Failed to upload image. Please try again.',
          variant: 'destructive'
        })
      }
    }
    setUploadedUrls(urls)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleGenerate = async () => {
    if (!termsAccepted) {
      toast({
        title: 'Terms Required',
        description: 'Please accept the terms and conditions to continue.',
        variant: 'destructive'
      })
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setCurrentStep('generate')

    try {
      // Create generation record
      const generationId = `gen_${Date.now()}`
      await blink.db.headshotGenerations.create({
        id: generationId,
        userId: user?.id,
        referenceImages: JSON.stringify(uploadedUrls),
        selectedStyle,
        selectedBackground,
        generatedImages: JSON.stringify([]),
        status: 'processing'
      })

      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Generate headshots using AI
      const stylePrompt = `Create a professional ${selectedStyle} headshot with a ${selectedBackground} background. The person should look confident and professional, with excellent lighting and composition.`
      
      const { data } = await blink.ai.modifyImage({
        images: uploadedUrls,
        prompt: stylePrompt,
        quality: 'high',
        n: 4
      })

      const generatedUrls = data.map(img => img.url)
      setGeneratedImages(generatedUrls)

      // Update generation record
      await blink.db.headshotGenerations.update(generationId, {
        generatedImages: JSON.stringify(generatedUrls),
        status: 'completed'
      })

      setGenerationProgress(100)
      setTimeout(() => {
        setCurrentStep('results')
        setIsGenerating(false)
      }, 1000)

      toast({
        title: 'Success!',
        description: 'Your professional headshots have been generated.',
      })

      loadGenerations()
    } catch (error) {
      console.error('Generation failed:', error)
      setIsGenerating(false)
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate headshots. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleLogout = () => {
    blink.auth.logout()
    onNavigateToLanding()
  }

  const resetWizard = () => {
    setCurrentStep('welcome')
    setUploadedFiles([])
    setUploadedUrls([])
    setSelectedStyle('')
    setSelectedBackground('')
    setGeneratedImages([])
    setTermsAccepted(false)
  }

  const renderWelcomeStep = () => (
    <div className="text-center py-12">
      <div className="mb-8">
        <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your AI Headshot Studio
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your photos into professional headshots in just a few simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Upload className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">1. Upload Photos</h3>
            <p className="text-sm text-gray-600">Upload your reference photos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">2. Choose Style</h3>
            <p className="text-sm text-gray-600">Select your preferred style and background</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Download className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">3. Download</h3>
            <p className="text-sm text-gray-600">Get your professional headshots</p>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={() => setCurrentStep('upload')}
        size="lg"
        className="bg-primary hover:bg-primary/90 text-white px-8"
      >
        Start Creating
      </Button>

      {generations.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Previous Generations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generations.slice(0, 6).map((gen) => (
              <Card key={gen.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {gen.generatedImages.slice(0, 4).map((url, idx) => (
                      <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={url} 
                          alt={`Generated headshot ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={gen.status === 'completed' ? 'default' : 'secondary'}>
                      {gen.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(gen.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderUploadStep = () => (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Photos</h2>
        <p className="text-gray-600">
          Upload 1-5 high-quality photos of yourself. Best results with clear, well-lit photos.
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('file-upload')?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drop your photos here</h3>
            <p className="text-gray-600 mb-4">or click to browse</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Button variant="outline" className="pointer-events-none">
              Choose Files
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Uploaded Photos ({uploadedFiles.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep('style')}
          disabled={uploadedFiles.length === 0}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  )

  const renderStyleStep = () => (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Style</h2>
        <p className="text-gray-600">
          Select the style that best fits your professional needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {STYLE_OPTIONS.map((style) => (
          <Card 
            key={style.id}
            className={`cursor-pointer transition-all ${
              selectedStyle === style.id 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedStyle(style.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{style.name}</h3>
                {selectedStyle === style.id && (
                  <Badge className="bg-primary text-white">Selected</Badge>
                )}
              </div>
              <p className="text-gray-600">{style.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('upload')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep('background')}
          disabled={!selectedStyle}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  )

  const renderBackgroundStep = () => (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Background</h2>
        <p className="text-gray-600">
          Select the background setting for your headshots.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {BACKGROUND_OPTIONS.map((bg) => (
          <Card 
            key={bg.id}
            className={`cursor-pointer transition-all ${
              selectedBackground === bg.id 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedBackground(bg.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{bg.name}</h3>
                {selectedBackground === bg.id && (
                  <Badge className="bg-primary text-white">Selected</Badge>
                )}
              </div>
              <p className="text-gray-600">{bg.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
              I agree to the terms and conditions and understand that AI-generated images 
              may not be perfect and should be reviewed before professional use.
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('style')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleGenerate}
          disabled={!selectedBackground || !termsAccepted}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Generate Headshots
        </Button>
      </div>
    </div>
  )

  const renderGenerateStep = () => (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <Sparkles className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Creating Your Professional Headshots
      </h2>
      <p className="text-gray-600 mb-8">
        Our AI is working its magic. This usually takes 1-2 minutes.
      </p>
      
      <div className="mb-6">
        <Progress value={generationProgress} className="w-full" />
        <p className="text-sm text-gray-500 mt-2">{generationProgress}% complete</p>
      </div>

      <div className="text-sm text-gray-500">
        Please don't close this window while we generate your headshots.
      </div>
    </div>
  )

  const renderResultsStep = () => (
    <div className="max-w-6xl mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Your Professional Headshots Are Ready!
        </h2>
        <p className="text-gray-600">
          Download your favorites or generate new ones with different styles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {generatedImages.map((url, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-100">
                <img 
                  src={url} 
                  alt={`Generated headshot ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button 
          onClick={resetWizard}
          className="bg-primary hover:bg-primary/90 text-white mr-4"
        >
          Create More Headshots
        </Button>
        <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-gray-900">
              Super Headshot <span className="text-primary">AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'welcome' && renderWelcomeStep()}
        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'style' && renderStyleStep()}
        {currentStep === 'background' && renderBackgroundStep()}
        {currentStep === 'generate' && renderGenerateStep()}
        {currentStep === 'results' && renderResultsStep()}
      </main>
    </div>
  )
}