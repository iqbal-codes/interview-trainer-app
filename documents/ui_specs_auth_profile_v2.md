# **UI Component Specifications & Wireframes (Textual)**

## **Phase 3: Authentication UI & Basic Profile (with React Hook Form & Zod)**

This document outlines the UI specifications for the authentication pages (Signup, Login) and a basic User Profile page. We will be using Next.js, TypeScript, Tailwind CSS, Shadcn/ui components, **React Hook Form for form state and submission, and Zod for validation.**

## **1\. General Layout Considerations**

- **App Shell/Navbar (Basic for now):**
  - A simple top navigation bar.
  - Left side: "AI Interview Practice" (Logo/Brand Name).
  - Right side:
    - If not logged in: "Login" button, "Sign Up" button.
    - If logged in: "Dashboard" (or "My Interviews") link, "Profile" link, "Logout" button.
  - Shadcn components: \<NavigationMenu\> or a simple flex div with \<Button variant="link"\> or \<Button variant="ghost"\>.
- **Centering Content:** Forms and main page content should generally be centered on the page, especially for auth forms.
- **Container:** Use a \<Card\> component from Shadcn/ui to wrap forms for a consistent look and feel.

## **2\. Sign-up Page**

- **Route:** /signup
- **Purpose:** Allows new users to create an account.
- **Layout:** Centered form on the page.
- **Form Handling:** Use react-hook-form for form state, submission, and Zod for schema-based validation.
- **Components & Structure:**
  - \<Card className="w-full max-w-md mx-auto mt-10"\>
    - \<CardHeader\>
      - \<CardTitle className="text-2xl font-bold text-center"\>Create an Account\</CardTitle\>
      - \<CardDescription className="text-center"\>Enter your email and password to sign up.\</CardDescription\>
    - \</CardHeader\>
    - \<form onSubmit={handleSubmit(onSubmit)}\> {/\* react-hook-form handleSubmit \*/}
      - \<CardContent className="space-y-4"\>
        - **Email Input:**
          - \<FormField control={form.control} name="email" render={({ field }) \=\> ( \<FormItem\> \<FormLabel\>Email\</FormLabel\> \<FormControl\>\<Input type="email" placeholder="you@example.com" {...field} /\>\</FormControl\> \<FormMessage /\> \</FormItem\> )}/\> (Shadcn/ui Form component with react-hook-form)
        - **Password Input:**
          - \<FormField control={form.control} name="password" render={({ field }) \=\> ( \<FormItem\> \<FormLabel\>Password\</FormLabel\> \<FormControl\>\<Input type="password" placeholder="••••••••" {...field} /\>\</FormControl\> \<FormMessage /\> \</FormItem\> )}/\>
        - **(Optional) Confirm Password Input:**
          - \<FormField control={form.control} name="confirmPassword" render={({ field }) \=\> ( \<FormItem\> \<FormLabel\>Confirm Password\</FormLabel\> \<FormControl\>\<Input type="password" placeholder="••••••••" {...field} /\>\</FormControl\> \<FormMessage /\> \</FormItem\> )}/\>
        - **Submit Button:**
          - \<Button type="submit" className="w-full" disabled={form.formState.isSubmitting}\> {form.formState.isSubmitting ? "Signing up..." : "Sign Up"} \</Button\>
        - **General Error Display Area (for non-field specific errors from Supabase):** A small text area below the button.
      - \</CardContent\>
    - \</form\>
    - \<CardFooter className="text-center text-sm"\>
      - Already have an account? \<Link href="/login" className="underline"\>Login here\</Link\> (Using Next.js \<Link\>)
    - \</CardFooter\>
  - \</Card\>
- **Interactions & Validation:**
  - **Zod Schema:** Define a Zod schema for validation (e.g., email format, password minimum length, password match if confirmPassword is used).
  - **React Hook Form:** Use useForm hook from react-hook-form, integrating the Zod schema via @hookform/resolvers/zod.
  - Field-level error messages will be displayed by \<FormMessage /\>.
  - onSubmit function (passed to handleSubmit) will call the Supabase Auth signUp method.
  - Handles success (e.g., navigates to a confirmation page or directly to login/dashboard) and displays general errors (e.g., "User already registered") in the designated area.
  - After successful Supabase signup, triggers logic to create a corresponding entry in the profiles table.

## **3\. Login Page**

