"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Download,
  Search,
  Eye,
  BarChart3,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Star,
  Award,
  MessageSquare,
  Video,
} from "lucide-react"

interface FeedbackReport {
  id: string
  sessionId: string
  date: string
  jobTitle: string
  company: string
  sessionType: "live" | "practice"
  interviewType: string
  overallScore: number
  questionsAnalyzed: number
  reportType: "detailed" | "summary" | "comparison"
  metrics: {
    communication: number
    confidence: number
    clarity: number
    relevance: number
    structure: number
  }
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  questionBreakdown: {
    questionId: number
    question: string
    score: number
    feedback: string
    category: string
  }[]
  aiInsights: string
  nextSteps: string[]
}

export default function FeedbackReportsPage() {
  const [reports, setReports] = useState<FeedbackReport[]>([])
  const [filteredReports, setFilteredReports] = useState<FeedbackReport[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterSession, setFilterSession] = useState("all")

  useEffect(() => {
    // Generate mock feedback report data
    const mockReports: FeedbackReport[] = [
      {
        id: "report-1",
        sessionId: "live-1",
        date: "2024-01-20T14:30:00Z",
        jobTitle: "Senior Software Engineer",
        company: "Google",
        sessionType: "live",
        interviewType: "technical",
        overallScore: 89,
        questionsAnalyzed: 8,
        reportType: "detailed",
        metrics: {
          communication: 92,
          confidence: 85,
          clarity: 88,
          relevance: 91,
          structure: 87,
        },
        strengths: [
          "Excellent technical knowledge and problem-solving approach",
          "Clear communication of complex concepts",
          "Good use of examples from real-world experience",
          "Strong system design thinking",
        ],
        improvements: [
          "Could provide more detailed time complexity analysis",
          "Consider discussing edge cases more thoroughly",
          "Practice explaining trade-offs between different solutions",
        ],
        recommendations: [
          "Review advanced data structures and algorithms",
          "Practice system design interviews with focus on scalability",
          "Work on concise explanation of technical concepts",
        ],
        questionBreakdown: [
          {
            questionId: 1,
            question: "Design a URL shortening service like bit.ly",
            score: 92,
            feedback: "Excellent system design with good consideration of scalability and database design.",
            category: "System Design",
          },
          {
            questionId: 2,
            question: "Implement a function to find the longest palindromic substring",
            score: 85,
            feedback: "Correct algorithm but could optimize time complexity. Good explanation of approach.",
            category: "Algorithms",
          },
        ],
        aiInsights:
          "Your technical skills are strong, particularly in system design. Focus on algorithmic optimization and edge case handling to reach the next level.",
        nextSteps: [
          "Complete 5 more system design practice sessions",
          "Review dynamic programming patterns",
          "Practice explaining solutions under time pressure",
        ],
      },
      {
        id: "report-2",
        sessionId: "practice-2",
        date: "2024-01-18T11:00:00Z",
        jobTitle: "Product Manager",
        company: "Microsoft",
        sessionType: "practice",
        interviewType: "behavioral",
        overallScore: 78,
        questionsAnalyzed: 6,
        reportType: "detailed",
        metrics: {
          communication: 82,
          confidence: 75,
          clarity: 80,
          relevance: 76,
          structure: 79,
        },
        strengths: [
          "Good use of STAR method in responses",
          "Relevant examples from professional experience",
          "Shows leadership potential and team collaboration skills",
        ],
        improvements: [
          "Provide more quantifiable results and metrics",
          "Improve confidence in delivery",
          "Structure answers more concisely",
        ],
        recommendations: [
          "Practice behavioral questions with focus on metrics",
          "Work on confident body language and tone",
          "Prepare 5-7 strong STAR examples that can be adapted",
        ],
        questionBreakdown: [
          {
            questionId: 1,
            question: "Tell me about a time you had to influence without authority",
            score: 82,
            feedback: "Good example with clear outcome, but could include more specific metrics about impact.",
            category: "Leadership",
          },
          {
            questionId: 2,
            question: "Describe a time you failed and what you learned",
            score: 74,
            feedback: "Honest response but could focus more on lessons learned and how you applied them.",
            category: "Growth Mindset",
          },
        ],
        aiInsights:
          "Your behavioral responses show good self-awareness and experience. Focus on quantifying impact and improving delivery confidence.",
        nextSteps: [
          "Prepare metrics-focused STAR examples",
          "Practice confident delivery through mock interviews",
          "Research company-specific behavioral questions",
        ],
      },
      {
        id: "report-3",
        sessionId: "live-3",
        date: "2024-01-16T15:15:00Z",
        jobTitle: "Data Scientist",
        company: "Amazon",
        sessionType: "live",
        interviewType: "mixed",
        overallScore: 91,
        questionsAnalyzed: 10,
        reportType: "detailed",
        metrics: {
          communication: 89,
          confidence: 93,
          clarity: 90,
          relevance: 92,
          structure: 91,
        },
        strengths: [
          "Outstanding statistical knowledge and ML expertise",
          "Excellent communication of technical concepts to non-technical audience",
          "Strong business acumen and problem-solving approach",
          "Confident and engaging presentation style",
        ],
        improvements: [
          "Could discuss more recent ML techniques and frameworks",
          "Practice coding implementation of ML algorithms",
          "Consider discussing ethical implications of ML models",
        ],
        recommendations: [
          "Stay updated with latest ML research and techniques",
          "Practice coding ML algorithms from scratch",
          "Prepare examples of ML ethics and bias mitigation",
        ],
        questionBreakdown: [
          {
            questionId: 1,
            question: "How would you detect and handle bias in a machine learning model?",
            score: 94,
            feedback: "Comprehensive answer covering multiple bias types and mitigation strategies.",
            category: "ML Ethics",
          },
          {
            questionId: 2,
            question: "Design an A/B testing framework for a new feature",
            score: 88,
            feedback: "Good statistical approach, could discuss more about sample size calculation.",
            category: "Statistics",
          },
        ],
        aiInsights:
          "Exceptional performance across all areas. You're well-prepared for senior data science roles. Minor improvements in coding and latest techniques will make you even stronger.",
        nextSteps: [
          "Practice coding ML algorithms in Python",
          "Review latest papers in your domain of interest",
          "Prepare for senior-level system design questions",
        ],
      },
    ]

    setReports(mockReports)
    setFilteredReports(mockReports)
  }, [])

  useEffect(() => {
    let filtered = reports

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.company.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((report) => report.interviewType === filterType)
    }

    // Apply session filter
    if (filterSession !== "all") {
      filtered = filtered.filter((report) => report.sessionType === filterSession)
    }

    setFilteredReports(filtered)
  }, [reports, searchTerm, filterType, filterSession])

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

  const averageScore =
    reports.length > 0 ? Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length) : 0
  const totalQuestions = reports.reduce((sum, r) => sum + r.questionsAnalyzed, 0)
  const recentReports = reports.filter((r) => {
    const reportDate = new Date(r.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return reportDate > weekAgo
  }).length

  const downloadReport = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId)
    if (report) {
      const dataStr = JSON.stringify(report, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `feedback-report-${report.jobTitle}-${report.date.split("T")[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Reports</h1>
          <p className="text-muted-foreground">Detailed analysis and insights from your interview sessions</p>
        </div>
        <Button onClick={() => downloadReport(reports[0]?.id)} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Latest Report
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">{recentReports} this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}</div>
            <p className="text-xs text-muted-foreground">Across all reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Analyzed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">Total feedback given</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12</div>
            <p className="text-xs text-muted-foreground">Points this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Reports</CardTitle>
              <CardDescription>Search and filter your feedback reports</CardDescription>
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
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSession} onValueChange={setFilterSession}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="live">Live Sessions</SelectItem>
                    <SelectItem value="practice">Practice Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Reports</CardTitle>
              <CardDescription>
                {filteredReports.length} of {reports.length} reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100">
                        {report.sessionType === "live" ? (
                          <Video className="h-6 w-6 text-purple-600" />
                        ) : (
                          <MessageSquare className="h-6 w-6 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{report.jobTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          {report.company} • {new Date(report.date).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {report.interviewType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {report.sessionType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {report.questionsAnalyzed} questions analyzed
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(report.overallScore)}`}>
                          {report.overallScore}/100
                        </div>
                        <p className="text-xs text-muted-foreground">Overall score</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => downloadReport(report.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {filteredReports.slice(0, 2).map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle>
                  {report.jobTitle} - {report.company}
                </CardTitle>
                <CardDescription>
                  {report.sessionType} {report.interviewType} interview • {new Date(report.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Performance Metrics */}
                <div>
                  <h4 className="font-medium mb-4">Performance Metrics</h4>
                  <div className="grid gap-4 md:grid-cols-5">
                    {Object.entries(report.metrics).map(([metric, score]) => (
                      <div key={metric} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{metric}</span>
                          <span className={`font-medium ${getScoreColor(score)}`}>{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Question Breakdown */}
                <div>
                  <h4 className="font-medium mb-4">Question Analysis</h4>
                  <div className="space-y-3">
                    {report.questionBreakdown.map((question, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-sm">{question.question}</h5>
                          <Badge variant={getScoreBadge(question.score)} className="ml-2">
                            {question.score}/100
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{question.feedback}</p>
                        <Badge variant="outline" className="text-xs">
                          {question.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths and Improvements */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center text-green-700">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Strengths
                    </h4>
                    <div className="space-y-2">
                      {report.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Star className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{strength}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 flex items-center text-orange-700">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Areas for Improvement
                    </h4>
                    <div className="space-y-2">
                      {report.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Target className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{improvement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                  AI Insights - {report.jobTitle}
                </CardTitle>
                <CardDescription>Personalized recommendations based on your performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">AI Analysis</h4>
                  <p className="text-blue-700 text-sm">{report.aiInsights}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recommended Next Steps</h4>
                  <div className="space-y-2">
                    {report.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Personalized Recommendations</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {report.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-start space-x-2">
                          <Award className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-purple-800">{rec}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Track your improvement over time across different areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Score Progression */}
                <div>
                  <h4 className="font-medium mb-4">Score Progression</h4>
                  <div className="space-y-3">
                    {reports.map((report, index) => (
                      <div key={report.id} className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground w-32">
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                        <div className="flex-1">
                          <Progress value={report.overallScore} className="h-3" />
                        </div>
                        <span className={`text-sm font-medium w-12 ${getScoreColor(report.overallScore)}`}>
                          {report.overallScore}
                        </span>
                        {index > 0 && (
                          <span
                            className={`text-xs w-8 ${
                              report.overallScore > reports[index - 1].overallScore ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {report.overallScore > reports[index - 1].overallScore ? "+" : ""}
                            {report.overallScore - reports[index - 1].overallScore}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Trends */}
                <div>
                  <h4 className="font-medium mb-4">Skill Development Trends</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {["communication", "confidence", "clarity", "relevance"].map((skill) => (
                      <div key={skill} className="p-4 border rounded-lg">
                        <h5 className="font-medium capitalize mb-3">{skill}</h5>
                        <div className="space-y-2">
                          {reports.slice(0, 3).map((report, index) => (
                            <div key={report.id} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {new Date(report.date).toLocaleDateString()}
                              </span>
                              <div className="flex items-center space-x-2">
                                <Progress
                                  value={report.metrics[skill as keyof typeof report.metrics]}
                                  className="h-2 w-20"
                                />
                                <span className="text-sm font-medium w-8">
                                  {report.metrics[skill as keyof typeof report.metrics]}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
