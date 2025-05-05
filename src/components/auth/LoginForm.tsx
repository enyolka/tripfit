import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { LoginFormData } from "@/lib/validations/auth"
import { loginSchema } from "@/lib/validations/auth"
import { toast } from "sonner"

interface LoginFormProps {
  redirectTo?: string
}

export default function LoginForm({ redirectTo = '/journeys' }: LoginFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormData) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Too many login attempts. Please try again later.")
          return
        }
        throw new Error(result.error || 'Failed to sign in')
      }

      // Successful login - redirect
      window.location.href = redirectTo
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof Error) {
        if (error.message.includes("Invalid login credentials")) {
          form.setError("root", { 
            message: "Invalid email or password" 
          })
        } else if (error.message.includes("Email not confirmed")) {
          form.setError("root", { 
            message: "Please verify your email address before logging in" 
          })
        } else {
          form.setError("root", { 
            message: error.message 
          })
        }
      } else {
        form.setError("root", { 
          message: "An unexpected error occurred" 
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...field}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </FormControl>
              <FormMessage />
              <a 
                href="/recover"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </a>
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  )
}