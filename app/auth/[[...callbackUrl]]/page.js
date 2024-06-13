"use client";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import AuthForm from "@/components/auth/auth-form";

function AuthPage() {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.replace(`/${params.callbackUrl ? params.callbackUrl[0] : ""}`);
      } else {
        setIsLoading(false);
      }
    });
  }, [router]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <AuthForm callbackUrl={params.callbackUrl ? params.callbackUrl[0] : ""} />
  );
}

export default AuthPage;
