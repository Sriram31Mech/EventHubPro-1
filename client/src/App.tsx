import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AdminRegister from "@/pages/admin/register";
import AdminCreateEvent from "@/pages/admin/create-event";
import AdminDashboard from "@/pages/admin/dashboard";
import UserSignIn from "@/pages/user/signin";
import UserSignUp from "@/pages/user/signup";
import Header from "@/components/layout/header";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin/register" component={AdminRegister} />
        <Route path="/admin/create-event" component={AdminCreateEvent} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/signin" component={UserSignIn} />
        <Route path="/signup" component={UserSignUp} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
