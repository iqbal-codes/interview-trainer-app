import { ProtectedRoute } from "@/components/auth/protected-route";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container py-10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            <Button asChild>
              <a href="/interview/new">New Interview</a>
            </Button>
          </div>

          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
              <TabsTrigger value="recent">Recent Interviews</TabsTrigger>
              <TabsTrigger value="stats">Your Stats</TabsTrigger>
              <TabsTrigger value="saved">Saved Questions</TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Mock interview cards */}
                <Card>
                  <CardHeader>
                    <CardTitle>Software Engineer</CardTitle>
                    <CardDescription>Completed on Oct 12, 2023</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>10 questions • 25 minutes</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Performance: Good
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Manager</CardTitle>
                    <CardDescription>Completed on Oct 5, 2023</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>12 questions • 30 minutes</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Performance: Excellent
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="stats" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Interview Statistics</CardTitle>
                  <CardDescription>
                    Track your progress over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Total Interviews
                        </p>
                        <p className="text-3xl font-bold">12</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Questions Answered
                        </p>
                        <p className="text-3xl font-bold">124</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Average Rating
                        </p>
                        <p className="text-3xl font-bold">4.2/5</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Time Practiced
                        </p>
                        <p className="text-3xl font-bold">5.5 hrs</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="saved" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Questions</CardTitle>
                  <CardDescription>
                    Questions you&apos;ve marked for review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <p className="font-medium">
                        Tell me about a time you had to deal with a difficult
                        team member.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Saved from: Leadership Interview
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="font-medium">
                        How do you prioritize tasks when you have multiple
                        deadlines?
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Saved from: Project Manager Interview
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="font-medium">
                        Explain a complex technical concept to a non-technical
                        person.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Saved from: Software Engineer Interview
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
