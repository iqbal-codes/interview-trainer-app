# AI-Powered Interview Practice Platform

An interactive web application that helps job seekers prepare for interviews using AI-powered voice conversations and detailed feedback.

## Features

- **AI-Powered Interview Simulations**: Practice interviews with realistic AI-generated questions tailored to specific job roles.
- **Voice Interaction**: Have natural conversations with our AI interviewer using Vapi's voice technology.
- **Real-time Feedback**: Receive detailed feedback on your responses to help you improve.
- **Interview History**: Track your progress and review past interview sessions.
- **Customizable Experience**: Set up interviews for specific job titles and descriptions.

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: Zustand and React Query
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Voice AI**: Vapi
- **LLM Integration**: OpenAI/Anthropic

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn (v4)
- Supabase account
- Vapi account
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/interview-trainer-app.git
   cd interview-trainer-app
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Create a `.env.local` file based on `.env.example` and fill in your API keys.

4. Run the development server:
   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/src/app`: Next.js app router pages
- `/src/components`: React components
  - `/auth`: Authentication-related components
  - `/interview`: Interview-related components
  - `/dashboard`: Dashboard components
  - `/layout`: Layout components
  - `/shared`: Shared/common components
  - `/ui`: shadcn UI components
- `/src/lib`: Utility functions and libraries
  - `/api`: API client functions
  - `/hooks`: Custom React hooks
  - `/store`: Zustand store definitions
  - `/supabase`: Supabase client setup
  - `/vapi`: Vapi integration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Vapi](https://vapi.ai/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## Phase 5: Vapi & LLM Integration

In this phase, we've implemented:

1. **LLM Integration for Question Generation**
   - Updated `/api/interviews/generate` to use the Vercel AI SDK with Google Generative AI
   - Implemented robust parsing of LLM responses
   - Enhanced error handling for LLM API calls

2. **Vapi Webhook Implementation**
   - Created `/api/vapi/assistant` webhook to handle Vapi requests
   - Implemented logic to process user speech and save answers
   - Added functionality to send questions to Vapi and manage interview flow

3. **Interview Session Page**
   - Created dynamic route `/interview/[sessionId]` for interview sessions
   - Implemented Vapi client-side integration
   - Added UI for displaying questions and visual feedback for speaking/listening

### Environment Variables

The following environment variables need to be set in `.env.local`:

```
# Google Generative AI API Key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-generative-ai-api-key

# Vapi Configuration
VAPI_SECRET_TOKEN=your-vapi-secret-token
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your-vapi-public-key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your-vapi-assistant-id
VAPI_API_KEY=your-vapi-api-key
```
