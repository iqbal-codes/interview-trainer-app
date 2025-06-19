"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {

  Video,
  MessageSquare,
  Clock,
  Target,
  Building,
  Play,
  CheckCircle,
  Calendar,
  FileText,
  Lightbulb,
  TrendingUp,
  Award,
  BarChart3,
  Timer,
  HelpCircle,
  NotebookPen,
} from "lucide-react"
import Link from "next/link"

interface Question {
  id: number
  text: string
  type: "introductory" | "technical" | "behavioral" | "situational"
  timeLimit: number
  difficulty: "easy" | "medium" | "hard"
  answered?: boolean
  score?: number
  tips: string[]
}

interface InterviewSession {
  id: string
  date: string
  jobTitle: string
  company?: string
  jobDescription?: string
  aboutCompany?: string
  interviewType: string
  mode: "live" | "practice"
  questionsTotal: number
  questionsAnswered: number
  questionsSkipped?: number
  timeSpent: number
  status: "completed" | "in-progress" | "scheduled" | "cancelled" | "paused" | "abandoned"
  score?: number
  averageScore?: number
  interviewer?: string
  interviewerAvatar?: string
  recordingUrl?: string
  notes?: string
  questions: Question[]
  requirements: string[]
  skills: string[]
  experience?: string
  salary?: string
  location?: string
  resumeContext?: string
}

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchSessionDetails = () => {
      const sessionId = params.id as string

      // Mock session data - in real app, this would come from API
      const mockSession: InterviewSession = {
        id: sessionId,
        date: "2024-01-20T14:00:00Z",
        jobTitle: "Senior Software Engineer",
        company: "Google",
        jobDescription: "Looking for a senior engineer to work on distributed systems and cloud infrastructure.",
        aboutCompany:
          "Google is a multinational technology company specializing in Internet-related services and products.",
        interviewType: "technical",
        mode: "live",
        questionsTotal: 8,
        questionsAnswered: 8,
        timeSpent: 45,
        status: "completed",
        score: 89,
        interviewer: "AI Technical Interviewer",
        interviewerAvatar: "/placeholder.svg?height=40&width=40",
        recordingUrl: "/recordings/session-1.mp4",
        notes:
          "Strong performance in system design. Good communication throughout the session. Excellent problem-solving approach and clear explanations of technical concepts.",
        experience: "5+ years",
        salary: "$150,000 - $200,000",
        location: "Mountain View, CA",
        resumeContext:
          "Based on your resume, you have 6 years of experience in backend development with expertise in Java, Python, and distributed systems. You've worked at tech companies including Microsoft and Uber, leading teams and architecting scalable solutions. Your background shows strong experience with cloud platforms, microservices, and system design.",
        requirements: [
          "Bachelor's degree in Computer Science or equivalent",
          "5+ years of software development experience",
          "Experience with distributed systems",
          "Proficiency in Java, Python, or Go",
          "Cloud platform experience (GCP, AWS, or Azure)",
        ],
        skills: [
          "Java",
          "Python",
          "Go",
          "Distributed Systems",
          "Microservices",
          "Cloud Computing",
          "System Design",
          "Database Design",
          "API Development",
          "DevOps",
        ],
        questions: [
          {
            id: 1,
            text: "Tell me about yourself and your experience with distributed systems.",
            type: "introductory",
            timeLimit: 120,
            difficulty: "easy",
            answered: true,
            score: 85,
            tips: [
              "Keep it concise and relevant to the role",
              "Focus on distributed systems experience",
              "Mention specific technologies you've worked with",
            ],
          },
          {
            id: 2,
            text: "Design a URL shortening service like bit.ly. Consider scalability and performance.",
            type: "technical",
            timeLimit: 300,
            difficulty: "hard",
            answered: true,
            score: 92,
            tips: [
              "Start with requirements gathering",
              "Consider database design and caching",
              "Discuss load balancing and scaling strategies",
            ],
          },
          {
            id: 3,
            text: "Describe a time when you had to optimize a slow-performing system.",
            type: "behavioral",
            timeLimit: 180,
            difficulty: "medium",
            answered: true,
            score: 88,
            tips: ["Use the STAR method", "Focus on your specific contributions", "Mention measurable improvements"],
          },
          {
            id: 4,
            text: "How would you handle a situation where your microservice is causing cascading failures?",
            type: "situational",
            timeLimit: 240,
            difficulty: "hard",
            answered: true,
            score: 90,
            tips: [
              "Discuss circuit breakers and fallback mechanisms",
              "Consider monitoring and alerting",
              "Talk about incident response procedures",
            ],
          },
          {
            id: 5,
            text: "Explain the CAP theorem and its implications for distributed systems.",
            type: "technical",
            timeLimit: 180,
            difficulty: "medium",
            answered: true,
            score: 87,
            tips: [
              "Define Consistency, Availability, and Partition tolerance",
              "Give real-world examples",
              "Discuss trade-offs in system design",
            ],
          },
        ],
      }

      setSession(mockSession)
      setLoading(false)
    }

    fetchSessionDetails()
  }, [params.id])

  const startInterview = (mode: "live" | "practice") => {
    if (!session) return

    // Save session data to localStorage for the interview pages
    localStorage.setItem("currentSession", JSON.stringify(session))
    localStorage.setItem("interviewQuestions", JSON.stringify(session.questions))

    // Navigate to appropriate interview mode
    if (mode === "live") {
      router.push(`/app/interviews/${session.id}/live`)
    } else {
      router.push(`/app/interviews/${session.id}/practice`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in-progress":
        return "secondary"
      case "scheduled":
        return "outline"
      case "cancelled":
        return "destructive"
      case "paused":
        return "outline"
      case "abandoned":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Play className="h-4 w-4 text-blue-600" />
      case "scheduled":
        return <Calendar className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "introductory":
        return "bg-blue-100 text-blue-800"
      case "technical":
        return "bg-red-100 text-red-800"
      case "behavioral":
        return "bg-green-100 text-green-800"
      case "situational":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "hard":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-500"
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Interview session not found</p>
            <Button asChild>
              <Link href="/dashboard/sessions">Back to Sessions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const estimatedTime = Math.round(session.questions.reduce((sum, q) => sum + q.timeLimit, 0) / 60)

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Move Interview Overview to top and enhance it */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Interview Overview
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusBadge(session.status)} className="flex items-center">
                    {getStatusIcon(session.status)}
                    <span className="ml-1 capitalize">{session.status}</span>
                  </Badge>
                  <Badge variant={session.mode === "live" ? "destructive" : "default"}>
                    {session.mode === "live" ? (
                      <Video className="mr-1 h-3 w-3" />
                    ) : (
                      <MessageSquare className="mr-1 h-3 w-3" />
                    )}
                    {session.mode}
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>Essential details about this interview session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Job Title</h4>
                    <p className="text-lg font-semibold">{session.jobTitle}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Interview Type</h4>
                    <Badge className={`${getQuestionTypeColor(session.interviewType)}`}>
                      {session.interviewType.charAt(0).toUpperCase() + session.interviewType.slice(1)}
                    </Badge>
                  </div>
                  {session.company && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Company</h4>
                      <p className="font-medium">{session.company}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Number of Questions</h4>
                    <p className="text-xl font-bold text-blue-600">{session.questionsTotal}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Industry</h4>
                    <p className="font-medium">Technology</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary (for completed sessions) */}
          {session.status === "completed" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Performance Summary
                </CardTitle>
                <CardDescription>Your interview performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className={`text-3xl font-bold ${getScoreColor(session.score || session.averageScore)}`}>
                      {session.score || session.averageScore}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Overall Score</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {session.questionsAnswered}/{session.questionsTotal}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Questions Completed</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">{session.timeSpent}m</div>
                    <p className="text-sm text-gray-600 mt-1">Time Spent</p>
                  </div>
                </div>

                {session.notes && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <NotebookPen className="mr-2 h-4 w-4" />
                      Interview Notes
                    </h4>
                    <p className="text-blue-800 text-sm">{session.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Interview Questions ({session.questions.length})</CardTitle>
              <CardDescription>Preview of questions you&apos;ll be asked during the interview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {session.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${getQuestionTypeColor(question.type)}`}>{question.type}</Badge>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-700">{question.text}</p>
                    <div className="text-sm text-gray-500">
                      <span>Suggested time: {Math.floor(question.timeLimit / 60)} minutes</span>
                    </div>
                    {/* <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Question Tips
                      </h4>
                      {question.tips.map((tip, index) => (
                        <p key={index} className="text-yellow-800 text-sm flex items-center">
                          <Dot className="mr-2 h-4 w-4" /> <span>{tip}</span>
                        </p>
                      ))}
                    </div> */}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Primary Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Actions</CardTitle>
              <CardDescription>Choose how you want to proceed with this interview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Practice Mode */}
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center mb-2">
                  <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Practice Mode</h3>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Practice with unlimited time, get instant feedback, and review questions multiple times.
                </p>
                <Button onClick={() => startInterview("practice")} className="w-full" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Start Practice Interview
                </Button>
              </div>

              {/* Live Mode */}
              <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                <div className="flex items-center mb-2">
                  <Video className="mr-2 h-5 w-5 text-red-600" />
                  <h3 className="font-medium text-red-900">Live Mode</h3>
                </div>
                <p className="text-sm text-red-700 mb-3">
                  Real interview experience with time limits, recording, and comprehensive evaluation.
                </p>
                <Button onClick={() => startInterview("live")} className="w-full bg-red-600 hover:bg-red-700">
                  <Video className="mr-2 h-4 w-4" />
                  Start Live Interview
                </Button>
              </div>

              {/* Feedback Report (for completed sessions) */}
              {session.status === "completed" && (
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center mb-2">
                    <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-green-900">Detailed Report</h3>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    View comprehensive feedback, performance analytics, and improvement suggestions.
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/dashboard/feedback/${session.id}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Feedback Report
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Questions
                </span>
                <span className="font-medium">{session.questionsTotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <Timer className="mr-2 h-4 w-4" />
                  Est. Time
                </span>
                <span className="font-medium">{estimatedTime}m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <Target className="mr-2 h-4 w-4" />
                  Difficulty
                </span>
                <div className="flex space-x-1">
                  {[...new Set(session.questions.map((q) => q.difficulty))].map((difficulty) => (
                    <Badge key={difficulty} variant="outline" className={`text-xs ${getDifficultyColor(difficulty)}`}>
                      {difficulty}
                    </Badge>
                  ))}
                </div>
              </div>
              {session.status === "completed" && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Time Spent
                    </span>
                    <span className="font-medium">{session.timeSpent}m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Award className="mr-2 h-4 w-4" />
                      Score
                    </span>
                    <span className={`font-medium ${getScoreColor(session.score)}`}>{session.score}/100</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Preparation Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Lightbulb className="mr-2 h-4 w-4" />
                Preparation Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Review the job description thoroughly
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Prepare specific examples from your experience
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Practice explaining technical concepts clearly
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Test your camera and microphone setup
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Choose a quiet, well-lit environment
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
