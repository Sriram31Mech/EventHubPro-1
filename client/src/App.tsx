import { Switch, Route, Redirect } from "wouter";
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
import EventDetails from "@/pages/events/event-details";
import Header from "@/components/layout/header";
import { authAPI } from "@/lib/auth";

// Protected Route Component
const ProtectedRoute = ({ component: Component, adminOnly = false, ...rest }: any) => {
  const isAuthenticated = authAPI.isAuthenticated();
  const isAdmin = authAPI.isAdmin();

  if (!isAuthenticated) {
    return <Redirect to="/signin" />;
  }

  if (adminOnly && !isAdmin) {
    return <Redirect to="/home" />;
  }

  return <Component {...rest} />;
};

function Router() {
  const isAuthenticated = authAPI.isAuthenticated();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Switch>
        {/* Public Routes */}
        <Route path="/signin" component={UserSignIn} />
        <Route path="/signup" component={UserSignUp} />
        <Route path="/admin/register" component={AdminRegister} />

        {/* Protected Routes */}
        <Route path="/home" component={Home} />
        <Route 
          path="/events/:id"
          component={(props: any) => (
            <ProtectedRoute component={EventDetails} {...props} />
          )}
        />
        <Route 
          path="/admin/create-event"
          component={(props: any) => (
            <ProtectedRoute component={AdminCreateEvent} adminOnly {...props} />
          )}
        />
        <Route 
          path="/admin/dashboard"
          component={(props: any) => (
            <ProtectedRoute component={AdminDashboard} adminOnly {...props} />
          )}
        />

        {/* Default Route */}
        <Route path="/">
          {isAuthenticated ? <Redirect to="/home" /> : <Redirect to="/signin" />}
        </Route>

        {/* 404 Route */}
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
