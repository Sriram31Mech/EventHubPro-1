import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const signInSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function UserSignIn() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: SignInForm) => authAPI.login(data),
    onSuccess: (data) => {
      authAPI.setCurrentUser(data.user);
      toast({
        title: "Welcome back!",
        description: "Redirecting to home page...",
      });
      setTimeout(() => navigate("/"), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignInForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In to Event Hive</h2>
            <p className="text-gray-600">Welcome back! Please sign in to your account</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-medium text-gray-700">YOUR EMAIL</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Enter your email" 
                            {...field} 
                            className="form-input"
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
                        <div className="flex items-center justify-between">
                          <FormLabel className="uppercase text-xs font-medium text-gray-700">PASSWORD</FormLabel>
                          <Link href="/forgot-password">
                            <span className="text-primary hover:text-primary/80 text-sm cursor-pointer">
                              Forgot your password?
                            </span>
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password" 
                              {...field} 
                              className="form-input pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup">
                <span className="text-primary hover:text-primary/80 font-semibold cursor-pointer">
                  Sign Up
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block flex-1 relative">
        <img 
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
          alt="Gaming event audience in blue-lit venue" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-purple-600/90"></div>
      </div>
    </div>
  );
}
