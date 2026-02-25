
"use client";

import { useState, useEffect } from "react";
import { Accordion } from "@/components/ui/accordion";
import { LivePreview } from "./live-preview";
import { Character, AdTemplate, LivePreviewSettings, Project } from "@/lib/types";
import { BodyCard } from "./body-card";
import { FaceCard } from "./face-card";
import { EyesCard } from "./eyes-card";
import { HairCard } from "./hair-card";
import { SkinCard } from "./skin-card";
import { ClothingCard } from "./clothing-card";
import { ExtrasCard } from "./extras-card";
import { Button } from "../ui/button";
import { Loader2, Save, FilePlus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OnboardingGuide } from "./onboarding-guide";
import { useAppData } from "@/app/(main)/_context/app-context";
import { ProjectManager } from "./project-manager";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import Link from "next/link";

export function CharacterForm() {
  const { 
    isLoading,
    projects,
    activeProjectId,
    activeProject, 
    updateCharacter, 
    updateSettings, 
    handleExport, 
    userTier,
    setProjects,
    setActiveProjectId,
    addNotification,
  } = useAppData();
  
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // --- Client-side Hydration for Onboarding ---
  useEffect(() => {
    try {
      const onboardingCompleted = localStorage.getItem('virtubrand_onboarding_completed');
      if (onboardingCompleted !== 'true') {
        setTimeout(() => setShowOnboarding(true), 500);
      }
    } catch (error) {
      console.error("Failed to check onboarding status from localStorage", error);
    }
  }, []);

  const handleOnboardingComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('virtubrand_onboarding_completed', 'true');
    }
    setShowOnboarding(false);
    toast({ title: "You're all set!", description: "Let the creation begin!" });
  };
  
  const handleSaveProject = () => {
    if (!activeProjectId) return;
    toast({ title: 'Project Saved', description: `Your project progress has been saved.` });
  };
  
  if (isLoading) {
    return (
        <div className="flex w-full h-[60vh] items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-lg">Loading your workspace...</p>
        </div>
    );
  }

  if (!activeProject) {
      return (
         <Alert>
            <AlertTitle>No Project Selected</AlertTitle>
            <AlertDescription>
              Please go to the <Link href="/projects" className="font-bold underline text-primary">Projects page</Link> to create or select a project to start building your character.
            </AlertDescription>
        </Alert>
      )
  }
  
  const { character, settings } = activeProject;

  return (
    <>
    {showOnboarding && <OnboardingGuide onComplete={handleOnboardingComplete} />}
     <div className="sticky top-14 lg:top-[60px] z-20 bg-background/95 backdrop-blur-sm py-2 px-4 mb-4 border-b flex items-center flex-wrap gap-2 -mx-4">
        
        <div className="max-w-xs w-full">
            <ProjectManager
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={setActiveProjectId}
                onNewProject={(name) => {
                    const newProject: Project = {
                        id: new Date().toISOString(),
                        name: name || `Project ${projects.length + 1}`,
                        character: activeProject.character,
                        settings: activeProject.settings,
                        activeTemplateId: null,
                        activeBrandKitId: activeProject.activeBrandKitId,
                        exportHistory: [],
                        status: 'Pending',
                        feedbackNotes: '',
                        statusTimestamp: null,
                    };
                    setProjects(prev => [...prev, newProject]);
                    setActiveProjectId(newProject.id);
                }}
                onDuplicateProject={(id) => {
                     const projectToDuplicate = projects.find(p => p.id === id);
                    if (!projectToDuplicate) return;
                    const newProject: Project = {
                        ...projectToDuplicate,
                        id: new Date().toISOString(),
                        name: `${projectToDuplicate.name} (Copy)`,
                    };
                    setProjects(prev => [...prev, newProject]);
                    setActiveProjectId(newProject.id);
                    toast({ title: 'Project Duplicated', description: `Now working on "${newProject.name}".`});
                }}
                onRenameProject={(id, newName) => {
                    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
                    toast({ title: 'Project Renamed' });
                }}
                onDeleteProject={(id) => {
                     if (projects.length === 1) {
                        toast({ variant: 'destructive', title: 'Action Not Allowed', description: 'You need at least one project to work on.' });
                        return;
                    }
                    const projectToDelete = projects.find(p => p.id === id);
                    if (!projectToDelete) return;
                    
                    setProjects(prev => prev.filter(p => p.id !== id));
                    if (activeProjectId === id) {
                        setActiveProjectId(projects.find(p => p.id !== id)?.id || null);
                    }
                    toast({ variant: 'destructive', title: 'Project Deleted', description: `"${projectToDelete.name}" was deleted.` });
                }}
                showCreate={false}
                showManagement={true}
            />
        </div>

        <div className="flex-grow"></div>

        <Button size="sm" onClick={() => updateSettings({ isCaptureMode: true })}>
            <Download className="mr-2 h-4 w-4" /> Export
        </Button>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <Accordion id="character-builder-accordion" type="multiple" defaultValue={["body", "face"]} className="w-full">
          <BodyCard character={character} updateCharacter={updateCharacter} />
          <FaceCard character={character} updateCharacter={updateCharacter} />
          <EyesCard character={character} updateCharacter={updateCharacter} />
          <HairCard character={character} updateCharacter={updateCharacter} />
          <SkinCard character={character} updateCharacter={updateCharacter} />
          <ClothingCard character={character} updateCharacter={updateCharacter} />
          <ExtrasCard character={character} updateCharacter={updateCharacter} />
        </Accordion>
        
        <div className="flex gap-4">
            <Button size="lg" className="w-full" onClick={handleSaveProject}>
                <Save className="mr-2 h-4 w-4"/>
                Save Project
            </Button>
        </div>
      </div>
      <div className="lg:col-span-1">
        <LivePreview 
            project={activeProject}
            character={character} 
            settings={settings} 
            updateSettings={updateSettings}
            onExport={handleExport}
            userTier={userTier}
            addNotification={addNotification}
        />
      </div>
    </div>
    </>
  );
}
