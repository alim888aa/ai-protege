import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        AI Protégé
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Learn by teaching. Master concepts through the Feynman Technique.
      </p>
      <SignIn afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard" />
    </div>
  );
}
