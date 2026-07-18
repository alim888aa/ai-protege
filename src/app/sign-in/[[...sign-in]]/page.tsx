import { SignIn } from "@clerk/nextjs";
import { AuthPageShell } from "@/app/components/auth/AuthPageShell";

export default function SignInPage() {
  return (
    <AuthPageShell>
      <SignIn
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "animate-fadeIn",
          },
        }}
      />
    </AuthPageShell>
  );
}
