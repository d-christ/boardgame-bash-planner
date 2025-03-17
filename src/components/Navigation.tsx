
import { useApp } from '@/context/AppContext';
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

export const Navigation = () => {
  const { currentUser, login, logout, users } = useApp();
  const location = useLocation();

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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Login</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Login</DialogTitle>
                  <DialogDescription>
                    Select a user to login (demo purposes only)
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {users.map(user => (
                    <Button 
                      key={user.id} 
                      onClick={() => login(user.id)}
                      variant={user.isAdmin ? "default" : "outline"}
                      className="w-full justify-start"
                    >
                      <User className="mr-2 h-4 w-4" />
                      {user.name} {user.isAdmin && "(Admin)"}
                    </Button>
                  ))}
                </div>
                <DialogFooter>
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
