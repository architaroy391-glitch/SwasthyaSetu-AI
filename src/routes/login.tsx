 import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";

import { Brand } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/integrations/auth";
import { RegisterForm } from "@/components/app/register-form";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      {
        title: "Sign in — SwasthyaSetu-AI",
      },
      {
        name: "description",
        content:
          "Secure access for authorized healthcare coordination teams.",
      },
      {
        property: "og:title",
        content: "Sign in — SwasthyaSetu-AI",
      },
      {
        property: "og:description",
        content:
          "Secure access for authorized healthcare coordination teams.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary",
      },
    ],
  }),

  component: Login,
});

function Login() {
  const nav = useNavigate();

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"signin" | "register">("signin");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();

    setBusy(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    nav({
      to: "/dashboard",
    });
  }

  async function google() {
    setError("");

    sessionStorage.setItem("auth-next", "/dashboard");

    const result = await auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      setError(result.error.message);
    } else if (!result.data?.url) {
      setError("Unable to start Google sign-in.");
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-ink p-12 text-ink-foreground lg:flex lg:flex-col">
        <Brand className="[&_img]:mix-blend-normal [&_img]:bg-background" />

        <div className="my-auto max-w-xl">
          <p className="text-xs font-bold uppercase text-accent">
            Authorized healthcare teams
          </p>

          <h1 className="mt-5 font-display text-5xl font-bold leading-tight">
            One network. Earlier signals. Faster coordination.
          </h1>

          <p className="mt-5 text-lg leading-8 text-ink-muted">
            Monitor simulated resources, forecast shortages, and coordinate
            responses while keeping humans in control.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              ["1,248", "Facilities"],
              ["27", "Risks"],
              ["3", "Emergencies"],
            ].map((item) => (
              <div
                className="border border-ink-border p-4"
                key={item[1]}
              >
                <p className="text-2xl font-bold">{item[0]}</p>
                <p className="text-xs text-ink-muted">
                  {item[1]} · demo
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-ink-muted">
          Demo environment — data is simulated
        </p>
      </section>

      <section className="flex items-center justify-center p-5">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to overview
          </Link>

          <div className="mb-8 lg:hidden">
            <Brand />
          </div>

          <div
            className="mb-4 grid grid-cols-2 rounded-md border border-border p-1"
            role="tablist"
          >
            {(["signin", "register"] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`rounded px-3 py-2 text-sm font-semibold ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {mode === "signin" ? (
            <Card>
              <CardHeader>
                <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <LockKeyhole className="size-5" />
                </div>

                <CardTitle className="text-2xl">
                  Sign in to the command centre
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  Use your authorized work account.
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={signIn} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email address</Label>

                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <Label htmlFor="password">Password</Label>

                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-primary"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="relative mt-2">
                      <Input
                        id="password"
                        type={show ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShow(!show)}
                        aria-label={
                          show ? "Hide password" : "Show password"
                        }
                      >
                        {show ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="text-sm text-destructive"
                    >
                      {error}
                    </p>
                  )}

                  <Button
                    className="w-full"
                    type="submit"
                    disabled={busy}
                  >
                    {busy ? "Signing in…" : "Sign in"}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">
                    or
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={google}
                >
                  Continue with Google
                </Button>

                <p className="mt-5 text-center text-xs text-muted-foreground">
                  Access is intended for authorized healthcare operations
                  staff.
                </p>
              </CardContent>
            </Card>
          ) : (
            <RegisterForm onDone={() => setMode("signin")} />
          )}
        </div>
      </section>
    </main>
  );
}