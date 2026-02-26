import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera, Car, FileText, DollarSign, Zap, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Claims Assessment
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-6xl">
            Insurance Claims
            <br />
            <span className="text-zinc-500 dark:text-zinc-400">Made Simple</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Upload photos of vehicle damage and let AI instantly analyze your claim.
            Get accurate assessments including vehicle details, damage summaries, and repair cost estimates.
          </p>
          <div className="mt-10 flex gap-4">
            <Button size="lg" asChild>
              <Link href="/upload">
                <Camera className="mr-2 h-5 w-5" />
                Start Assessment
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#how-it-works">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          How It Works
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50">
                <Camera className="h-6 w-6 text-zinc-50 dark:text-zinc-900" />
              </div>
              <CardTitle>1. Upload Photos</CardTitle>
              <CardDescription>
                Take clear photos of the vehicle damage from multiple angles
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50">
                <Zap className="h-6 w-6 text-zinc-50 dark:text-zinc-900" />
              </div>
              <CardTitle>2. AI Analysis</CardTitle>
              <CardDescription>
                Our AI instantly analyzes the images to identify damage and vehicle details
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50">
                <FileText className="h-6 w-6 text-zinc-50 dark:text-zinc-900" />
              </div>
              <CardTitle>3. Get Report</CardTitle>
              <CardDescription>
                Receive a comprehensive claim report with all the information you need
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          What You Get
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <Car className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />
              <CardTitle className="text-lg">Vehicle Identification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Automatic detection of vehicle make, model, color, and year from uploaded images.
              </p>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <FileText className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />
              <CardTitle className="text-lg">Damage Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Detailed textual description of all visible damage, severity assessment, and affected areas.
              </p>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <DollarSign className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />
              <CardTitle className="text-lg">Cost Estimate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                AI-generated repair cost estimates based on damage analysis and current market rates.
              </p>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <Zap className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />
              <CardTitle className="text-lg">Instant Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Get your assessment in seconds, not days. No waiting for manual reviews.
              </p>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <Shield className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />
              <CardTitle className="text-lg">Secure Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Your images and data are processed securely with enterprise-grade encryption.
              </p>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <Camera className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />
              <CardTitle className="text-lg">Multi-Angle Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Upload multiple photos from different angles for more comprehensive damage assessment.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-zinc-200 bg-zinc-900 text-zinc-50 dark:border-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mt-4 max-w-lg text-zinc-400 dark:text-zinc-600">
              Upload your first damage photo and experience the future of insurance claims processing.
            </p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link href="/upload">
                <Camera className="mr-2 h-5 w-5" />
                Start Your Assessment
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            AI Insurance Claims Demo - Powered by AI
          </p>
        </div>
      </footer>
    </div>
  )
}