- **Route:** /login
- **Purpose:** Allows existing users to log into their accounts.
- **Layout:** Centered form on the page, similar to the Sign-up page.
- **Form Handling:** Use react-hook-form and Zod.
- **Components & Structure:**
  - \<Card className="w-full max-w-md mx-auto mt-10"\>
    - \<CardHeader\>
      - \<CardTitle className="text-2xl font-bold text-center"\>Welcome Back\!\</CardTitle\>
      - \<CardDescription className="text-center"\>Enter your credentials to access your account.\</CardDescription\>
    - \</CardHeader\>
    - \<form onSubmit={handleSubmit(onSubmit)}\> {/\* react-hook-form handleSubmit \*/}
      - \<CardContent className="space-y-4"\>
        - **Email Input:**
          - \<FormField control={form.control} name="email" render={({ field }) \=\> ( \<FormItem\> \<FormLabel\>Email\</FormLabel\> \<FormControl\>\<Input type="email" placeholder="you@example.com" {...field} /\>\</FormControl\> \<FormMessage /\> \</FormItem\> )}/\>
        - **Password Input:**
          - \<FormField control={form.control} name="password" render={({ field }) \=\> ( \<FormItem\> \<FormLabel\>Password\</FormLabel\> \<FormControl\>\<Input type="password" placeholder="••••••••" {...field} /\>\</FormControl\> \<FormMessage /\> \</FormItem\> )}/\>
        - **Submit Button:**
          - \<Button type="submit" className="w-full" disabled={form.formState.isSubmitting}\> {form.formState.isSubmitting ? "Logging in..." : "Login"} \</Button\>
        - **General Error Display Area:** To display errors (e.g., "Invalid login credentials").
      - \</CardContent\>
    - \</form\>
    - \<CardFooter className="text-center text-sm"\>
      - Don't have an account? \<Link href="/signup" className="underline"\>Sign up now\</Link\>
    - \</CardFooter\>
  - \</Card\>
- **Interactions & Validation:**
  - **Zod Schema:** Define a Zod schema for email and password.
  - **React Hook Form:** Use useForm with Zod resolver.
  - Field-level error messages displayed by \<FormMessage /\>.
  - onSubmit function will call the Supabase Auth signInWithPassword method.
  - Handles success (e.g., navigates to the dashboard) and displays general errors.

## **4\. Basic User Profile Page**

- **Route:** /profile (Protected Route \- requires login)
- **Purpose:** Allows users to view basic profile information and upload/update their CV.
- **Layout:** Content within a main page container, perhaps with a title.
- **Components & Structure:**
  - \<div className="container mx-auto p-4 md:p-8"\>
    - \<h1 className="text-3xl font-bold mb-6"\>Your Profile\</h1\>
    - **User Information Section (Read-only for now):**
      - \<Card className="mb-6"\>
        - \<CardHeader\>\<CardTitle\>Account Information\</CardTitle\>\</CardHeader\>
        - \<CardContent className="space-y-2"\>
          - \<p\>\<strong\>Email:\</strong\> {user.email}\</p\> (Fetched from Supabase session/user object).
          - _(Future: Display full name, years of experience, etc. from profiles table once editable fields are added)_
        - \</CardContent\>
      - \</Card\>
    - **CV Upload Section:**
      - \<Card\>
        - \<CardHeader\>\<CardTitle\>Curriculum Vitae (CV) / Resume\</CardTitle\>\</CardHeader\>
        - \<CardContent className="space-y-4"\>
          - \<p className="text-sm text-muted-foreground"\>Upload your CV in PDF or DOCX format (max 5MB). This will be used to provide better context for your mock interviews.\</p\>
          - **File Input:**
            - \<Label htmlFor="cvFile"\>Upload CV\</Label\>
            - \<Input type="file" id="cvFile" accept=".pdf,.doc,.docx" /\> (File input state might be managed with a simple useState or useRef if not using RHF for this specific part, as RHF for file inputs can be a bit more involved).
          - **Upload Button:**
            - \<Button\>Upload CV\</Button\> (Handles file selection and calls the /api/cv/upload endpoint).
          - **Upload Status/Error Display:** Area to show "Uploading...", "CV uploaded successfully\!", or error messages.
          - **(Optional) Current CV Info:**
            - If a CV has been uploaded: \<p\>\<strong\>Current CV:\</strong\> {cv_uploads.file_name} (Uploaded: {cv_uploads.uploaded_at})\</p\>
            - \<p\>\<strong\>CV Text Preview (first 200 chars):\</strong\> {profiles.cv_text_content_preview}\</p\>
        - \</CardContent\>
      - \</Card\>
  - \</div\>
- **Interactions:**
  - Page should only be accessible if the user is logged in. Redirect to /login if not.
  - Displays the logged-in user's email.
  - CV Upload:
    - User selects a file using the \<Input type="file"\>.
    - Clicking "Upload CV" button triggers an API call to /api/cv/upload with the selected file.
    - Displays success or error messages from the API call.
    - After successful upload, ideally, the "Current CV Info" section updates to reflect the new CV.

This document provides the structural and component guidelines for these initial frontend pages. The actual state management (for form inputs, loading states, error messages) and API call logic will be implemented within these Next.js components/pages using React hooks and Supabase client SDK, **with React Hook Form and Zod for form-specific logic.**
