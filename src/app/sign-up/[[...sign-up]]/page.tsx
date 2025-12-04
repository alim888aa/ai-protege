import { SignUp } from "@clerk/nextjs";
import { Brain } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <Link href="/" className="flex items-center gap-2 mb-6 group">
        <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">AI Protégé</h1>
      </Link>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Learn by teaching. Master concepts through the Feynman Technique.
      </p>
      <SignUp
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "animate-fadeIn",
          },
        }}
      />
    </div>
  );
}
