import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { Home, LogIn } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-app flex-col items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4 py-12">
      <Logo className="mb-8" />
      <p className="text-7xl font-black text-primary/20">404</p>
      <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Page not found</h1>
      <p className="mt-2 max-w-md text-center text-muted-foreground">
        The page you are looking for does not exist or you may not have permission to view it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Sign in
          </Link>
        </Button>
      </div>
    </div>
  );
}
