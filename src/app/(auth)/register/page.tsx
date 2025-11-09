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
import Axios from "@/lib/Axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    name: z.string({ message: "Name is required" }).min(3),
    email: z.string({ message: "Email is required" }).email().min(5).max(50),
    password: z
      .string({ message: "Password is required" })
      .min(8, { message: "Password must at least 8 characters" })
      .regex(/[A-z]/, "Password at leat One Uppercase")
      .regex(/[a-z]/, "Password at least one lowercase")
      .regex(/[0-9]/, "Password at least one number")
      .regex(/[@#$%^&*]/, "Password at least one special character"),
    confirmPassword: z.string({ message: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password must be same",
    path: ["confirmPassword"],
  });

const RegisterPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [isLoading,setIsLoading] =useState<boolean>(false)
  const router = useRouter()

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    const payload = {
      name : values.name,
      email : values.email,
      password : values.password
    }

    try{
      setIsLoading(true)
      const response = await Axios.post("/api/auth/register",payload)

      if(response.status === 201){
        toast.success(response.data.message)
        form.reset()
        router.push("/login")
      }
    }catch(error : any){
      toast.error(error?.response?.data?.error)
    }finally{
      setIsLoading(false)
    }

  }

  return (
    <div className="lg:p-10 space-y-7 max-w-lg mx-auto w-full">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Create Account
        </h1>
        <p className="text-muted-foreground">Start your coding journey with us</p>
      </div>
      
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
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
                    placeholder="Create a strong password"
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Re-enter your password"
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
          <Button 
            disabled={isLoading} 
            type="submit" 
            className="w-full h-11 cursor-pointer text-base font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-4 border-t border-border">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href={"/login"} className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
