import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        Sign in to Maxume
      </h1>
      <LoginForm />
    </main>
  )
}
