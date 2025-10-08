import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { GraduationCap, BookOpen } from 'lucide-react';
import { apiClient } from '../utils/api';
import { toast } from 'sonner';

interface AuthPageProps {
  onLogin: (user: any) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    studentId: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.login(loginData.email, loginData.password);
      toast.success(`Welcome back, ${response.user.firstName}!`);
      onLogin(response.user);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.signup({
        email: registerData.email,
        studentId: registerData.studentId,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        password: registerData.password
      });

      // Auto-login after registration
      const loginResponse = await apiClient.login(registerData.email, registerData.password);
      toast.success('Registration successful! Welcome to NSC e-Registrar');
      onLogin(loginResponse.user);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 text-white p-12 flex-col justify-center items-center">
        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-12 h-12" />
            <div>
              <h1 className="text-3xl">NSC e-Registrar</h1>
              <p className="text-blue-100">Digital Document Management System</p>
            </div>
          </div>
          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 mt-1" />
              <div>
                <h3 className="text-lg">Request Documents Online</h3>
                <p className="text-blue-100 text-sm">Submit and track your academic document requests digitally</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 mt-1" />
              <div>
                <h3 className="text-lg">Real-time Updates</h3>
                <p className="text-blue-100 text-sm">Get notified about your request status and communicate directly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 mt-1" />
              <div>
                <h3 className="text-lg">Secure & Convenient</h3>
                <p className="text-blue-100 text-sm">Safe payment verification and document tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <CardTitle>NSC e-Registrar</CardTitle>
            </div>
            <CardTitle className="hidden lg:block">Welcome</CardTitle>
            <CardDescription>Login or register to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="student@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                  <div className="text-sm text-center">
                    <a href="#" className="text-blue-600 hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  {/* <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 text-center">
                      <span className="font-medium">Default Admin:</span> admin@example.com / 123456
                    </p>
                  </div> */}
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email Address</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="student@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-studentid">Student ID</Label>
                    <Input
                      id="register-studentid"
                      type="text"
                      placeholder="2024-12345"
                      value={registerData.studentId}
                      onChange={(e) => setRegisterData({ ...registerData, studentId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-firstname">First Name</Label>
                      <Input
                        id="register-firstname"
                        type="text"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-lastname">Last Name</Label>
                      <Input
                        id="register-lastname"
                        type="text"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirm Password</Label>
                    <Input
                      id="register-confirm"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
