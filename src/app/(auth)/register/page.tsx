"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z
    .object({
        email: z.string().email({
            message: "Invalid email address.",
        }),
        password: z.string().min(6, {
            message: "Password must be at least 6 characters.",
        }),
        confirmPassword: z.string().min(6, {
            message: "Password must be at least 6 characters.",
        }),
        terms: z.boolean().refine((data) => data === true, {
            message: "Please accept the terms and conditions.",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords must match.",
        path: ["confirmPassword"],
    });

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const response = await api.post("/auth/signup", values);

            if (response.status === 201) {
                toast.success("Account created successfully", {
                    description:
                        "Please check your email to verify your account.",
                    action: {
                        label: "Close",
                        onClick: () => {},
                        actionButtonStyle: {
                            cursor: "pointer",
                        },
                    },
                });
                router.replace("/");
            } else {
                toast.error(response.data.message || "An error occurred");
            }
        } catch (error) {
            console.error("Error while creating account", error);

            toast.error("Internal Server Error", {
                description: "Please try again.",
                action: {
                    label: "Close",
                    onClick: () => {},
                    actionButtonStyle: {
                        cursor: "pointer",
                    },
                },
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-svh items-center justify-center">
            <div className="w-full max-w-md sm:w-[448px] space-y-8 rounded-lg bg-white p-8 shadow-md">
                <div className="text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Create your account
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
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        id="email-address"
                                                        name="email"
                                                        type="email"
                                                        autoComplete="email"
                                                        required
                                                        className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10  focus:outline-none sm:text-sm"
                                                        placeholder="Email address"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        id="password"
                                                        type="password"
                                                        autoComplete="new-password"
                                                        required
                                                        className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10  focus:outline-none sm:text-sm"
                                                        placeholder="Password"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirm-password">
                                        Confirm Password
                                    </Label>
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        id="confirm-password"
                                                        type="password"
                                                        autoComplete="new-password"
                                                        required
                                                        className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10  focus:outline-none sm:text-sm"
                                                        placeholder="Confirm Password"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <FormField
                                    control={form.control}
                                    name="terms"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                        id="terms"
                                                    />
                                                </FormControl>
                                                <Label
                                                    htmlFor="terms"
                                                    className="text-sm text-gray-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Accept terms and conditions
                                                </Label>
                                            </div>
                                            <FormMessage className="text-xs text-red-500" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div>
                                <Button type="submit" className="w-full">
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <Loader className="animate-spin size-4" />{" "}
                                            <span>Please wait...</span>
                                        </div>
                                    ) : (
                                        "Register"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-primary/80 hover:text-primary"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
