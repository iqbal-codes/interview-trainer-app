"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Calendar, Target, TrendingUp, Video, MessageSquare, ArrowRight } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalSessions: number
  averageScore: number
  weeklyGoal: number
  completedThisWeek: number
  improvementTrend: number
  nextGoal: string
}

interface RecentSession {
  id: string
  date: string
  type: "live" | "practice"
  jobTitle: string
  score: number
  questionsAnswered: number
  totalQuestions: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    averageScore: 0,
    weeklyGoal: 3,
    completedThisWeek: 0,
    improvementTrend: 0,
    nextGoal: "Complete 3 practice sessions this week",
  })

  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])

  useEffect(() => {
    // Load data from localStorage
    const sessions = JSON.parse(localStorage.getItem("interviewSessions") || "[]")

    // Calculate stats
    if (sessions.length > 0) {
      const totalSessions = sessions.length
      const averageScore =
        sessions.reduce((sum: number, session: any) => sum + (session.overallScore || 75), 0) / totalSessions

      // Get sessions from this week
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const thisWeekSessions = sessions.filter((session: any) => new Date(session.date) > weekAgo)

      // Calculate improvement trend
      let improvementTrend = 0
      if (sessions.length >= 2) {
        const recent =
          sessions.slice(-3).reduce((sum: number, session: any) => sum + (session.overallScore || 75), 0) /
          Math.min(3, sessions.length)
        const earlier =
          sessions.slice(0, -3).reduce((sum: number, session: any) => sum + (session.overallScore || 75), 0) /
          Math.max(1, sessions.length - 3)
        improvementTrend = recent - earlier
      }

      setStats({
        totalSessions,
        averageScore: Math.round(averageScore),
        weeklyGoal: 3,
        completedThisWeek: thisWeekSessions.length,
        improvementTrend: Math.round(improvementTrend),
        nextGoal: "Complete 3 practice sessions this week",
      })

      // Set recent sessions
      const recentSessionsData = sessions.slice(-5).map((session: any, index: number) => ({
        id: `session-${index}`,
        date: session.date,
        type: session.mode,
        jobTitle: session.setup?.jobTitle || "Interview Practice",
        score: session.overallScore || Math.floor(Math.random() * 20) + 75,
        questionsAnswered: session.questionsAnswered,
        totalQuestions: session.totalQuestions,
      }))

      setRecentSessions(recentSessionsData.reverse())
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, John!</h1>
          <p className="text-muted-foreground">Here's your interview preparation progress overview</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Practice sessions completed</p>
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
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedThisWeek}/{stats.weeklyGoal}
            </div>
            <Progress value={(stats.completedThisWeek / stats.weeklyGoal) * 100} className="h-2 mt-2" />
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
            <p className="text-xs text-muted-foreground">Points vs last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Sessions */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Interview Sessions</CardTitle>
            <CardDescription>Your latest practice sessions and performance</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No sessions yet</p>
                <Button asChild>
                  <Link href="/setup">Start Your First Interview</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                        {session.type === "live" ? (
                          <Video className="h-5 w-5 text-blue-600" />
                        ) : (
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{session.jobTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString()} •{session.questionsAnswered} of{" "}
                          {session.totalQuestions} questions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={getScoreBadge(session.score)}>{session.score}/100</Badge>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Tasks */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start practicing or review your progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link href="/interview/live">
                <Video className="mr-2 h-4 w-4" />
                Start Mock Interview
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/progress">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Progress Report
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
