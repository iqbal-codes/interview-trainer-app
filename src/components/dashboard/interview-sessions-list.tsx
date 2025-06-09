"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface InterviewSession {
  id: string;
  created_at: string;
  target_role: string;
  interview_type: string;
  status: string;
  actual_num_questions: number;
  overall_score: number | null;
}

export function InterviewSessionsList() {
  const [sessions, setSessions] = useState<InterviewSession[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("interview_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        setSessions(data);
      } catch (error) {
        console.error("Error fetching interview sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessions();
  }, [user, supabase]);
  
  if (isLoading) {
    return <SessionsLoadingSkeleton />;
  }
  
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">No interview sessions yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first interview session to start practicing
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Recent Interview Sessions</h2>
        <Link href="/dashboard/new">
          <Button>New Interview</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold truncate">
                  {session.target_role}
                </CardTitle>
                <StatusIndicator status={session.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(session.created_at), "MMM d, yyyy")}
              </p>
            </CardHeader>
            
            <CardContent className="pb-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p>{session.interview_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Questions</p>
                  <p>{session.actual_num_questions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Score</p>
                  <p>{session.overall_score !== null ? `${session.overall_score}/10` : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="capitalize">{session.status.replace(/_/g, " ")}</p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2">
              <Link href={`/interviews/${session.id}`} className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  {session.status === "completed" ? "View Results" : "Continue Interview"}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  let color = "bg-gray-400";
  
  switch (status) {
    case "completed":
      color = "bg-green-500";
      break;
    case "in_progress":
    case "ready_to_start":
      color = "bg-blue-500";
      break;
    case "abandoned":
      color = "bg-red-500";
      break;
  }
  
  return (
    <div className="flex items-center">
      <div className={`w-2 h-2 rounded-full ${color}`} />
    </div>
  );
}

function SessionsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-[80%]" />
              <Skeleton className="h-4 w-[40%]" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-2 gap-2">
                {Array(4).fill(0).map((_, j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-[60%] mb-1" />
                    <Skeleton className="h-4 w-[40%]" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 