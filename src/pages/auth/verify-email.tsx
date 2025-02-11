import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Icons.check className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground px-8">
            We've sent you a verification link. Please check your email and click the link to verify your account.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button asChild variant="outline">
            <Link href="/auth/login">
              Return to Login
            </Link>
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Didn't receive the email?{" "}
            <button className="underline hover:text-primary underline-offset-4" onClick={() => {}}>
              Click to resend
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}