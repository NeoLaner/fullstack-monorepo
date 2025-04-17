"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthTypeSwitchBtn() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/auth/login";
  return (
    <div className="text-center text-sm">
      {isLoginPage ? "Don't have an account?" : "Do you have an account?"}{" "}
      <Link
        href={isLoginPage ? "/auth/signup" : "/auth/login"}
        className="underline underline-offset-4"
      >
        {isLoginPage ? "Sign up" : "Login"}
      </Link>
    </div>
  );
}
