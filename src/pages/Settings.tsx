import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Bell, Smartphone, Globe, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: {
        jobMatches: true,
        applicationUpdates: true,
        newFeatures: false,
        marketingEmails: false,
      },
      push: {
        jobMatches: true,
        applicationUpdates: true,
        newFeatures: true,
      },
    },
    privacy: {
      profileVisibility: "public",
      allowDataCollection: true,
      allowDataSharing: false,
    },
    appearance: {
      colorScheme: "system",
      compactView: false,
    },
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleToggleChange = (
    category: "notifications" | "privacy" | "appearance",
    subcategory: string,
    key: string,
    value: boolean
  ) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [subcategory]: {
          ...settings[category][subcategory as keyof typeof settings[typeof category]],
          [key]: value,
        },
      },
    });
  };

  const handlePrivacyChange = (key: keyof typeof settings.privacy, value: any) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    });
  };

  const handleAppearanceChange = (key: keyof typeof settings.appearance, value: any) => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        [key]: value,
      },
    });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4 flex items-center">
                  Email Notifications
                  <Badge variant="outline" className="ml-2">Primary: johndoe@example.com</Badge>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-job-matches">Job Matches</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about new jobs that match your profile
                      </p>
                    </div>
                    <Switch
                      id="email-job-matches"
                      checked={settings.notifications.email.jobMatches}
                      onCheckedChange={(checked) =>
                        handleToggleChange("notifications", "email", "jobMatches", checked)
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-application-updates">Application Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Updates about your job applications
                      </p>
                    </div>
                    <Switch
                      id="email-application-updates"
                      checked={settings.notifications.email.applicationUpdates}
                      onCheckedChange={(checked) =>
                        handleToggleChange("notifications", "email", "applicationUpdates", checked)
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-new-features">New Features</Label>
                      <p className="text-sm text-muted-foreground">
                        Updates about new features and improvements
                      </p>
                    </div>
                    <Switch
                      id="email-new-features"
                      checked={settings.notifications.email.newFeatures}
                      onCheckedChange={(checked) =>
                        handleToggleChange("notifications", "email", "newFeatures", checked)
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-marketing">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Promotional offers and newsletters
                      </p>
                    </div>
                    <Switch
                      id="email-marketing"
                      checked={settings.notifications.email.marketingEmails}
                      onCheckedChange={(checked) =>
                        handleToggleChange("notifications", "email", "marketingEmails", checked)
                      }
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
                    <div>
                      <Label htmlFor="push-job-matches">Job Matches</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts about new job listings
                      </p>
                    </div>
                    <Switch
                      id="push-job-matches"
                      checked={settings.notifications.push.jobMatches}
                      onCheckedChange={(checked) =>
                        handleToggleChange("notifications", "push", "jobMatches", checked)
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-application-updates">Application Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Status changes for your job applications
                      </p>
                    </div>
                    <Switch
                      id="push-application-updates"
                      checked={settings.notifications.push.applicationUpdates}
                      onCheckedChange={(checked) =>
                        handleToggleChange("notifications", "push", "applicationUpdates", checked)
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-new-features">New Features</Label>
                      <p className="text-sm text-muted-foreground">
                        Alerts about new features and improvements
                      </p>
                    </div>
                    <Switch
                      id="push-new-features"
                      checked={settings.notifications.push.newFeatures}
                      onCheckedChange={(checked) =>
                        handleToggleChange("notifications", "push", "newFeatures", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Manage your privacy preferences and data settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Profile Visibility</h3>
                <RadioGroup
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
                >
                  <div className="flex items-start space-x-2 mb-3">
                    <RadioGroupItem value="public" id="public" />
                    <div className="grid gap-1">
                      <Label htmlFor="public" className="font-medium">Public</Label>
                      <p className="text-sm text-muted-foreground">
                        Your profile is visible to all users and can be found through search
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 mb-3">
                    <RadioGroupItem value="limited" id="limited" />
                    <div className="grid gap-1">
                      <Label htmlFor="limited" className="font-medium">Limited</Label>
                      <p className="text-sm text-muted-foreground">
                        Your profile is only visible to connections and specific companies
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <div className="grid gap-1">
                      <Label htmlFor="private" className="font-medium">Private</Label>
                      <p className="text-sm text-muted-foreground">
                        Your profile is only visible to you
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-4">Data Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-collection">Data Collection</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow us to collect usage data to improve your experience
                      </p>
                    </div>
                    <Switch
                      id="data-collection"
                      checked={settings.privacy.allowDataCollection}
                      onCheckedChange={(checked) => handlePrivacyChange("allowDataCollection", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-sharing">Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow us to share anonymized data with third parties
                      </p>
                    </div>
                    <Switch
                      id="data-sharing"
                      checked={settings.privacy.allowDataSharing}
                      onCheckedChange={(checked) => handlePrivacyChange("allowDataSharing", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>
                Customize how CareerForge looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Theme Preferences</h3>
                <RadioGroup
                  value={settings.appearance.colorScheme}
                  onValueChange={(value) => handleAppearanceChange("colorScheme", value)}
                  className="grid gap-4"
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
                    <Label htmlFor="system">System preference</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-4">Layout Options</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-view">Compact View</Label>
                    <p className="text-sm text-muted-foreground">
                      Show more content with reduced spacing
                    </p>
                  </div>
                  <Switch
                    id="compact-view"
                    checked={settings.appearance.compactView}
                    onCheckedChange={(checked) => handleAppearanceChange("compactView", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
