
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Bell, Smartphone, Globe, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  const { toast } = useToast();
  const [theme, setTheme] = useState("system");
  
  // Form state
  const [formState, setFormState] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "Frontend developer with 5+ years of experience in React and modern JavaScript frameworks.",
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      newMessages: true,
      newApplications: true,
      applicationUpdates: true,
    },
    push: {
      newMessages: false,
      newApplications: true,
      applicationUpdates: false,
    }
  });
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  const handleNotificationChange = (type: 'email' | 'push', setting: keyof typeof notificationSettings.email, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [setting]: value
      }
    }));
    
    toast({
      title: "Settings updated",
      description: `${setting} notifications ${value ? 'enabled' : 'disabled'} for ${type}.`,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how others see you on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage alt="Profile picture" src="/placeholder.svg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">Upload photo</Button>
                </div>
                <form onSubmit={handleProfileSubmit} className="space-y-4 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={formState.name}
                        onChange={(e) => setFormState({...formState, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={formState.email}
                        onChange={(e) => setFormState({...formState, email: e.target.value})}
                      />
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">Private</Badge>
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input 
                      id="bio" 
                      value={formState.bio}
                      onChange={(e) => setFormState({...formState, bio: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Brief description for your profile. URLs are hyperlinked.
                    </p>
                  </div>
                </form>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleProfileSubmit}>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you want to be notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Email Notifications
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-messages">New messages</Label>
                    <Input 
                      id="email-messages" 
                      type="checkbox"
                      className="h-4 w-4"
                      checked={notificationSettings.email.newMessages}
                      onChange={(e) => handleNotificationChange('email', 'newMessages', e.target.checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-applications">New job applications</Label>
                    <Input 
                      id="email-applications" 
                      type="checkbox"
                      className="h-4 w-4"
                      checked={notificationSettings.email.newApplications}
                      onChange={(e) => handleNotificationChange('email', 'newApplications', e.target.checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-updates">Application updates</Label>
                    <Input 
                      id="email-updates" 
                      type="checkbox"
                      className="h-4 w-4"
                      checked={notificationSettings.email.applicationUpdates}
                      onChange={(e) => handleNotificationChange('email', 'applicationUpdates', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4 flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Push Notifications
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-messages">New messages</Label>
                    <Input 
                      id="push-messages" 
                      type="checkbox"
                      className="h-4 w-4"
                      checked={notificationSettings.push.newMessages}
                      onChange={(e) => handleNotificationChange('push', 'newMessages', e.target.checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-applications">New job applications</Label>
                    <Input 
                      id="push-applications" 
                      type="checkbox"
                      className="h-4 w-4"
                      checked={notificationSettings.push.newApplications}
                      onChange={(e) => handleNotificationChange('push', 'newApplications', e.target.checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-updates">Application updates</Label>
                    <Input 
                      id="push-updates" 
                      type="checkbox"
                      className="h-4 w-4"
                      checked={notificationSettings.push.applicationUpdates}
                      onChange={(e) => handleNotificationChange('push', 'applicationUpdates', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how CareerForge looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <RadioGroup 
                  defaultValue={theme} 
                  onValueChange={setTheme}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system">System</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={() => {
                toast({
                  title: "Appearance updated",
                  description: `Theme set to ${theme}.`,
                });
              }}>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your password and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Change Password</h3>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={() => {
                toast({
                  title: "Password changed",
                  description: "Your password has been updated successfully.",
                });
              }}>Update password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
