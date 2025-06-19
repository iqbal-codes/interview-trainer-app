"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, MessageSquare, BarChart3, Target, FileText, Brain, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">InterviewAI</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">
              How it Works
            </Link>
            <Button asChild>
              <Link href="/app">Start Interview Prep</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">AI-Powered Interview Training</Badge>
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Master Your Next Job Interview with <span className="text-blue-600">AI Coaching</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Practice realistic job interviews with our AI interviewer. Get personalized feedback, improve your
            responses, and boost your confidence before the real thing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-3">
              <Link href="/app">Start Free Practice</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              <Video className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Ace Your Interview</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines AI technology with proven interview techniques to give you the edge you need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Video className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Live Mock Interviews</CardTitle>
                <CardDescription>
                  Experience realistic interview simulations with continuous video-based sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Real-time camera feed</li>
                  <li>• Sequential questioning</li>
                  <li>• Comprehensive feedback</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Turn-based Practice</CardTitle>
                <CardDescription>
                  Self-paced practice with flexible response options and immediate feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Audio/video recording</li>
                  <li>• Written responses</li>
                  <li>• Instant question feedback</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Target className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Personalized Questions</CardTitle>
                <CardDescription>
                  AI-generated questions tailored to your job title, industry, and experience level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• HR, Technical, Behavioral</li>
                  <li>• Industry-specific sets</li>
                  <li>• Difficulty adjustment</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>
                  Comprehensive performance analysis with actionable improvement suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Communication scoring</li>
                  <li>• Question-by-question analysis</li>
                  <li>• Progress tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <FileText className="h-10 w-10 text-red-600 mb-2" />
                <CardTitle>Resume Integration</CardTitle>
                <CardDescription>
                  Upload your resume for personalized questions based on your background
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• PDF/DOC support</li>
                  <li>• Experience-based questions</li>
                  <li>• Skills assessment</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-teal-600 mb-2" />
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>Monitor your improvement over time with detailed session history</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Session comparisons</li>
                  <li>• Skill development</li>
                  <li>• Downloadable reports</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-lg text-gray-600">Get started in just a few simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2">Setup Your Profile</h4>
              <p className="text-gray-600">
                Enter your job details, upload your resume, and choose your interview preferences
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2">Practice Interviews</h4>
              <p className="text-gray-600">Choose between live mock interviews or turn-based practice sessions</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2">Get Feedback</h4>
              <p className="text-gray-600">
                Receive detailed analysis and personalized recommendations for improvement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-3xl font-bold mb-4">Ready to Ace Your Next Interview?</h3>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of professionals who have improved their interview skills with InterviewAI
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
            <Link href="/dashboard">Start Your Free Practice Session</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-6 w-6" />
            <span className="text-lg font-semibold">InterviewAI</span>
          </div>
          <p className="text-gray-400">Empowering professionals to succeed in their career journey</p>
        </div>
      </footer>
    </div>
  )
}
