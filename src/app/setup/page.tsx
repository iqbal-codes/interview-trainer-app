"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface InterviewSetup {
  jobTitle: string
  interviewType: string
  numQuestions: string
  jobDescription: string
  resume: File | null
  experience: string
  company: string
  industry: string
}

export default function SetupPage() {
  const router = useRouter()
  const [setup, setSetup] = useState<InterviewSetup>({
    jobTitle: "",
    interviewType: "",
    numQuestions: "",
    jobDescription: "",
    resume: null,
    experience: "",
    company: "",
    industry: "",
  })

  const [step, setStep] = useState(1)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = (file: File) => {
    if (file.type === "application/pdf" || file.type.includes("document")) {
      setSetup((prev) => ({ ...prev, resume: file }))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const canProceed = () => {
    if (step === 1) {
      return setup.jobTitle && setup.interviewType && setup.numQuestions && setup.industry
    }
    return true
  }

  const handleStartInterview = () => {
    // Save setup to localStorage
    localStorage.setItem("interviewSetup", JSON.stringify(setup))

    // Navigate to interview details page
    router.push("/interview/details")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex space-x-2">
            <Badge variant={step >= 1 ? "default" : "secondary"}>1</Badge>
            <Badge variant={step >= 2 ? "default" : "secondary"}>2</Badge>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Interview Setup</CardTitle>
              <CardDescription>Let&apos;s configure your interview practice session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Software Engineer, Product Manager"
                  value={setup.jobTitle}
                  onChange={(e) => setSetup((prev) => ({ ...prev, jobTitle: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interviewType">Interview Type *</Label>
                <Select
                  value={setup.interviewType}
                  onValueChange={(value) => setSetup((prev) => ({ ...prev, interviewType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR Interview</SelectItem>
                    <SelectItem value="technical">Technical Interview</SelectItem>
                    <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                    <SelectItem value="mixed">Mixed (HR + Technical + Behavioral)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numQuestions">Number of Questions *</Label>
                <Select
                  value={setup.numQuestions}
                  onValueChange={(value) => setSetup((prev) => ({ ...prev, numQuestions: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of questions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions (15 mins)</SelectItem>
                    <SelectItem value="10">10 Questions (30 mins)</SelectItem>
                    <SelectItem value="15">15 Questions (45 mins)</SelectItem>
                    <SelectItem value="20">20 Questions (60 mins)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Select
                  value={setup.experience}
                  onValueChange={(value) => setSetup((prev) => ({ ...prev, experience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                    <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={setup.industry}
                  onValueChange={(value) => setSetup((prev) => ({ ...prev, industry: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => setStep(2)} className="w-full" disabled={!canProceed()}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Optional Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Optional information to personalize your interview experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company">Target Company</Label>
                <Input
                  id="company"
                  placeholder="e.g., Google, Microsoft, Startup"
                  value={setup.company}
                  onChange={(e) => setSetup((prev) => ({ ...prev, company: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the job description here for more targeted questions..."
                  value={setup.jobDescription}
                  onChange={(e) => setSetup((prev) => ({ ...prev, jobDescription: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Resume Upload</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  {setup.resume ? (
                    <div>
                      <p className="text-sm font-medium text-green-600">✓ {setup.resume.name}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setSetup((prev) => ({ ...prev, resume: null }))}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Drag and drop your resume here, or click to browse</p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                        id="resume-upload"
                      />
                      <Button variant="outline" size="sm" asChild>
                        <label htmlFor="resume-upload" className="cursor-pointer">
                          Choose File
                        </label>
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">Supports PDF, DOC, DOCX</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Your Interview Summary</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    <strong>Position:</strong> {setup.jobTitle}
                  </p>
                  <p>
                    <strong>Type:</strong> {setup.interviewType}
                  </p>
                  <p>
                    <strong>Questions:</strong> {setup.numQuestions}
                  </p>
                  <p>
                    <strong>Industry:</strong> {setup.industry}
                  </p>
                  {setup.company && (
                    <p>
                      <strong>Company:</strong> {setup.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleStartInterview} className="flex-1">
                  Start Interview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
