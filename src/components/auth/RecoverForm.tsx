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
import type { RecoverFormData } from "@/lib/validations/auth"
import { recoverSchema } from "@/lib/validations/auth"
import { recover } from "@/lib/services/auth"

export default function RecoverForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const form = useForm<RecoverFormData>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: RecoverFormData) {
    setIsSubmitting(true)
    try {
      await recover(data)
      setIsEmailSent(true)
    } catch (error) {
      console.error("Password recovery error:", error)
      form.setError("root", { 
        message: error instanceof Error ? error.message : "Failed to send reset instructions" 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-center">
          If an account exists with this email address, you will receive password reset instructions.
        </p>
        <div className="flex flex-col gap-3">
          <Button type="button" onClick={() => setIsEmailSent(false)}>
            Try again
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href="/login">Back to login</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending instructions..." : "Send reset instructions"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href="/login">Back to login</a>
          </Button>
        </div>
      </form>
    </Form>
  )
}