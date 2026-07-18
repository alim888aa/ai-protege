import { SignUp } from "@clerk/nextjs";
import { AuthPageShell } from "@/app/components/auth/AuthPageShell";

export default function SignUpPage() {
  return (
    <AuthPageShell>
      <SignUp
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
