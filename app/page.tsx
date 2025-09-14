import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Palette, Smartphone, Zap, Users, Globe, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AN</span>
            </div>
            <span className="font-bold text-xl">Arionys Profile</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/explore">
              <Button variant="ghost">Explore</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            ✨ Build Your Digital Identity
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-black text-balance">
            Create Your Perfect Portfolio in Minutes
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Build stunning, mobile-friendly portfolios with our drag-and-drop block system. Showcase your work, connect
            with your audience, and stand out online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg px-8">
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                View Examples
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Shine Online</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional tools designed for creators, freelancers, and professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-black" />
                </div>
                <CardTitle>Block-Based Editor</CardTitle>
                <CardDescription>Drag and drop content blocks to build your perfect layout</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-black" />
                </div>
                <CardTitle>Mobile-First Design</CardTitle>
                <CardDescription>Beautiful, responsive designs that look perfect on any device</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-black" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>Optimized for speed with instant loading and smooth interactions</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-black" />
                </div>
                <CardTitle>Social Integration</CardTitle>
                <CardDescription>Connect all your social media and showcase your online presence</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Custom Domains</CardTitle>
                {/* Updated description to reflect Arionys Profile */}
                <CardDescription>Use your own domain or get a beautiful Arionys [ profile.arionys.com ] URL</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Privacy Controls</CardTitle>
                <CardDescription>Full control over who can see your profile and content</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Build Your Digital Presence?</h2>
          {/* Updated paragraph to reflect Arionys Profile */}
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of creators who trust Arionys Profile to showcase their work
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="text-lg px-8">
              Create Your Profile Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AN</span>
            </div>
            <span className="font-bold text-xl">Arionys Profile</span>
          </div>
          {/* Updated footer text to reflect Arionys Profile */}
          <p className="text-muted-foreground">© 2024 Arionys Profile. Built with ❤️ for creators everywhere.</p>
        </div>
      </footer>
    </div>
  )
}
