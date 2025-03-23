
import { useApp } from '@/context';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Gamepad, Calendar, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const Navigation = () => {
  const { currentUser, login, logout, users } = useApp();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const navItems = [
    { 
      name: 'Events', 
      path: '/', 
      icon: <Calendar className="h-5 w-5 mr-2" /> 
    },
    { 
      name: 'Board Games', 
      path: '/boardgames', 
      icon: <Gamepad className="h-5 w-5 mr-2" /> 
    }
  ];
  
  // Add Admin link if user is admin
  if (currentUser?.isAdmin) {
    navItems.push({
      name: 'Admin',
      path: '/admin',
      icon: <User className="h-5 w-5 mr-2" />
    });
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Sign in using Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      // If successful, find matching user in our users table
      const adminUser = users.find(u => u.isAdmin && u.name === 'Admin User');
      
      if (adminUser) {
        login(adminUser.id);
        setIsDialogOpen(false);
        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${adminUser.name}!`
        });
      } else {
        throw new Error("User not found in the system");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <Gamepad className="h-8 w-8 mr-2" />
          <h1 className="text-xl font-bold">BoardGame Bash</h1>
        </div>
        
        <div className="flex space-x-2">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}>
              <Button 
                variant={location.pathname === item.path ? "secondary" : "ghost"} 
                className="text-primary-foreground"
              >
                {item.icon}
                {item.name}
              </Button>
            </Link>
          ))}

          {currentUser ? (
            <Button variant="ghost" className="text-primary-foreground" onClick={logout}>
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">Login</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Login</DialogTitle>
                  <DialogDescription>
                    Enter your credentials to sign in
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLogin} className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="admin@boardgamebash.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                </form>
                <DialogFooter className="pt-2">
                  <DialogTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogTrigger>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </nav>
  );
};
