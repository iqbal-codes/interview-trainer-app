"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

interface InterviewStats {
  total: number;
  completed: number;
  inProgress: number;
  averageScore: number | null;
}

export function InterviewStats() {
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch interview sessions
        const { data: sessions, error } = await supabase
          .from("interview_sessions")
          .select("*")
          .eq("user_id", user.id);
          
        if (error) throw error;
        
        // Calculate stats
        const total = sessions?.length || 0;
        const completed = sessions?.filter(session => session.status === "completed").length || 0;
        const inProgress = sessions?.filter(session => 
          session.status === "in_progress" || session.status === "ready_to_start"
        ).length || 0;
        
        // Calculate average score if any sessions have scores
        let averageScore = null;
        const sessionsWithScores = sessions?.filter(session => session.overall_score !== null);
        
        if (sessionsWithScores && sessionsWithScores.length > 0) {
          const totalScore = sessionsWithScores.reduce(
            (sum, session) => sum + (session.overall_score || 0), 
            0
          );
          averageScore = Math.round((totalScore / sessionsWithScores.length) * 10) / 10;
        }
        
        setStats({
          total,
          completed,
          inProgress,
          averageScore
        });
        
      } catch (error) {
        console.error("Error fetching interview stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [user, supabase]);
  
  if (isLoading) {
    return <StatsLoadingSkeleton />;
  }
  
  if (!stats || stats.total === 0) {
    return null;
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completed}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inProgress}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageScore !== null ? `${stats.averageScore}/10` : "N/A"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {Array(4).fill(0).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-[100px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 