"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Target, Clock, Award, Zap } from "lucide-react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [analytics, setAnalytics] = useState({
    performanceMetrics: {
      averageScore: 84,
      improvement: 12,
      consistency: 78,
      timeSpent: 24.5,
    },
    skillBreakdown: {
      communication: 88,
      technical: 76,
      behavioral: 82,
      problemSolving: 79,
      leadership: 85,
    },
    interviewTypes: {
      hr: { sessions: 12, averageScore: 87 },
      technical: { sessions: 8, averageScore: 78 },
      behavioral: { sessions: 15, averageScore: 85 },
    },
    weeklyProgress: [
      { week: "Week 1", score: 72 },
      { week: "Week 2", score: 76 },
      { week: "Week 3", score: 81 },
      { week: "Week 4", score: 84 },
    ],
    strengths: [
      "Clear communication style",
      "Strong problem-solving approach",
      "Good use of examples",
      "Confident presentation",
    ],
    improvements: [
      "Technical depth in answers",
      "Concise storytelling",
      "Body language awareness",
      "Question clarification",
    ],
  })

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-green-500"
    if (score >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Detailed insights into your interview performance</p>
        </div>
        <div className="flex space-x-2">
          <Badge
            variant={timeRange === "7d" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setTimeRange("7d")}
          >
            7 Days
          </Badge>
          <Badge
            variant={timeRange === "30d" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setTimeRange("30d")}
          >
            30 Days
          </Badge>
          <Badge
            variant={timeRange === "90d" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setTimeRange("90d")}
          >
            90 Days
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(analytics.performanceMetrics.averageScore)}`}>
              {analytics.performanceMetrics.averageScore}
            </div>
            <p className="text-xs text-muted-foreground">+{analytics.performanceMetrics.improvement} from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistency</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performanceMetrics.consistency}%</div>
            <p className="text-xs text-muted-foreground">Performance stability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performanceMetrics.timeSpent}h</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{analytics.performanceMetrics.improvement}</div>
            <p className="text-xs text-muted-foreground">Points gained</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList>
          <TabsTrigger value="skills">Skill Analysis</TabsTrigger>
          <TabsTrigger value="types">Interview Types</TabsTrigger>
          <TabsTrigger value="progress">Progress Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Skill Breakdown</CardTitle>
                <CardDescription>Your performance across different skill areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analytics.skillBreakdown).map(([skill, score]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{skill.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className={`font-medium ${getScoreColor(score)}`}>{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>How your scores are distributed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Excellent (85-100)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-200 rounded">
                        <div className="w-16 h-2 bg-green-500 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">67%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Good (70-84)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-200 rounded">
                        <div className="w-8 h-2 bg-yellow-500 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Needs Work (0-69)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-200 rounded">
                        <div className="w-2 h-2 bg-red-500 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">8%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(analytics.interviewTypes).map(([type, data]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="capitalize">{type} Interviews</CardTitle>
                  <CardDescription>{data.sessions} sessions completed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Score</span>
                      <span className={`font-bold ${getScoreColor(data.averageScore)}`}>{data.averageScore}</span>
                    </div>
                    <Progress value={data.averageScore} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {data.sessions} sessions • {Math.round((data.sessions / 35) * 100)}% of total
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress Trend</CardTitle>
              <CardDescription>Your score improvement over the past 4 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.weeklyProgress.map((week, index) => (
                  <div key={week.week} className="flex items-center space-x-4">
                    <span className="text-sm font-medium w-16">{week.week}</span>
                    <div className="flex-1">
                      <Progress value={week.score} className="h-3" />
                    </div>
                    <span className={`text-sm font-bold w-8 ${getScoreColor(week.score)}`}>{week.score}</span>
                    {index > 0 && (
                      <span
                        className={`text-xs w-8 ${
                          week.score > analytics.weeklyProgress[index - 1].score ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {week.score > analytics.weeklyProgress[index - 1].score ? "+" : ""}
                        {week.score - analytics.weeklyProgress[index - 1].score}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <Award className="mr-2 h-5 w-5" />
                  Your Strengths
                </CardTitle>
                <CardDescription>Areas where you consistently perform well</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <Zap className="mr-2 h-5 w-5" />
                  Growth Opportunities
                </CardTitle>
                <CardDescription>Areas with the most potential for improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <p className="text-sm">{improvement}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions based on your performance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Focus Area</h4>
                  <p className="text-sm text-blue-700">
                    Your technical interview scores show room for improvement. Consider practicing more coding problems
                    and system design questions.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Strength to Leverage</h4>
                  <p className="text-sm text-green-700">
                    Your communication skills are excellent. Use this strength to better explain your technical
                    solutions and thought processes.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-2">Practice Schedule</h4>
                  <p className="text-sm text-purple-700">
                    Based on your consistency, aim for 3-4 practice sessions per week to maintain your improvement
                    momentum.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">Next Milestone</h4>
                  <p className="text-sm text-yellow-700">
                    You're close to achieving a 90+ average score. Focus on behavioral questions to reach this
                    milestone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
