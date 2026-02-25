
"use client";

import { Project } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { format } from "date-fns";
import { MessageSquare, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FeedbackManagerProps = {
    project: Project | undefined;
    onUpdate: (updates: { status: Project['status'], feedbackNotes: string }) => void;
};

export function FeedbackManager({ project, onUpdate }: FeedbackManagerProps) {
    const { toast } = useToast();
    
    if (!project) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Client Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Select a project to manage feedback.</p>
                </CardContent>
            </Card>
        );
    }
    
    const handleStatusChange = (status: Project['status']) => {
        onUpdate({ status, feedbackNotes: project.feedbackNotes });
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate({ status: project.status, feedbackNotes: e.target.value });
    };

    const getStatusBadge = () => {
        switch (project.status) {
            case 'Approved':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Approved</Badge>;
            case 'Needs Changes':
                return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" /> Needs Changes</Badge>;
            case 'Pending':
            default:
                return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare /> Client Feedback
                        </CardTitle>
                        <CardDescription>
                            Manage project status and keep track of client feedback.
                        </CardDescription>
                    </div>
                    {getStatusBadge()}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium">Status</p>
                        <Select value={project.status} onValueChange={handleStatusChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Needs Changes">Needs Changes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-sm text-muted-foreground h-10 flex items-center">
                            {project.statusTimestamp ? format(new Date(project.statusTimestamp), "MMM d, yyyy h:mm a") : 'N/A'}
                        </p>
                    </div>
                </div>
                <div>
                     <p className="text-sm font-medium mb-2">Feedback Notes</p>
                     <Textarea
                        placeholder="Add client notes or feedback here..."
                        value={project.feedbackNotes}
                        onChange={handleNotesChange}
                        maxLength={300}
                        rows={4}
                     />
                     <p className="text-xs text-muted-foreground mt-1 text-right">{project.feedbackNotes.length} / 300</p>
                </div>
            </CardContent>
        </Card>
    );
}
