"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Video, VideoOff, Play, Square, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Question {
  id: number
  text: string
  type: "hr" | "technical" | "behavioral"
  timeLimit: number
}

export default function LiveInterviewPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes per question
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [setup, setSetup] = useState<Record<string, unknown>>({})

  // Sample questions - in real app, these would be AI-generated
  const [questions] = useState<Question[]>([
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

    // Initialize camera
    initializeCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (interviewStarted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleNextQuestion()
            return questions[currentQuestion]?.timeLimit || 120
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [interviewStarted, timeRemaining, currentQuestion])

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
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setCameraEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setMicEnabled(audioTrack.enabled)
      }
    }
  }

  const startInterview = () => {
    setInterviewStarted(true)
    setIsRecording(true)
    setTimeRemaining(questions[0]?.timeLimit || 120)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setTimeRemaining(questions[currentQuestion + 1]?.timeLimit || 120)
    } else {
      endInterview()
    }
  }

  const endInterview = () => {
    setInterviewStarted(false)
    setIsRecording(false)

    // Save interview session data
    const sessionData = {
      date: new Date().toISOString(),
      mode: "live",
      questionsAnswered: currentQuestion + 1,
      totalQuestions: questions.length,
      setup: setup,
    }

    const sessions = JSON.parse(localStorage.getItem("interviewSessions") || "[]")
    sessions.push(sessionData)
    localStorage.setItem("interviewSessions", JSON.stringify(sessions))

    router.push("/feedback")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

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
        {/* Video Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Video Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                {!cameraEnabled && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <VideoOff className="h-12 w-12 text-gray-500" />
                  </div>
                )}

                {/* Recording indicator */}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Recording</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4 mt-4">
                <Button variant={cameraEnabled ? "outline" : "destructive"} size="sm" onClick={toggleCamera}>
                  {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button variant={micEnabled ? "outline" : "destructive"} size="sm" onClick={toggleMic}>
                  {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>

                {!interviewStarted ? (
                  <Button onClick={startInterview} className="px-6">
                    <Play className="mr-2 h-4 w-4" />
                    Start Interview
                  </Button>
                ) : (
                  <Button onClick={endInterview} variant="destructive" className="px-6">
                    <Square className="mr-2 h-4 w-4" />
                    End Interview
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Panel */}
        <div className="space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Current Question */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Question</CardTitle>
                <Badge
                  variant={
                    questions[currentQuestion]?.type === "hr"
                      ? "default"
                      : questions[currentQuestion]?.type === "technical"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {questions[currentQuestion]?.type.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{questions[currentQuestion]?.text}</p>

              {interviewStarted && (
                <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    💡 Take your time to think through your answer. Speak clearly and provide specific examples when
                    possible.
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-4">
                <Clock className="h-4 w-4" />
                <span>Remaining time: {formatTime(timeRemaining)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Next Question Preview */}
          {currentQuestion < questions.length - 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Next Question</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{questions[currentQuestion + 1]?.text}</p>
              </CardContent>
            </Card>
          )}

          {/* Interview Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Live Interview Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>• Maintain eye contact with the camera</li>
                <li>• Speak clearly and at a moderate pace</li>
                <li>• Use the STAR method for behavioral questions</li>
                <li>• Ask clarifying questions if needed</li>
                <li>• Stay calm and confident</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
