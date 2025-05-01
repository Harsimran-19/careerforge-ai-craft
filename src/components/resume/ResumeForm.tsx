
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Resume } from "@/services/documentService";
import { Plus, Trash } from "lucide-react";

interface ResumeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Resume;
  onSave: (data: any) => Promise<void>;
}

const ResumeForm = ({ open, onOpenChange, initialData, onSave }: ResumeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>(initialData ? initialData.content : {
    name: "",
    contact: {
      email: "",
      phone: "",
      location: ""
    },
    summary: "",
    experience: [{ title: "", company: "", dates: "", bullets: [""] }],
    education: [{ degree: "", institution: "", dates: "" }],
    skills: [""]
  });
  const [title, setTitle] = useState(initialData?.title || "");

  const handleInputChange = (path: string[], value: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      let current = newData;
      
      // Navigate to the correct nest level
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }
      
      // Set the value
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const handleAddExperience = () => {
    setFormData((prev: any) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: "", company: "", dates: "", bullets: [""] }
      ]
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      experience: prev.experience.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleAddBullet = (expIndex: number) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      newData.experience[expIndex].bullets.push("");
      return newData;
    });
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      newData.experience[expIndex].bullets = newData.experience[expIndex].bullets
        .filter((_: any, i: number) => i !== bulletIndex);
      return newData;
    });
  };

  const handleAddEducation = () => {
    setFormData((prev: any) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: "", institution: "", dates: "" }
      ]
    }));
  };

  const handleRemoveEducation = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      education: prev.education.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleAddSkill = () => {
    setFormData((prev: any) => ({
      ...prev,
      skills: [...prev.skills, ""]
    }));
  };

  const handleRemoveSkill = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      skills: prev.skills.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave({
        title,
        content: formData
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Resume" : "Create New Resume"}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Resume Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Software Developer Resume"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange(["name"], e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.contact?.email || ""}
                onChange={(e) => handleInputChange(["contact", "email"], e.target.value)}
                placeholder="johndoe@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.contact?.phone || ""}
                onChange={(e) => handleInputChange(["contact", "phone"], e.target.value)}
                placeholder="(123) 456-7890"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.contact?.location || ""}
                onChange={(e) => handleInputChange(["contact", "location"], e.target.value)}
                placeholder="New York, NY"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary || ""}
              onChange={(e) => handleInputChange(["summary"], e.target.value)}
              placeholder="A brief summary of your professional background and goals"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Experience</Label>
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                onClick={handleAddExperience}
                className="h-8"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Position
              </Button>
            </div>
            
            {formData.experience?.map((exp: any, expIndex: number) => (
              <div key={`exp-${expIndex}`} className="border rounded-md p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <Label className="text-base font-medium">Position {expIndex + 1}</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive h-8" 
                    onClick={() => handleRemoveExperience(expIndex)}
                  >
                    <Trash className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
                
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`job-title-${expIndex}`}>Job Title</Label>
                      <Input
                        id={`job-title-${expIndex}`}
                        value={exp.title}
                        onChange={(e) => handleInputChange(["experience", expIndex, "title"], e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`job-dates-${expIndex}`}>Dates</Label>
                      <Input
                        id={`job-dates-${expIndex}`}
                        value={exp.dates}
                        onChange={(e) => handleInputChange(["experience", expIndex, "dates"], e.target.value)}
                        placeholder="Jan 2020 - Present"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`job-company-${expIndex}`}>Company</Label>
                    <Input
                      id={`job-company-${expIndex}`}
                      value={exp.company}
                      onChange={(e) => handleInputChange(["experience", expIndex, "company"], e.target.value)}
                      placeholder="Company Name"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Responsibilities & Achievements</Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        type="button" 
                        onClick={() => handleAddBullet(expIndex)}
                        className="h-8"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Detail
                      </Button>
                    </div>
                    
                    {exp.bullets?.map((bullet: string, bulletIndex: number) => (
                      <div key={`bullet-${expIndex}-${bulletIndex}`} className="flex items-center gap-2 mb-2">
                        <Input
                          value={bullet}
                          onChange={(e) => {
                            const newBullets = [...exp.bullets];
                            newBullets[bulletIndex] = e.target.value;
                            handleInputChange(["experience", expIndex, "bullets"], newBullets);
                          }}
                          placeholder="Describe an achievement or responsibility"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive h-10 w-10 flex-shrink-0" 
                          onClick={() => handleRemoveBullet(expIndex, bulletIndex)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Education</Label>
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                onClick={handleAddEducation}
                className="h-8"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Education
              </Button>
            </div>
            
            {formData.education?.map((edu: any, eduIndex: number) => (
              <div key={`edu-${eduIndex}`} className="border rounded-md p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <Label className="text-base font-medium">Education {eduIndex + 1}</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive h-8" 
                    onClick={() => handleRemoveEducation(eduIndex)}
                  >
                    <Trash className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
                
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`edu-degree-${eduIndex}`}>Degree</Label>
                      <Input
                        id={`edu-degree-${eduIndex}`}
                        value={edu.degree}
                        onChange={(e) => handleInputChange(["education", eduIndex, "degree"], e.target.value)}
                        placeholder="Bachelor of Science in Computer Science"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edu-dates-${eduIndex}`}>Dates</Label>
                      <Input
                        id={`edu-dates-${eduIndex}`}
                        value={edu.dates}
                        onChange={(e) => handleInputChange(["education", eduIndex, "dates"], e.target.value)}
                        placeholder="2016 - 2020"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`edu-institution-${eduIndex}`}>Institution</Label>
                    <Input
                      id={`edu-institution-${eduIndex}`}
                      value={edu.institution}
                      onChange={(e) => handleInputChange(["education", eduIndex, "institution"], e.target.value)}
                      placeholder="University Name"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Skills</Label>
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                onClick={handleAddSkill}
                className="h-8"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Skill
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {formData.skills?.map((skill: string, skillIndex: number) => (
                <div key={`skill-${skillIndex}`} className="flex items-center gap-2">
                  <Input
                    value={skill}
                    onChange={(e) => {
                      const newSkills = [...formData.skills];
                      newSkills[skillIndex] = e.target.value;
                      handleInputChange(["skills"], newSkills);
                    }}
                    placeholder="React"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive h-10 w-10 flex-shrink-0" 
                    onClick={() => handleRemoveSkill(skillIndex)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Resume" : "Create Resume"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeForm;
