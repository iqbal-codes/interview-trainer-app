# **UI Component Specifications & Wireframes (Textual)**

## **Phase 8: Feedback & Dashboard Pages**

This document outlines the UI for the main user dashboard (interview history) and the detailed feedback review page.

## **1\. Interview History / Dashboard Page**

- **Route:** /dashboard (Protected Route)
- **Purpose:** To serve as the main landing page for logged-in users, displaying a list of their past interview sessions.
- **Layout:** A clean layout with a prominent title and a **grid of cards** listing the sessions.
- **Components & Structure:**
  - \<div className="container mx-auto p-4 md:p-8"\>
    - \<div className="flex justify-between items-center mb-6"\>
      - \<h1 className="text-3xl font-bold"\>My Interview History\</h1\>
      - \<Button asChild\>\<Link href="/interviews/new"\>Start New Interview\</Link\>\</Button\> (Assuming the setup form moves to /interviews/new)
    - \</div\>
    - **Interview Sessions Grid:**
    - \<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"\>
      - _(This area will be populated by mapping over the data fetched from the API)_
      - \<Card key={session.id} className="flex flex-col"\>
        - \<CardHeader\>
          - \<CardTitle className="truncate"\>{session.target_role}\</CardTitle\>
          - \<CardDescription\>{session.interview_type} Interview\</CardDescription\>
        - \</CardHeader\>
        - \<CardContent className="space-y-2 flex-grow"\>
          - \<p className="text-sm text-muted-foreground"\>Completed: {format(new Date(session.completed_at), 'PPP')}\</p\>
          - \<Badge\>{session.status}\</Badge\>
        - \</CardContent\>
        - \<CardFooter\>
          - \<Button variant="outline" asChild className="w-full"\>\<Link href={'/interviews/' \+ session.id \+ '/feedback'}\>View Feedback\</Link\>\</Button\>
        - \</CardFooter\>
      - \</Card\>
    - \</div\>
  - \</div\>
- **Interactions:**
  - **Page Load (useEffect):**
    1. Fetch the list of interview sessions by calling the GET /api/interviews endpoint.
    2. Store the returned array in component state.
    3. Render the grid of cards based on the state. Handle loading and error states gracefully.

## **2\. Interview Feedback Page**

- **Route:** /interviews/\[sessionId\]/feedback (Protected Route)
- **Purpose:** To display the detailed, AI-generated feedback for a specific completed interview session.
- **Layout:** A structured, easy-to-read report format using cards for different sections.
- **Components & Structure:**
  - \<div className="container mx-auto p-4 md:p-8"\>
    - \<div className="mb-6"\>
      - \<Button variant="outline" asChild\>\<Link href="/dashboard"\>← Back to History\</Link\>\</Button\>
      - \<h1 className="text-3xl font-bold mt-4"\>Interview Feedback Report\</h1\>
      - \<p className="text-muted-foreground"\>For your session on {format(new Date(feedback.feedback_generated_at), 'PPP')}\</p\>
    - \</div\>
    - **Feedback Sections:**
    - \<div className="grid gap-6 md:grid-cols-2"\>
      - **Overall Summary Card:**
      - \<Card className="md:col-span-2"\>
        - \<CardHeader\>\<CardTitle\>Overall Summary\</CardTitle\>\</CardHeader\>
        - \<CardContent\>\<p\>{feedback.overall_summary}\</p\>\</CardContent\>
      - \</Card\>
      - **Strengths Card:**
      - \<Card className="border-green-500"\>
        - \<CardHeader\>\<CardTitle className="flex items-center"\>\<CheckCircle2 className="mr-2 text-green-500" /\> Strengths\</CardTitle\>\</CardHeader\>
        - \<CardContent\>\<p\>{feedback.strengths_feedback}\</p\>\</CardContent\>
      - \</Card\>
      - **Areas for Improvement Card:**
      - \<Card className="border-orange-500"\>
        - \<CardHeader\>\<CardTitle className="flex items-center"\>\<AlertTriangle className="mr-2 text-orange-500" /\> Areas for Improvement\</CardTitle\>\</CardHeader\>
        - \<CardContent\>\<p\>{feedback.areas_for_improvement_feedback}\</p\>\</CardContent\>
      - \</Card\>
      - **Actionable Suggestions Card:**
      - \<Card className="md:col-span-2 bg-secondary"\>
        - \<CardHeader\>\<CardTitle className="flex items-center"\>\<Lightbulb className="mr-2 text-yellow-500" /\> Actionable Suggestions\</CardTitle\>\</CardHeader\>
        - \<CardContent\>\<p\>{feedback.actionable_suggestions}\</p\>\</CardContent\>
      - \</Card\>
    - \</div\>
  - \</div\>
- **Interactions:**
  - **Page Load (useEffect):**
    1. Extract sessionId from the URL.
    2. Fetch the feedback report by calling the GET /api/interviews/{sessionId}/feedback endpoint.
    3. Store the returned feedback object in state.
    4. Populate the UI with the feedback data. Handle loading and error states (e.g., if feedback is not found or still processing).
