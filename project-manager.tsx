

"use client";

import { Project } from "@/lib/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Copy, Edit, Trash2, FilePlus, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProjectManagerProps = {
    projects: Project[];
    activeProjectId: string | null;
    onSelectProject: (id: string | null) => void;
    onNewProject: (name: string) => void;
    onDuplicateProject: (id: string) => void;
    onDuplicateAsVariant?: (id: string) => void;
    onRenameProject: (id: string, newName: string) => void;
    onDeleteProject: (id: string) => void;
    showCreate?: boolean;
    showManagement?: boolean;
};

export function ProjectManager({ 
    projects, 
    activeProjectId, 
    onSelectProject, 
    onNewProject, 
    onDuplicateProject, 
    onDuplicateAsVariant, 
    onRenameProject, 
    onDeleteProject,
    showCreate = true,
    showManagement = true,
}: ProjectManagerProps) {
    const { toast } = useToast();
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [renamingName, setRenamingName] = useState('');

    const activeProject = projects.find(p => p.id === activeProjectId);

    const handleCreateProject = () => {
        if (!newProjectName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Every project needs a name.' });
            return;
        }
        onNewProject(newProjectName);
        setCreateOpen(false);
        setNewProjectName('');
    };

    const handleRename = () => {
        if (!editingProject || !renamingName.trim()) return;
        onRenameProject(editingProject.id, renamingName);
        setEditingProject(null);
        setRenamingName('');
    };

    const mainContent = (
        <div className="flex gap-2">
            <Select value={activeProjectId || ''} onValueChange={onSelectProject}>
                <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                    {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {showCreate && (
                <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setNewProjectName('')}><FilePlus className="h-4 w-4" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="new-project-name">Project Name</Label>
                        <Input id="new-project-name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="e.g., Summer Campaign"/>
                    </div>
                    <Button onClick={handleCreateProject}>Create Project</Button>
                </DialogContent>
            </Dialog>
            )}
            {showManagement && activeProject && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-10 w-10"><Settings className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                            setEditingProject(activeProject);
                            setRenamingName(activeProject.name);
                        }}>
                            <Edit className="mr-2 h-4 w-4" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicateProject(activeProject.id)}>
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        {onDuplicateAsVariant && (
                            <DropdownMenuItem onClick={() => onDuplicateAsVariant(activeProject.id)}>
                                <Copy className="mr-2 h-4 w-4" /> Duplicate as Variant
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onDeleteProject(activeProject.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );

    return (
        <>
            {showManagement ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Project: {activeProject?.name || 'None'}</CardTitle>
                        <CardDescription>
                            Switch between your projects or create a new one to save your work.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {mainContent}
                    </CardContent>
                </Card>
            ) : (
                mainContent
            )}

            <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
            <DialogContent>
                    <DialogHeader><DialogTitle>Rename Project</DialogTitle></DialogHeader>
                    <div className="space-y-2">
                    <Label htmlFor="rename-project-name">New Name</Label>
                    <Input id="rename-project-name" value={renamingName} onChange={(e) => setRenamingName(e.target.value)} />
                </div>
                <Button onClick={handleRename}>Rename</Button>
            </DialogContent>
            </Dialog>
        </>
    );
}
