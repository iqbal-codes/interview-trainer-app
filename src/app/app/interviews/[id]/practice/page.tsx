"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Video, VideoOff, Play, Square, ArrowLeft, ArrowRight, CheckCircle, Clock, Lightbulb } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Question {
  id: number
  text: string
  type: "technical" | "behavioral" | "situational" | ""
  timeLimit: number
  feedback?: {
    score: number
    relevance: string
    improvements: string[]
    sampleAnswer: string
  }
}

interface Response {
  questionId: number
  type: "text" | "audio" | "video"
  content: string
  timestamp: Date
}

export default function PracticeInterviewPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Response[]>([])
  const [textResponse, setTextResponse] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingType, setRecordingType] = useState<"audio" | "video">("audio")
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [setup, setSetup] = useState<any>({})
  const [showFeedback, setShowFeedback] = useState(false)

  // Sample questions with AI-generated feedback
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: "Tell me about yourself and why you're interested in this position.",
      type: "hr",
      timeLimit: 120,
    },
    {
      id: 2,
      text: "Describe a challenging project you worked on and how you overcame obstacles.",
      type: "behavioral",
      timeLimit: 180,
    },
    {
      id: 3,
      text: "What are your greatest strengths and how do they apply to this role?",
      type: "hr",
      timeLimit: 120,
    },
    {
      id: 4,
      text: "Walk me through your problem-solving process when faced with a technical challenge.",
      type: "technical",
      timeLimit: 240,
    },
    {
      id: 5,
      text: "Where do you see yourself in 5 years and how does this position fit into your career goals?",
      type: "hr",
      timeLimit: 120,
    },
  ])

  useEffect(() => {
    // Load setup from localStorage
    const savedSetup = localStorage.getItem("interviewSetup")
    if (savedSetup) {
      setSetup(JSON.parse(savedSetup))
    }
  }, [])

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setCameraEnabled(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const toggleCamera = () => {
    if (cameraEnabled && stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setCameraEnabled(false)
    } else {
      initializeCamera()
    }
  }

  const startRecording = (type: "audio" | "video") => {
    setRecordingType(type)
    setIsRecording(true)
    if (type === "video" && !cameraEnabled) {
      initializeCamera()
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    // In a real app, you would save the recording
    const newResponse: Response = {
      questionId: questions[currentQuestion].id,
      type: recordingType,
      content: `${recordingType} recording for question ${currentQuestion + 1}`,
      timestamp: new Date(),
    }
    setResponses((prev) => [...prev, newResponse])
    generateFeedback()
  }

  const submitTextResponse = () => {
    if (!textResponse.trim()) return

    const newResponse: Response = {
      questionId: questions[currentQuestion].id,
      type: "text",
      content: textResponse,
      timestamp: new Date(),
    }
    setResponses((prev) => [...prev, newResponse])
    setTextResponse("")
    generateFeedback()
  }

  const generateFeedback = () => {
    // Simulate AI feedback generation
    const feedback = {
      score: Math.floor(Math.random() * 30) + 70, // 70-100
      relevance: "Your answer addresses the key points of the question and provides relevant examples.",
      improvements: [
        "Consider providing more specific metrics or outcomes",
        "Structure your response using the STAR method",
        "Include more details about your role in the situation",
      ],
      sampleAnswer:
        "A strong answer would include: specific situation, your actions, measurable results, and lessons learned.",
    }

    setQuestions((prev) => prev.map((q, index) => (index === currentQuestion ? { ...q, feedback } : q)))
    setShowFeedback(true)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setShowFeedback(false)
    } else {
      finishInterview()
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
      setShowFeedback(false)
    }
  }

  const finishInterview = () => {
    // Save session data
    const sessionData = {
      date: new Date().toISOString(),
      mode: "practice",
      questionsAnswered: responses.length,
      totalQuestions: questions.length,
      responses: responses,
      setup: setup,
    }

    const sessions = JSON.parse(localStorage.getItem("interviewSessions") || "[]")
    sessions.push(sessionData)
    localStorage.setItem("interviewSessions", JSON.stringify(sessions))

    router.push("/feedback")
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentQuestionData = questions[currentQuestion]
  const hasResponse = responses.some((r) => r.questionId === currentQuestionData?.id)

  if (!setup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 mb-4">Loading interview setup...</p>
            <Button asChild className="w-full">
              <Link href="/setup">Return to Setup</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">

      <div className="container mx-auto p-4 grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          <Card>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Question */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Question {currentQuestion + 1}</CardTitle>
                <Badge
                  variant={
                    currentQuestionData?.type === "hr"
                      ? "default"
                      : currentQuestionData?.type === "technical"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {currentQuestionData?.type.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed mb-4">{currentQuestionData?.text}</p>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Suggested time: {Math.floor(currentQuestionData?.timeLimit / 60)} minutes</span>
              </div>
            </CardContent>
          </Card>

          {/* Response Interface */}
          <Card>
            <CardHeader>
              <CardTitle>Your Response</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text">Text Response</TabsTrigger>
                  <TabsTrigger value="audio">Audio Recording</TabsTrigger>
                  <TabsTrigger value="video">Video Recording</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <Textarea
                    placeholder="Type your answer here..."
                    value={textResponse}
                    onChange={(e) => setTextResponse(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <Button onClick={submitTextResponse} disabled={!textResponse.trim()} className="w-full">
                    Submit Text Response
                  </Button>
                </TabsContent>

                <TabsContent value="audio" className="space-y-4">
                  <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Mic className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Record your audio response</p>
                    {!isRecording ? (
                      <Button onClick={() => startRecording("audio")}>
                        <Play className="mr-2 h-4 w-4" />
                        Start Audio Recording
                      </Button>
                    ) : (
                      <Button onClick={stopRecording} variant="destructive">
                        <Square className="mr-2 h-4 w-4" />
                        Stop Recording
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="video" className="space-y-4">
                  <div className="space-y-4">
                    {cameraEnabled && (
                      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                        {isRecording && recordingType === "video" && (
                          <div className="absolute top-4 left-4 flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-white text-sm font-medium">Recording</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-center space-x-4">
                      <Button variant="outline" onClick={toggleCamera}>
                        {cameraEnabled ? <VideoOff className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
                        {cameraEnabled ? "Disable Camera" : "Enable Camera"}
                      </Button>

                      {cameraEnabled && (
                        <>
                          {!isRecording ? (
                            <Button onClick={() => startRecording("video")}>
                              <Play className="mr-2 h-4 w-4" />
                              Start Video Recording
                            </Button>
                          ) : (
                            <Button onClick={stopRecording} variant="destructive">
                              <Square className="mr-2 h-4 w-4" />
                              Stop Recording
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Feedback */}
          {showFeedback && currentQuestionData?.feedback && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Instant Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Response Score</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {currentQuestionData.feedback.score}/100
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-green-800 mb-2">Relevance Assessment</h4>
                  <p className="text-green-700 text-sm">{currentQuestionData.feedback.relevance}</p>
                </div>

                <div>
                  <h4 className="font-medium text-green-800 mb-2">Areas for Improvement</h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    {currentQuestionData.feedback.improvements.map((improvement, index) => (
                      <li key={index}>• {improvement}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-green-800 mb-2">Sample Strong Response</h4>
                  <p className="text-green-700 text-sm">{currentQuestionData.feedback.sampleAnswer}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={previousQuestion} disabled={currentQuestion === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="space-x-2">
              {hasResponse && (
                <Button variant="outline" onClick={() => setShowFeedback(!showFeedback)}>
                  {showFeedback ? "Hide" : "Show"} Feedback
                </Button>
              )}

              {currentQuestion === questions.length - 1 ? (
                <Button onClick={finishInterview}>Finish Interview</Button>
              ) : (
                <Button onClick={nextQuestion} disabled={!hasResponse}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Question Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Question Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`flex items-center justify-between p-2 rounded text-sm ${index === currentQuestion
                      ? "bg-blue-100 text-blue-800"
                      : responses.some((r) => r.questionId === question.id)
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    <span>Q{index + 1}</span>
                    <Badge variant="outline" className="text-xs">
                      {question.type}
                    </Badge>
                    {responses.some((r) => r.questionId === question.id) && <CheckCircle className="h-4 w-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Lightbulb className="mr-2 h-4 w-4" />
                Practice Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Take your time to think before responding</li>
                <li>• Use specific examples from your experience</li>
                <li>• Structure answers with STAR method</li>
                <li>• Practice different response formats</li>
                <li>• Review feedback before moving on</li>
              </ul>
            </CardContent>
          </Card>

          {/* Session Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Session Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions Answered</span>
                  <span className="font-medium">{responses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-medium">{questions.length - responses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-medium">
                    {questions.filter((q) => q.feedback).length > 0
                      ? Math.round(
                        questions.filter((q) => q.feedback).reduce((acc, q) => acc + (q.feedback?.score || 0), 0) /
                        questions.filter((q) => q.feedback).length,
                      )
                      : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
