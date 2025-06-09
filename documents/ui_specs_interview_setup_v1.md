# **UI Component Specifications & Wireframes (Textual)**

## **Phase 4: New Interview Setup Page**

This document outlines the UI specifications for the "New Interview Setup" page. This page allows users to configure and generate a new mock interview session. We will continue using Next.js, TypeScript, Tailwind CSS, Shadcn/ui components, **React Hook Form for form state and submission, and Zod for validation.**

## **1\. Page Details**

* **Route:** /dashboard (For simplicity, we can assume this form is the main content of the dashboard for now. Alternatively, it could be /interviews/new). This page is a **Protected Route** and requires user login.  
* **Purpose:** Allows users to input their preferences for a mock interview (target role, skills, type, etc.) and then generate the interview session.  
* **Layout:** A prominent form, likely centered or taking the main content area of the dashboard.

## **2\. Form for New Interview Setup**

* **Form Handling:** Use react-hook-form for form state, submission, and Zod for schema-based validation.  
* **Components & Structure (within the /dashboard page):**  
  * \<div className="container mx-auto p-4 md:p-8"\>  
    * \<h1 className="text-3xl font-bold mb-6"\>Setup New Mock Interview\</h1\>  
    * \<Card className="w-full max-w-2xl mx-auto"\>  
      * \<CardHeader\>  
        * \<CardTitle className="text-xl font-semibold"\>Configure Your Practice Session\</CardTitle\>  
        * \<CardDescription\>Fill in the details below to generate a tailored interview experience.\</CardDescription\>  
      * \</CardHeader\>  
      * \<form onSubmit={handleSubmit(onSubmit)}\> {/\* react-hook-form handleSubmit \*/}  
        * \<CardContent className="space-y-6"\>  
          * **Target Role Input:**  
            * \<FormField control={form.control} name="target\_role" render={({ field }) \=\> ( \<FormItem\> \<FormLabel\>Target Role\</FormLabel\> \<FormControl\>\<Input placeholder="e.g., Software Engineer, Product Manager" {...field} /\>\</FormControl\> \<FormDescription\>What role are you practicing for?\</FormDescription\> \<FormMessage /\> \</FormItem\> )}/\>  
          * **Key Skills Input:**  
            * \<FormField control={form.control} name="key\_skills\_focused" render={({ field }) \=\> ( \<FormItem\> \<FormLabel\>Key Skills to Focus On\</FormLabel\> \<FormControl\>\<Input placeholder="e.g., React, Node.js, Problem Solving" {...field} /\>\</FormControl\> \<FormDescription\>Enter skills separated by commas.\</FormDescription\> \<FormMessage /\> \</FormItem\> )}/\>  
            * *(Note: For a more advanced version, a tag input could be used here. For now, a comma-separated string that we parse in the backend or before sending is fine.)*  
          * **Interview Type Select:**  
            * \<FormField control={form.control} name="interview\_type" render={({ field }) \=\> ( \<FormItem\> \<FormLabel\>Interview Type\</FormLabel\> \<Select onValueChange={field.onChange} defaultValue={field.value}\> \<FormControl\>\<SelectTrigger\>\<SelectValue placeholder="Select an interview type" /\>\</SelectTrigger\>\</FormControl\> \<SelectContent\> \<SelectItem value="Behavioral"\>Behavioral\</SelectItem\> \<SelectItem value="Technical \- General"\>Technical \- General\</SelectItem\> \<SelectItem value="HR Screening"\>HR Screening\</SelectItem\> \<SelectItem value="Situational"\>Situational\</SelectItem\> \</SelectContent\> \</Select\> \<FormDescription\>Choose the type of interview.\</FormDescription\> \<FormMessage /\> \</FormItem\> )}/\>  
          * **Job Description Textarea (Optional):**  
            * \<FormField control={form.control} name="job\_description\_context" render={({ field }) \=\> ( \<FormItem\> \<FormLabel\>Job Description (Optional)\</FormLabel\> \<FormControl\>\<Textarea placeholder="Paste job description here for more targeted questions..." className="min-h-\[100px\]" {...field} /\>\</FormControl\> \<FormDescription\>Providing a job description can help generate more relevant questions.\</FormDescription\> \<FormMessage /\> \</FormItem\> )}/\>  
          * **Number of Questions Select/Input:**  
            * \<FormField control={form.control} name="requested\_num\_questions" render={({ field }) \=\> ( \<FormItem\> \<FormLabel\>Number of Questions\</FormLabel\> \<Select onValueChange={(value) \=\> field.onChange(parseInt(value))} defaultValue={String(field.value)}\> \<FormControl\>\<SelectTrigger\>\<SelectValue placeholder="Select number of questions" /\>\</SelectTrigger\>\</FormControl\> \<SelectContent\> \<SelectItem value="3"\>3 Questions\</SelectItem\> \<SelectItem value="5"\>5 Questions\</SelectItem\> \<SelectItem value="7"\>7 Questions\</SelectItem\> \<SelectItem value="10"\>10 Questions\</SelectItem\> \</SelectContent\> \</Select\> \<FormDescription\>How many questions would you like in this session?\</FormDescription\> \<FormMessage /\> \</FormItem\> )}/\>  
        * \</CardContent\>  
        * \<CardFooter className="flex justify-end"\>  
          * **Submit Button:**  
            * \<Button type="submit" disabled={form.formState.isSubmitting}\> {form.formState.isSubmitting ? "Generating..." : "Generate Interview"} \</Button\>  
        * \</CardFooter\>  
      * \</form\>  
      * **General Error Display Area (for API errors):** A small text area outside or below the form, if needed.  
    * \</Card\>  
  * \</div\>

## **3\. Interactions & Validation**

* **Zod Schema:** Define a Zod schema for form validation:  
  * target\_role: string, required, min length (e.g., 3).  
  * key\_skills\_focused: string, required (can be processed later into an array).  
  * interview\_type: string (enum of allowed values), required.  
  * job\_description\_context: string, optional.  
  * requested\_num\_questions: number, required, must be one of the allowed values (e.g., 3, 5, 7, 10).  
* **React Hook Form:**  
  * Use useForm hook, integrating the Zod schema via @hookform/resolvers/zod.  
  * Field-level error messages will be displayed by \<FormMessage /\>.  
* **Form Submission (onSubmit function):**  
  * The onSubmit function (passed to handleSubmit) will:  
    1. Take the validated form data.  
    2. Potentially transform key\_skills\_focused from a comma-separated string into an array of strings if the API expects an array (or handle this transformation on the backend).  
    3. Call the /api/interviews/generate endpoint (POST request) with the payload.  
* **API Call Handling:**  
  * Manage loading state (e.g., disabling the button and showing "Generating...").  
  * **On Success:**  
    * Receive session\_id and questions from the API.  
    * Store this information (e.g., in component state or a global state manager like Zustand if we decide to use one for this).  
    * Navigate the user to the interview session page, e.g., /interviews/\[sessionId\] (we'll create this page in a later phase). For now, it could log the response or show a success message.  
  * **On Error:**  
    * Display API error messages to the user (e.g., in the general error display area or using a toast notification).