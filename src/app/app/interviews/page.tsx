"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Search, Play, Eye, Target, CheckCircle, XCircle, Pause, FileText } from "lucide-react"
import Link from "next/link"

interface InterviewSession {
  id: string
  date: string
  jobTitle: string
  company: string
  interviewType: string
  questionsTotal: number
  questionsAnswered: number
  questionsSkipped?: number
  timeSpent: number
  status: "completed" | "in-progress" | "cancelled" | "paused"
  score?: number
  averageScore?: number
  interviewer?: string
  notes?: string
}

export default function InterviewSessionsPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<InterviewSession[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    // Generate mock session data
    const mockSessions: InterviewSession[] = [
      {
        id: "session-1",
        date: "2024-01-20T14:00:00Z",
        jobTitle: "Senior Software Engineer",
        company: "Google",
        interviewType: "technical",
        questionsTotal: 10,
        questionsAnswered: 10,
        timeSpent: 60,
        status: "completed",
        score: 89,
        interviewer: "AI Technical Interviewer",
        notes: "Strong performance in system design. Good communication throughout the session.",
      },
      {
        id: "session-2",
        date: "2024-01-19T15:30:00Z",
        jobTitle: "Software Engineer",
        company: "Google",
        interviewType: "technical",
        questionsTotal: 10,
        questionsAnswered: 10,
        questionsSkipped: 0,
        timeSpent: 45,
        status: "completed",
        averageScore: 87,
        notes: "Strong technical session. Focus on database optimization concepts for improvement.",
      },
      {
        id: "session-3",
        date: "2024-01-18T10:30:00Z",
        jobTitle: "Product Manager",
        company: "Microsoft",
        interviewType: "behavioral",
        questionsTotal: 12,
        questionsAnswered: 12,
        timeSpent: 45,
        status: "completed",
        score: 92,
        interviewer: "AI Behavioral Interviewer",
        notes: "Excellent storytelling using STAR method. Very confident presentation.",
      },
      {
        id: "session-4",
        date: "2024-01-17T10:15:00Z",
        jobTitle: "Product Manager",
        company: "Microsoft",
        interviewType: "behavioral",
        questionsTotal: 8,
        questionsAnswered: 6,
        questionsSkipped: 2,
        timeSpent: 35,
        status: "in-progress",
        averageScore: 78,
        notes: "Session paused - need to complete remaining behavioral questions.",
      },
      {
        id: "session-5",
        date: "2024-01-15T14:00:00Z",
        jobTitle: "Data Scientist",
        company: "Amazon",
        interviewType: "situational",
        questionsTotal: 12,
        questionsAnswered: 12,
        questionsSkipped: 0,
        timeSpent: 55,
        status: "completed",
        averageScore: 91,
        notes: "Outstanding session with strong analytical and problem-solving skills demonstrated.",
      },
      {
        id: "session-6",
        date: "2024-01-15T09:00:00Z",
        jobTitle: "Frontend Developer",
        company: "Netflix",
        interviewType: "technical",
        questionsTotal: 8,
        questionsAnswered: 0,
        timeSpent: 35,
        status: "cancelled",
        interviewer: "AI Technical Interviewer",
        notes: "Session cancelled due to technical issues.",
      },
      {
        id: "session-8",
        date: "2024-01-12T11:15:00Z",
        jobTitle: "UX Designer",
        company: "Airbnb",
        interviewType: "introductory",
        questionsTotal: 10,
        questionsAnswered: 10,
        timeSpent: 40,
        status: "completed",
        score: 85,
        interviewer: "AI Introductory Interviewer",
        notes: "Good rapport building and company knowledge. Could improve on specific role details.",
      },
      {
        id: "session-9",
        date: "2024-01-11T16:45:00Z",
        jobTitle: "UX Designer",
        company: "Airbnb",
        interviewType: "introductory",
        questionsTotal: 6,
        questionsAnswered: 6,
        questionsSkipped: 0,
        timeSpent: 30,
        status: "completed",
        averageScore: 83,
        notes: "Good introductory session. Work on company-specific research and value alignment.",
      },
    ]

    setSessions(mockSessions)
    setFilteredSessions(mockSessions)
  }, [])

  useEffect(() => {
    let filtered = sessions

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (session) =>
          session.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.company.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((session) => session.status === filterStatus)
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((session) => session.interviewType === filterType)
    }

    setFilteredSessions(filtered)
  }, [sessions, searchTerm, filterStatus, filterType])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in-progress":
        return "secondary"
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
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "in-progress":
        return <Play className="h-5 w-5 text-blue-600" />
      case "paused":
        return <Pause className="h-5 w-5 text-yellow-600" />
      case "cancelled":
      case "abandoned":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100"
      case "in-progress":
        return "bg-blue-100"
      case "paused":
        return "bg-yellow-100"
      case "cancelled":
      case "abandoned":
        return "bg-red-100"
      default:
        return "bg-gray-100"
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-500"
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const completedSessions = sessions.filter((s) => s.status === "completed")
  const averageScore =
    completedSessions.length > 0
      ? Math.round(
        completedSessions.reduce((sum, s) => sum + (s.score || s.averageScore || 0), 0) / completedSessions.length,
      )
      : 0
  const totalTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Sessions</h1>
          <p className="text-muted-foreground">All your interview practice sessions in one place</p>
        </div>
        <Button asChild>
          <Link href="/setup">
            <Play className="mr-2 h-4 w-4" />
            New Interview
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">Interview sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions.length}</div>
            <p className="text-xs text-muted-foreground">Interview sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}</div>
            <p className="text-xs text-muted-foreground">Overall average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((totalTime / 60) * 10) / 10}h</div>
            <p className="text-xs text-muted-foreground">Interview time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Sessions</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Sessions</CardTitle>
              <CardDescription>Search and filter your interview sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by job title or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="introductory">Introductory</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="situational">Situational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Sessions</CardTitle>
              <CardDescription>
                {filteredSessions.length} of {sessions.length} sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getStatusColor(session.status)}`}>
                          {getStatusIcon(session.status)}
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(session.score || session.averageScore)}`}>
                          {session.score || session.averageScore}/100
                        </div>
                      </div>
                      <CardTitle className="text-lg">{session.jobTitle}</CardTitle>
                      <CardDescription>
                        {session.company} • {new Date(session.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {session.interviewType}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Questions:</span>
                          <span>
                            {session.questionsAnswered}/{session.questionsTotal}
                          </span>
                        </div>
                        {session.timeSpent > 0 && (
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Time:</span>
                            <span>{session.timeSpent}min</span>
                          </div>
                        )}
                      </div>

                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/app/interviews/${session.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Sessions</CardTitle>
              <CardDescription>Review your finished interview sessions and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(session.score || session.averageScore)}`}>
                          {session.score || session.averageScore}/100
                        </div>
                      </div>
                      <CardTitle className="text-lg">{session.jobTitle}</CardTitle>
                      <CardDescription>
                        {session.company} • {new Date(session.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {session.interviewType}
                        </Badge>
                      </div>

                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>
                          {session.questionsAnswered} questions • {session.timeSpent}min
                        </span>
                      </div>

                      {session.notes && <p className="text-xs text-muted-foreground line-clamp-2">{session.notes}</p>}

                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/app/interviews/${session.id}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Report
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>In Progress Sessions</CardTitle>
              <CardDescription>Continue your unfinished interview sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions
                  .filter((s) => s.status === "in-progress")
                  .map((session) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                            <Play className="h-5 w-5 text-blue-600" />
                          </div>
                          {session.averageScore && (
                            <div className={`text-lg font-bold ${getScoreColor(session.averageScore)}`}>
                              {session.averageScore}/100
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg">{session.jobTitle}</CardTitle>
                        <CardDescription>
                          {session.company} • {new Date(session.date).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {session.interviewType}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Questions:</span>
                            <span>
                              {session.questionsAnswered}/{session.questionsTotal}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Time:</span>
                            <span>{session.timeSpent}min</span>
                          </div>
                        </div>

                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link href={`/app/interviews/${session.id}`}>
                            <Play className="mr-2 h-4 w-4" />
                            Continue Session
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
