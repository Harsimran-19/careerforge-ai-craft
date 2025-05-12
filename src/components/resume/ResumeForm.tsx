import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Resume, ResumeContent } from '@/services/documentService';

interface ResumeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Resume;
  onSave: (data: { title: string; content: ResumeContent }) => Promise<void>;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ 
  open, 
  onOpenChange, 
  initialData,
  onSave
}) => {
  // Create default structure for new resume
  const defaultContent: ResumeContent = {
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    education: [
      {
        id: '1',
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        description: ''
      }
    ],
    experience: [
      {
        id: '1',
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        highlights: ['']
      }
    ],
    skills: [''],
    certifications: [
      {
        id: '1',
        name: '',
        issuer: '',
        date: '',
        description: ''
      }
    ],
    projects: [
      {
        id: '1',
        name: '',
        description: '',
        url: '',
        highlights: ['']
      }
    ]
  };

  // Initialize form data with initial data or defaults
  const [formData, setFormData] = useState<{
    title: string;
    content: ResumeContent;
  }>({
    title: initialData?.title || '',
    content: initialData?.content || defaultContent
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('personalInfo');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      
      setFormData(prevState => ({
        ...prevState,
        content: {
          ...prevState.content,
          [section]: {
            ...(prevState.content[section as keyof ResumeContent] as object),
            [field]: value
          }
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (section: keyof ResumeContent, index: number, value: string) => {
    if (section === 'skills') {
      setFormData(prevState => {
        const newSkills = [...prevState.content.skills];
        newSkills[index] = value;
        
        return {
          ...prevState,
          content: {
            ...prevState.content,
            skills: newSkills
          }
        };
      });
    }
  };

  const handleObjectArrayChange = (
    section: 'education' | 'experience' | 'certifications' | 'projects', 
    index: number, 
    field: string, 
    value: string
  ) => {
    setFormData(prevState => {
      const newArray = [...prevState.content[section]];
      newArray[index] = {
        ...newArray[index],
        [field]: value
      };

      return {
        ...prevState,
        content: {
          ...prevState.content,
          [section]: newArray
        }
      };
    });
  };

  const addArrayItem = (section: 'education' | 'experience' | 'certifications' | 'projects', template: any) => {
    const newArray = [...formData.content[section]];
    
    // Find the highest ID in the current array items
    const maxId = newArray.reduce((max, item) => {
      const itemId = item.id ? parseInt(item.id) : 0;
      return Math.max(max, itemId);
    }, 0);
    
    // Create new item with incremented ID
    const newItem = {
      ...template,
      id: String(maxId + 1)
    };
    
    newArray.push(newItem);
    
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [section]: newArray
      }
    });
  };

  const removeArrayItem = (section: 'education' | 'experience' | 'certifications' | 'projects', index: number) => {
    const newArray = [...formData.content[section]];
    newArray.splice(index, 1);
    
    // If removing the last item, add a blank template
    if (newArray.length === 0) {
      if (section === 'education') {
        newArray.push({
          id: '1',
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          description: ''
        });
      } else if (section === 'experience') {
        newArray.push({
          id: '1',
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
          highlights: ['']
        });
      } else if (section === 'certifications') {
        newArray.push({
          id: '1',
          name: '',
          issuer: '',
          date: '',
          description: ''
        });
      } else if (section === 'projects') {
        newArray.push({
          id: '1',
          name: '',
          description: '',
          url: '',
          highlights: ['']
        });
      }
    }
    
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [section]: newArray
      }
    });
  };

  const addNestedArrayItem = (
    section: 'experience' | 'projects', 
    index: number, 
    subField: 'highlights'
  ) => {
    const newArray = [...formData.content[section]];
    const itemHighlights = [...newArray[index][subField], ''];
    
    newArray[index] = {
      ...newArray[index],
      [subField]: itemHighlights
    };
    
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [section]: newArray
      }
    });
  };

  const removeNestedArrayItem = (
    section: 'experience' | 'projects', 
    index: number, 
    subField: 'highlights', 
    subIndex: number
  ) => {
    const newArray = [...formData.content[section]];
    const highlights = [...newArray[index][subField]];
    
    if (highlights.length > 1) {
      highlights.splice(subIndex, 1);
    } else {
      highlights[0] = '';
    }
    
    newArray[index] = {
      ...newArray[index],
      [subField]: highlights
    };
    
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [section]: newArray
      }
    });
  };

  const handleNestedArrayChange = (
    section: 'experience' | 'projects', 
    index: number, 
    subField: 'highlights', 
    subIndex: number, 
    value: string
  ) => {
    const newArray = [...formData.content[section]];
    const highlights = [...newArray[index][subField]];
    highlights[subIndex] = value;
    
    newArray[index] = {
      ...newArray[index],
      [subField]: highlights
    };
    
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [section]: newArray
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Resume' : 'Create New Resume'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <Button 
              size="sm" 
              variant={activeSection === 'personalInfo' ? 'default' : 'outline'} 
              onClick={() => setActiveSection('personalInfo')}
            >
              Personal Info
            </Button>
            <Button 
              size="sm" 
              variant={activeSection === 'summary' ? 'default' : 'outline'} 
              onClick={() => setActiveSection('summary')}
            >
              Summary
            </Button>
            <Button 
              size="sm" 
              variant={activeSection === 'education' ? 'default' : 'outline'} 
              onClick={() => setActiveSection('education')}
            >
              Education
            </Button>
            <Button 
              size="sm" 
              variant={activeSection === 'experience' ? 'default' : 'outline'} 
              onClick={() => setActiveSection('experience')}
            >
              Experience
            </Button>
            <Button 
              size="sm" 
              variant={activeSection === 'skills' ? 'default' : 'outline'} 
              onClick={() => setActiveSection('skills')}
            >
              Skills
            </Button>
            <Button 
              size="sm" 
              variant={activeSection === 'projects' ? 'default' : 'outline'} 
              onClick={() => setActiveSection('projects')}
            >
              Projects
            </Button>
            <Button 
              size="sm" 
              variant={activeSection === 'certifications' ? 'default' : 'outline'} 
              onClick={() => setActiveSection('certifications')}
            >
              Certifications
            </Button>
          </div>

          <div>
            <Input 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="Resume Title"
              className="mb-4"
            />
          </div>

          {/* Personal Information Section */}
          {activeSection === 'personalInfo' && (
            <div className="space-y-4">
              <h3 className="font-medium">Personal Information</h3>
              <Input 
                name="personalInfo.name" 
                value={formData.content.personalInfo.name} 
                onChange={handleChange} 
                placeholder="Name"
              />
              <Input 
                name="personalInfo.email" 
                value={formData.content.personalInfo.email} 
                onChange={handleChange} 
                placeholder="Email"
              />
              <Input 
                name="personalInfo.phone" 
                value={formData.content.personalInfo.phone} 
                onChange={handleChange} 
                placeholder="Phone"
              />
              <Input 
                name="personalInfo.address" 
                value={formData.content.personalInfo.address} 
                onChange={handleChange} 
                placeholder="Address"
              />
              <Input 
                name="personalInfo.linkedin" 
                value={formData.content.personalInfo.linkedin} 
                onChange={handleChange} 
                placeholder="LinkedIn URL"
              />
              <Input 
                name="personalInfo.website" 
                value={formData.content.personalInfo.website} 
                onChange={handleChange} 
                placeholder="Personal Website"
              />
            </div>
          )}

          {/* Summary Section */}
          {activeSection === 'summary' && (
            <div className="space-y-4">
              <h3 className="font-medium">Professional Summary</h3>
              <Textarea 
                name="summary" 
                value={formData.content.summary} 
                onChange={handleChange} 
                placeholder="Write a professional summary"
                rows={6}
              />
            </div>
          )}

          {/* Education Section */}
          {activeSection === 'education' && (
            <div className="space-y-6">
              <h3 className="font-medium">Education</h3>
              {formData.content.education.map((edu, index) => (
                <div key={index} className="space-y-4 border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Education #{index + 1}</h4>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => removeArrayItem('education', index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <Input 
                    value={edu.institution} 
                    onChange={(e) => handleObjectArrayChange('education', index, 'institution', e.target.value)} 
                    placeholder="Institution"
                  />
                  <Input 
                    value={edu.degree} 
                    onChange={(e) => handleObjectArrayChange('education', index, 'degree', e.target.value)} 
                    placeholder="Degree"
                  />
                  <Input 
                    value={edu.fieldOfStudy} 
                    onChange={(e) => handleObjectArrayChange('education', index, 'fieldOfStudy', e.target.value)} 
                    placeholder="Field of Study"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      value={edu.startDate} 
                      onChange={(e) => handleObjectArrayChange('education', index, 'startDate', e.target.value)} 
                      placeholder="Start Date"
                    />
                    <Input 
                      value={edu.endDate} 
                      onChange={(e) => handleObjectArrayChange('education', index, 'endDate', e.target.value)} 
                      placeholder="End Date (or 'Present')"
                    />
                  </div>
                  <Textarea 
                    value={edu.description} 
                    onChange={(e) => handleObjectArrayChange('education', index, 'description', e.target.value)} 
                    placeholder="Description"
                    rows={3}
                  />
                </div>
              ))}
              <Button 
                onClick={() => addArrayItem('education', {
                  id: String(formData.content.education.length + 1),
                  institution: '',
                  degree: '',
                  fieldOfStudy: '',
                  startDate: '',
                  endDate: '',
                  description: ''
                })}
              >
                Add Education
              </Button>
            </div>
          )}

          {/* Experience Section */}
          {activeSection === 'experience' && (
            <div className="space-y-6">
              <h3 className="font-medium">Work Experience</h3>
              {formData.content.experience.map((exp, index) => (
                <div key={index} className="space-y-4 border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Experience #{index + 1}</h4>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => removeArrayItem('experience', index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <Input 
                    value={exp.company} 
                    onChange={(e) => handleObjectArrayChange('experience', index, 'company', e.target.value)} 
                    placeholder="Company"
                  />
                  <Input 
                    value={exp.position} 
                    onChange={(e) => handleObjectArrayChange('experience', index, 'position', e.target.value)} 
                    placeholder="Position"
                  />
                  <Input 
                    value={exp.location} 
                    onChange={(e) => handleObjectArrayChange('experience', index, 'location', e.target.value)} 
                    placeholder="Location"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      value={exp.startDate} 
                      onChange={(e) => handleObjectArrayChange('experience', index, 'startDate', e.target.value)} 
                      placeholder="Start Date"
                    />
                    <Input 
                      value={exp.endDate} 
                      onChange={(e) => handleObjectArrayChange('experience', index, 'endDate', e.target.value)} 
                      placeholder="End Date (or 'Present')"
                    />
                  </div>
                  <Textarea 
                    value={exp.description} 
                    onChange={(e) => handleObjectArrayChange('experience', index, 'description', e.target.value)} 
                    placeholder="Description"
                    rows={3}
                  />
                  
                  {/* Highlights/Achievements */}
                  <h5 className="font-medium mt-2">Key Achievements</h5>
                  {exp.highlights.map((highlight, hIndex) => (
                    <div key={hIndex} className="flex items-center gap-2">
                      <Input 
                        value={highlight} 
                        onChange={(e) => handleNestedArrayChange(
                          'experience', index, 'highlights', hIndex, e.target.value
                        )} 
                        placeholder="Achievement"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => removeNestedArrayItem(
                          'experience', index, 'highlights', hIndex
                        )}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    onClick={() => addNestedArrayItem('experience', index, 'highlights')}
                  >
                    Add Achievement
                  </Button>
                </div>
              ))}
              <Button 
                onClick={() => addArrayItem('experience', {
                  id: String(formData.content.experience.length + 1),
                  company: '',
                  position: '',
                  location: '',
                  startDate: '',
                  endDate: '',
                  description: '',
                  highlights: ['']
                })}
              >
                Add Experience
              </Button>
            </div>
          )}

          {/* Skills Section */}
          {activeSection === 'skills' && (
            <div className="space-y-4">
              <h3 className="font-medium">Skills</h3>
              {formData.content.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    value={skill} 
                    onChange={(e) => handleArrayChange('skills', index, e.target.value)} 
                    placeholder="Skill"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => {
                      const newSkills = [...formData.content.skills];
                      if (newSkills.length > 1) {
                        newSkills.splice(index, 1);
                      } else {
                        newSkills[0] = '';
                      }
                      setFormData({
                        ...formData,
                        content: {
                          ...formData.content,
                          skills: newSkills
                        }
                      });
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={() => {
                  setFormData({
                    ...formData,
                    content: {
                      ...formData.content,
                      skills: [...formData.content.skills, '']
                    }
                  });
                }}
              >
                Add Skill
              </Button>
            </div>
          )}

          {/* Projects Section */}
          {activeSection === 'projects' && (
            <div className="space-y-6">
              <h3 className="font-medium">Projects</h3>
              {formData.content.projects.map((project, index) => (
                <div key={index} className="space-y-4 border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Project #{index + 1}</h4>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => removeArrayItem('projects', index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <Input 
                    value={project.name} 
                    onChange={(e) => handleObjectArrayChange('projects', index, 'name', e.target.value)} 
                    placeholder="Project Name"
                  />
                  <Input 
                    value={project.url} 
                    onChange={(e) => handleObjectArrayChange('projects', index, 'url', e.target.value)} 
                    placeholder="Project URL (Optional)"
                  />
                  <Textarea 
                    value={project.description} 
                    onChange={(e) => handleObjectArrayChange('projects', index, 'description', e.target.value)} 
                    placeholder="Project Description"
                    rows={3}
                  />
                  
                  {/* Project Highlights */}
                  <h5 className="font-medium mt-2">Key Features/Contributions</h5>
                  {project.highlights.map((highlight, hIndex) => (
                    <div key={hIndex} className="flex items-center gap-2">
                      <Input 
                        value={highlight} 
                        onChange={(e) => handleNestedArrayChange(
                          'projects', index, 'highlights', hIndex, e.target.value
                        )} 
                        placeholder="Feature/Contribution"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => removeNestedArrayItem(
                          'projects', index, 'highlights', hIndex
                        )}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    onClick={() => addNestedArrayItem('projects', index, 'highlights')}
                  >
                    Add Feature
                  </Button>
                </div>
              ))}
              <Button 
                onClick={() => addArrayItem('projects', {
                  id: String(formData.content.projects.length + 1),
                  name: '',
                  description: '',
                  url: '',
                  highlights: ['']
                })}
              >
                Add Project
              </Button>
            </div>
          )}

          {/* Certifications Section */}
          {activeSection === 'certifications' && (
            <div className="space-y-6">
              <h3 className="font-medium">Certifications</h3>
              {formData.content.certifications.map((cert, index) => (
                <div key={index} className="space-y-4 border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Certification #{index + 1}</h4>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => removeArrayItem('certifications', index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <Input 
                    value={cert.name} 
                    onChange={(e) => handleObjectArrayChange('certifications', index, 'name', e.target.value)} 
                    placeholder="Certification Name"
                  />
                  <Input 
                    value={cert.issuer} 
                    onChange={(e) => handleObjectArrayChange('certifications', index, 'issuer', e.target.value)} 
                    placeholder="Issuing Organization"
                  />
                  <Input 
                    value={cert.date} 
                    onChange={(e) => handleObjectArrayChange('certifications', index, 'date', e.target.value)} 
                    placeholder="Date Obtained"
                  />
                  <Textarea 
                    value={cert.description} 
                    onChange={(e) => handleObjectArrayChange('certifications', index, 'description', e.target.value)} 
                    placeholder="Description (Optional)"
                    rows={3}
                  />
                </div>
              ))}
              <Button 
                onClick={() => addArrayItem('certifications', {
                  id: String(formData.content.certifications.length + 1),
                  name: '',
                  issuer: '',
                  date: '',
                  description: ''
                })}
              >
                Add Certification
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Resume'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeForm;
