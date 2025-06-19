"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Upload, Save, Edit, Award, Target } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    title: "Software Engineer",
    company: "Tech Corp",
    experience: "5 years",
    education: "BS Computer Science",
    bio: "Passionate software engineer with 5 years of experience in full-stack development. Looking to advance to senior roles at top tech companies.",
    skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
    goals: [
      "Land a senior software engineer role at FAANG",
      "Improve system design interview skills",
      "Achieve 90+ average interview score",
    ],
    preferences: {
      interviewTypes: ["technical", "behavioral"],
      difficulty: "intermediate",
      sessionLength: "30-45 minutes",
      notifications: true,
    },
  })

  const handleSave = () => {
    // Save profile data
    localStorage.setItem("userProfile", JSON.stringify(profile))
    setIsEditing(false)
  }

  const handleSkillAdd = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }))
    }
  }

  const handleSkillRemove = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your personal information and interview preferences</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
          {isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="goals">Goals & Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Upload a professional photo for your profile</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src="/placeholder.svg?height=128&width=128" alt={profile.name} />
                  <AvatarFallback className="text-2xl">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic contact and personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      ) : (
                        <span>{profile.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                        />
                      ) : (
                        <span>{profile.email}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                        />
                      ) : (
                        <span>{profile.phone}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                        />
                      ) : (
                        <span>{profile.location}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="professional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Your work experience and professional background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Current Title</Label>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        id="title"
                        value={profile.title}
                        onChange={(e) => setProfile((prev) => ({ ...prev, title: e.target.value }))}
                      />
                    ) : (
                      <span>{profile.title}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        id="company"
                        value={profile.company}
                        onChange={(e) => setProfile((prev) => ({ ...prev, company: e.target.value }))}
                      />
                    ) : (
                      <span>{profile.company}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  {isEditing ? (
                    <Select
                      value={profile.experience}
                      onValueChange={(value) => setProfile((prev) => ({ ...prev, experience: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1 years">0-1 years</SelectItem>
                        <SelectItem value="2-3 years">2-3 years</SelectItem>
                        <SelectItem value="4-5 years">4-5 years</SelectItem>
                        <SelectItem value="6-10 years">6-10 years</SelectItem>
                        <SelectItem value="10+ years">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span>{profile.experience}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        id="education"
                        value={profile.education}
                        onChange={(e) => setProfile((prev) => ({ ...prev, education: e.target.value }))}
                      />
                    ) : (
                      <span>{profile.education}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview Preferences</CardTitle>
              <CardDescription>Customize your interview practice experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Preferred Interview Types</Label>
                <div className="flex flex-wrap gap-2">
                  {["hr", "technical", "behavioral", "mixed"].map((type) => (
                    <Badge
                      key={type}
                      variant={profile.preferences.interviewTypes.includes(type) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (isEditing) {
                          setProfile((prev) => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              interviewTypes: prev.preferences.interviewTypes.includes(type)
                                ? prev.preferences.interviewTypes.filter((t) => t !== type)
                                : [...prev.preferences.interviewTypes, type],
                            },
                          }))
                        }
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                {isEditing ? (
                  <Select
                    value={profile.preferences.difficulty}
                    onValueChange={(value) =>
                      setProfile((prev) => ({
                        ...prev,
                        preferences: { ...prev.preferences, difficulty: value },
                      }))
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary" className="capitalize">
                    {profile.preferences.difficulty}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>Preferred Session Length</Label>
                {isEditing ? (
                  <Select
                    value={profile.preferences.sessionLength}
                    onValueChange={(value) =>
                      setProfile((prev) => ({
                        ...prev,
                        preferences: { ...prev.preferences, sessionLength: value },
                      }))
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15-30 minutes">15-30 minutes</SelectItem>
                      <SelectItem value="30-45 minutes">30-45 minutes</SelectItem>
                      <SelectItem value="45-60 minutes">45-60 minutes</SelectItem>
                      <SelectItem value="60+ minutes">60+ minutes</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">{profile.preferences.sessionLength}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Career Goals
                </CardTitle>
                <CardDescription>Your interview and career objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.goals.map((goal, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <p className="text-sm">{goal}</p>
                    </div>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Goal
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Skills & Technologies
                </CardTitle>
                <CardDescription>Your technical and professional skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className={isEditing ? "cursor-pointer" : ""}
                        onClick={() => isEditing && handleSkillRemove(skill)}
                      >
                        {skill}
                        {isEditing && " ×"}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a skill..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSkillAdd(e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                      <Button variant="outline" size="sm">
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {isEditing && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  )
}
