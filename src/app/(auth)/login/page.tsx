"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { signIn } from 'next-auth/react'
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    email: z.string({ message: "Email is required" }).email().min(5).max(50),
    password: z
      .string({ message: "Password is required" })
      .min(8, { message: "Password must at least 8 characters" })
      .regex(/[A-z]/, "Password at leat One Uppercase")
      .regex(/[a-z]/, "Password at least one lowercase")
      .regex(/[0-9]/, "Password at least one number")
      .regex(/[@#$%^&*]/, "Password at least one special character"),
  })

const LoginPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [isLoading,setIsLoading] =useState<boolean>(false)
  const router = useRouter()

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    
    setIsLoading(true)
    const result = await signIn('credentials',{
      email : values.email,
      password : values.password,
      redirect : false
    })
    setIsLoading(false)
    
    if(result?.error){
      toast.error(result.error)
    }else{
      toast.success("Login successfully")
      router.push("/dashboard")
    }

    
  }

  return (
    <div className="lg:p-10 space-y-7 max-w-lg mx-auto w-full">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-muted-foreground">Sign in to continue to your workspace</p>
      </div>
      
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    disabled={isLoading}
                    value={field.value ?? ""}
                    className="h-11 bg-background border-2 focus:border-primary transition-colors"
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
                <FormLabel className="text-base">Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your password"
                    {...field}
                    disabled={isLoading}
                    type="password"
                    value={field.value ?? ""}
                    className="h-11 bg-background border-2 focus:border-primary transition-colors"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Link 
              href={"/forgot-password"} 
              className="text-sm text-primary hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <Button 
            disabled={isLoading} 
            type="submit" 
            className="w-full h-11 cursor-pointer text-base font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-4 border-t border-border">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href={"/register"} className="text-primary font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

