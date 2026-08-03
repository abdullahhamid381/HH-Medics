import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/site/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
