"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CvUploadResponse {
  message: string;
  cv_upload_id: string;
  file_name: string;
  cv_text_preview?: string;
}

interface CVUploadProps {
  currentCvName?: string;
  currentCvUploadDate?: string;
  cvTextPreview?: string;
  onUploadSuccess?: (data: CvUploadResponse) => void;
}

export function CVUpload({
  currentCvName,
  currentCvUploadDate,
  cvTextPreview,
  onUploadSuccess,
}: CVUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    // Check file type
    if (
      selectedFile.type !== "application/pdf" &&
      selectedFile.type !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      toast.error("Only PDF and DOCX files are allowed");
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (selectedFile.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("cvFile", selectedFile);

      // Send to API
      const response = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload CV");
      }

      const data = await response.json();
      toast.success("CV uploaded successfully");
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFile(null);
      
      // Callback for parent component
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (error) {
      toast.error((error as Error).message || "An error occurred while uploading your CV");
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Curriculum Vitae (CV) / Resume</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload your CV in PDF or DOCX format (max 5MB). This will be used to
          provide better context for your mock interviews.
        </p>
        
        <div className="space-y-2">
          <Label htmlFor="cvFile">Upload CV</Label>
          <Input
            ref={fileInputRef}
            type="file"
            id="cvFile"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
        </div>
        
        <Button 
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? "Uploading..." : "Upload CV"}
        </Button>
        
        {currentCvName && (
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <strong>Current CV:</strong> {currentCvName}{" "}
              {currentCvUploadDate && `(Uploaded: ${formatDate(currentCvUploadDate)})`}
            </p>
            {cvTextPreview && (
              <div>
                <p><strong>CV Text Preview:</strong></p>
                <p className="text-muted-foreground text-xs mt-1 border p-2 rounded bg-muted/50 max-h-32 overflow-y-auto">
                  {cvTextPreview}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 