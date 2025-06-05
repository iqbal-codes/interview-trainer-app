import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";

export default function Home() {
  return (
    <MainLayout>
      <section className="py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Master Your Interview Skills with AI
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Practice interviews for any job with our AI-powered platform. Get real-time feedback and improve your chances of landing your dream job.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <a href="/interview/new">Start Practicing</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="/auth/login">Sign In</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Our AI-powered platform simulates real interview scenarios to help you prepare.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 mt-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                  1
                </div>
                <h3 className="text-xl font-bold">Create Your Profile</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Enter the job title and description you&apos;re applying for.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                  2
                </div>
                <h3 className="text-xl font-bold">Practice with AI</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Engage in a voice conversation with our AI interviewer.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                  3
                </div>
                <h3 className="text-xl font-bold">Get Feedback</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Receive detailed feedback and tips to improve your responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
