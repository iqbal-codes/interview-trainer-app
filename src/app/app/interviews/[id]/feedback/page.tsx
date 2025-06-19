"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Download,
  RotateCcw,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  BarChart3,
  Clock,
  Star,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SessionData {
  date: string
  mode: "live" | "practice"
  questionsAnswered: number
  totalQuestions: number
  setup: any
  responses?: any[]
}

interface FeedbackData {
  overallScore: number
  communicationSkills: number
  confidence: number
  clarity: number
  questionAnalysis: {
    questionId: number
    question: string
    score: number
    feedback: string
    improvements: string[]
  }[]
  areasOfImprovement: string[]
  strengths: string[]
  recommendations: string[]
}

export default function FeedbackPage() {
  const router = useRouter()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load the most recent session
    const sessions = JSON.parse(localStorage.getItem("interviewSessions") || "[]")
    if (sessions.length > 0) {
      const latestSession = sessions[sessions.length - 1]
      setSessionData(latestSession)
      generateFeedback(latestSession)
    }
    setLoading(false)
  }, [])

  const generateFeedback = (session: SessionData) => {
    // Simulate AI-generated comprehensive feedback
    const mockFeedback: FeedbackData = {
      overallScore: Math.floor(Math.random() * 20) + 75, // 75-95
      communicationSkills: Math.floor(Math.random() * 25) + 70,
      confidence: Math.floor(Math.random() * 30) + 65,
      clarity: Math.floor(Math.random() * 20) + 75,
      questionAnalysis: Array.from({ length: session.questionsAnswered }, (_, i) => ({
        questionId: i + 1,
        question: `Sample question ${i + 1} based on ${session.setup?.jobTitle}`,
        score: Math.floor(Math.random() * 30) + 70,
        feedback: "Your response demonstrated good understanding of the topic with relevant examples.",
        improvements: [
          "Consider providing more specific metrics",
          "Structure your answer using the STAR method",
          "Include more details about the impact of your actions",
        ],
      })),
      areasOfImprovement: [
        "Provide more specific examples with quantifiable results",
        "Improve body language and maintain better eye contact",
        "Practice concise storytelling techniques",
        "Develop stronger closing statements for each answer",
      ],
      strengths: [
        "Clear and articulate communication style",
        "Good use of relevant professional experiences",
        "Demonstrates strong problem-solving approach",
        "Shows enthusiasm and genuine interest in the role",
      ],
      recommendations: [
        "Practice the STAR method for behavioral questions",
        "Research common industry-specific questions",
        "Work on maintaining consistent energy throughout the interview",
        "Prepare 3-4 strong examples that can be adapted to different questions",
      ],
    }

    setFeedback(mockFeedback)
  }

  const downloadReport = () => {
    if (!feedback || !sessionData) return

    const reportData = {
      sessionData,
      feedback,
      generatedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `interview-feedback-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 85) return "default"
    if (score >= 70) return "secondary"
    return "destructive"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 mb-4">Generating your feedback...</p>
            <Progress value={75} className="h-2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sessionData || !feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 mb-4">No interview session found.</p>
            <Button asChild className="w-full">
              <Link href="/setup">Start New Interview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Interview Feedback</h1>
              <p className="text-sm text-gray-600">
                {sessionData.setup?.jobTitle} - {sessionData.mode === "live" ? "Live Session" : "Practice Session"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={downloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Button asChild>
              <Link href="/setup">
                <RotateCcw className="mr-2 h-4 w-4" />
                New Interview
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-6xl">
        {/* Overall Performance */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-blue-600">{feedback.overallScore}</CardTitle>
              <CardDescription>Overall Score</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant={getScoreBadge(feedback.overallScore)} className="text-sm">
                {feedback.overallScore >= 85 ? "Excellent" : feedback.overallScore >= 70 ? "Good" : "Needs Improvement"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Progress value={feedback.communicationSkills} className="flex-1 mr-3" />
                <span className={`font-semibold ${getScoreColor(feedback.communicationSkills)}`}>
                  {feedback.communicationSkills}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Progress value={feedback.confidence} className="flex-1 mr-3" />
                <span className={`font-semibold ${getScoreColor(feedback.confidence)}`}>{feedback.confidence}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Target className="mr-2 h-4 w-4" />
                Clarity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Progress value={feedback.clarity} className="flex-1 mr-3" />
                <span className={`font-semibold ${getScoreColor(feedback.clarity)}`}>{feedback.clarity}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Question Analysis</TabsTrigger>
            <TabsTrigger value="strengths">Strengths</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Question-by-Question Analysis
                </CardTitle>
                <CardDescription>Detailed feedback for each question you answered</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {feedback.questionAnalysis.map((analysis, index) => (
                    <div key={analysis.questionId} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Question {analysis.questionId}</h4>
                        <Badge variant={getScoreBadge(analysis.score)}>{analysis.score}/100</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{analysis.question}</p>
                      <p className="text-sm mb-3">{analysis.feedback}</p>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Suggestions for improvement:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.improvements.map((improvement, i) => (
                            <li key={i}>• {improvement}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strengths">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Your Strengths
                </CardTitle>
                <CardDescription>Areas where you performed well during the interview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {feedback.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <Star className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-green-800 text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="improvements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
                <CardDescription>Focus areas to enhance your interview performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedback.areasOfImprovement.map((area, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200"
                    >
                      <Target className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-orange-800 text-sm font-medium mb-1">Improvement Area {index + 1}</p>
                        <p className="text-orange-700 text-sm">{area}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>Actionable steps to improve your interview skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedback.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-blue-800 text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Session Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Session Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-medium">{new Date(sessionData.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Interview Mode</p>
                <p className="font-medium capitalize">{sessionData.mode} Session</p>
              </div>
              <div>
                <p className="text-gray-600">Questions Completed</p>
                <p className="font-medium">
                  {sessionData.questionsAnswered} of {sessionData.totalQuestions}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Position</p>
                <p className="font-medium">{sessionData.setup?.jobTitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Ready for Your Next Practice?</CardTitle>
            <CardDescription className="text-blue-600">
              Continue improving your interview skills with more practice sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1">
                <Link href="/setup">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start New Interview
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/progress">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Progress
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
