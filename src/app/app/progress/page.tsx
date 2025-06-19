"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  BarChart3,
  Target,
  Video,
  MessageSquare,
  Clock,
  Star,
  Award,
  Download,
} from "lucide-react"
import Link from "next/link"

interface SessionHistory {
  date: string
  mode: "live" | "practice"
  questionsAnswered: number
  totalQuestions: number
  overallScore: number
  setup: any
}

export default function ProgressPage() {
  const [sessions, setSessions] = useState<SessionHistory[]>([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    totalQuestions: 0,
    improvementTrend: 0,
    strongestSkill: "Communication",
    weeklyGoal: 3,
    completedThisWeek: 1,
  })

  useEffect(() => {
    // Load session history from localStorage
    const sessionData = JSON.parse(localStorage.getItem("interviewSessions") || "[]")

    // Add mock scores for demonstration
    const sessionsWithScores = sessionData.map((session: any, index: number) => ({
      ...session,
      overallScore: Math.floor(Math.random() * 20) + 75 + index * 2, // Simulate improvement over time
    }))

    setSessions(sessionsWithScores)

    // Calculate stats
    if (sessionsWithScores.length > 0) {
      const totalQuestions = sessionsWithScores.reduce(
        (sum: number, session: any) => sum + session.questionsAnswered,
        0,
      )
      const averageScore =
        sessionsWithScores.reduce((sum: number, session: any) => sum + session.overallScore, 0) /
        sessionsWithScores.length

      // Calculate improvement trend
      let improvementTrend = 0
      if (sessionsWithScores.length >= 2) {
        const recent =
          sessionsWithScores.slice(-3).reduce((sum: number, session: any) => sum + session.overallScore, 0) /
          Math.min(3, sessionsWithScores.length)
        const earlier =
          sessionsWithScores.slice(0, -3).reduce((sum: number, session: any) => sum + session.overallScore, 0) /
          Math.max(1, sessionsWithScores.length - 3)
        improvementTrend = recent - earlier
      }

      setStats({
        totalSessions: sessionsWithScores.length,
        averageScore: Math.round(averageScore),
        totalQuestions,
        improvementTrend: Math.round(improvementTrend),
        strongestSkill: "Communication",
        weeklyGoal: 3,
        completedThisWeek: sessionsWithScores.filter((session: any) => {
          const sessionDate = new Date(session.date)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return sessionDate > weekAgo
        }).length,
      })
    }
  }, [])

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

  const exportProgress = () => {
    const progressData = {
      sessions,
      stats,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(progressData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `interview-progress-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">

      {/* Overview Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">{stats.totalQuestions} questions answered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>{stats.averageScore}</div>
            <p className="text-xs text-muted-foreground">Out of 100 points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.improvementTrend >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats.improvementTrend >= 0 ? "+" : ""}
              {stats.improvementTrend}
            </div>
            <p className="text-xs text-muted-foreground">Points vs previous sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedThisWeek}/{stats.weeklyGoal}
            </div>
            <Progress value={(stats.completedThisWeek / stats.weeklyGoal) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">Session History</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="skills">Skill Development</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Interview Session History
              </CardTitle>
              <CardDescription>Complete record of your practice sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No interview sessions yet</p>
                  <Button asChild>
                    <Link href="/setup">Start Your First Interview</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                          {session.mode === "live" ? (
                            <Video className="h-5 w-5 text-blue-600" />
                          ) : (
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{session.setup?.jobTitle || "Interview Practice"}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(session.date).toLocaleDateString()} •{session.questionsAnswered} of{" "}
                            {session.totalQuestions} questions •
                            {session.mode === "live" ? "Live Session" : "Practice Mode"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getScoreBadge(session.overallScore)}>{session.overallScore}/100</Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Performance Trends
              </CardTitle>
              <CardDescription>Track your improvement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Score Progression */}
                <div>
                  <h4 className="font-medium mb-4">Score Progression</h4>
                  <div className="space-y-2">
                    {sessions.map((session, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 w-20">Session {index + 1}</span>
                        <Progress value={session.overallScore} className="flex-1" />
                        <span className={`text-sm font-medium w-12 ${getScoreColor(session.overallScore)}`}>
                          {session.overallScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interview Types */}
                <div>
                  <h4 className="font-medium mb-4">Interview Type Performance</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="text-center">
                        <h5 className="font-medium text-blue-600">HR Interviews</h5>
                        <div className="text-2xl font-bold mt-2">85</div>
                        <p className="text-sm text-gray-600">Average Score</p>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <h5 className="font-medium text-green-600">Technical</h5>
                        <div className="text-2xl font-bold mt-2">78</div>
                        <p className="text-sm text-gray-600">Average Score</p>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <h5 className="font-medium text-purple-600">Behavioral</h5>
                        <div className="text-2xl font-bold mt-2">82</div>
                        <p className="text-sm text-gray-600">Average Score</p>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Skill Development
              </CardTitle>
              <CardDescription>Your progress in key interview skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Skill Breakdown */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Core Skills</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Communication</span>
                          <span className="font-medium">88%</span>
                        </div>
                        <Progress value={88} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Confidence</span>
                          <span className="font-medium">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Clarity</span>
                          <span className="font-medium">82%</span>
                        </div>
                        <Progress value={82} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Structure</span>
                          <span className="font-medium">79%</span>
                        </div>
                        <Progress value={79} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Areas to Focus</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h5 className="font-medium text-yellow-800">Technical Questions</h5>
                        <p className="text-sm text-yellow-700">Practice more coding problems and system design</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-800">Body Language</h5>
                        <p className="text-sm text-blue-700">Work on maintaining eye contact and posture</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <h5 className="font-medium text-purple-800">Storytelling</h5>
                        <p className="text-sm text-purple-700">Develop more compelling examples using STAR method</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <h4 className="font-medium mb-4">Recent Achievements</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Award className="h-8 w-8 text-green-600" />
                      <div>
                        <h5 className="font-medium text-green-800">First Perfect Score</h5>
                        <p className="text-sm text-green-700">Scored 100 on an HR question</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Clock className="h-8 w-8 text-blue-600" />
                      <div>
                        <h5 className="font-medium text-blue-800">Consistency</h5>
                        <p className="text-sm text-blue-700">5 sessions this week</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                      <div>
                        <h5 className="font-medium text-purple-800">Improvement</h5>
                        <p className="text-sm text-purple-700">+15 points this month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Items */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Keep Improving!</CardTitle>
          <CardDescription className="text-blue-600">
            Based on your progress, here are some recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Recommended Actions:</h4>
              <ul className="text-sm space-y-2">
                <li>• Practice 2-3 technical questions this week</li>
                <li>• Focus on STAR method for behavioral questions</li>
                <li>• Record yourself to improve body language</li>
                <li>• Try a live mock interview session</li>
              </ul>
            </div>
            <div className="flex flex-col space-y-3">
              <Button asChild className="w-full">
                <Link href="/setup">Start Practice Session</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/feedback">Review Last Feedback</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
