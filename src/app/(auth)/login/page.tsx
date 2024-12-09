"use client";

import Logo from "@/components/brand/logo";
import ButtonLoading from "@/components/form/loading-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showErrorToast } from "@/lib/handle-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const response = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (response?.error) {
        toast.error("Log in failed", {
          description: response.code,
          action: {
            label: "Close",
            onClick: () => {},
            actionButtonStyle: {
              cursor: "pointer",
            },
          },
        });
      } else {
        toast.success("Log in successful", {
          description: "You have successfully logged in.",
          action: {
            label: "Close",
            onClick: () => {},
            actionButtonStyle: {
              cursor: "pointer",
            },
          },
        });
        router.replace("/dashboard");
      }
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="w-full max-w-lg flex-1 space-y-6 rounded-lg bg-white p-8 shadow-md sm:w-[448px]">
      <div className="text-center">
        <Logo
          className="mx-auto mb-4 h-12 object-contain text-primary"
          width={160}
          height={200}
        />
        <h2 className="text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          <Button variant="outline" className="w-full">
            <GitHubLogoIcon className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
            noValidate
          >
            <div className="space-y-4 rounded-md">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="Email address"
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
                        {...field}
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        placeholder="Password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end text-sm">
              <Link
                href="#"
                className="font-medium text-primary/80 hover:text-primary"
              >
                Forgot your password?
              </Link>
            </div>

            <ButtonLoading type="submit" loading={loading} />
          </form>
        </Form>
      </div>
      <p className="mt-2 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary/80 hover:text-primary"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
