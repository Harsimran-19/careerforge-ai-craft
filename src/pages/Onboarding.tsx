
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload } from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "",
    yearsExperience: "",
    skills: "",
    bio: "",
    resumeFile: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        resumeFile: e.target.files[0],
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast({
        title: "Onboarding complete!",
        description: "Your profile has been set up successfully.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem completing your onboarding.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Let's get your account set up so we can customize your job search experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Current Job Title</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  placeholder="e.g. Software Engineer"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleSelectChange("industry", value)}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Select
                  value={formData.yearsExperience}
                  onValueChange={(value) => handleSelectChange("yearsExperience", value)}
                >
                  <SelectTrigger id="yearsExperience">
                    <SelectValue placeholder="Select years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skills">Key Skills</Label>
                <Textarea
                  id="skills"
                  name="skills"
                  placeholder="e.g. JavaScript, React, Project Management"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  List your top skills, separated by commas
                </p>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Summary</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Write a brief summary of your professional background..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground">
                  This will help us personalize your job recommendations
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Upload Your Resume</Label>
                <div 
                  className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => document.getElementById("resume-upload")?.click()}
                >
                  {formData.resumeFile ? (
                    <div className="flex flex-col items-center">
                      <FileText className="h-10 w-10 text-primary mb-2" />
                      <p className="text-sm font-medium">{formData.resumeFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(formData.resumeFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Click to upload your resume</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF or DOCX, up to 5MB
                      </p>
                    </div>
                  )}
                  <Input
                    id="resume-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Your resume will be parsed to help tailor your job applications
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handlePreviousStep}>
              Back
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate("/login")}>
              Cancel
            </Button>
          )}
          
          {step < 2 ? (
            <Button onClick={handleNextStep}>
              Next Step
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={isLoading}>
              {isLoading ? "Setting Up..." : "Complete Setup"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;
