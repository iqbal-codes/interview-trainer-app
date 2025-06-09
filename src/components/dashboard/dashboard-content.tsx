"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/context/auth-context";
import { InterviewStats } from "./interview-stats";
import { InterviewSessionsList } from "./interview-sessions-list";
import { InterviewSetupForm } from "@/components/interview/interview-setup-form";

export function DashboardContent() {
  const [hasInterviews, setHasInterviews] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const checkInterviews = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Check if the user has any interview sessions
        const { count, error } = await supabase
          .from("interview_sessions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
          
        if (error) throw error;
        
        setHasInterviews(count !== null && count > 0);
      } catch (error) {
        console.error("Error checking interview sessions:", error);
        setHasInterviews(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkInterviews();
  }, [user, supabase]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading...</p>
      </div>
    );
  }
  
  // If the user has no interviews, show the setup form
  if (hasInterviews === false) {
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Interview Trainer</h2>
          <p className="text-muted-foreground mb-6">
            Get started by setting up your first interview practice session
          </p>
        </div>
        <InterviewSetupForm 
          onSuccess={() => setHasInterviews(true)}
        />
      </div>
    );
  }
  
  // If the user has interviews, show the stats and list
  return (
    <div className="space-y-8">
      <InterviewStats />
      <InterviewSessionsList />
    </div>
  );
} 