
"use client";

import { useState, useMemo } from "react";
import { ExportRecord } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Image from "next/image";
import { format } from "date-fns";
import { History, Share2, Download, Clipboard } from "lucide-react";
import { Badge } from "../ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

type ExportHistoryManagerProps = {
    history: ExportRecord[];
    onRestore: (record: ExportRecord) => void;
};

export function ExportHistoryManager({ history, onRestore }: ExportHistoryManagerProps) {
    const { toast } = useToast();
    const [recordToShare, setRecordToShare] = useState<ExportRecord | null>(null);

    const generatedLink = useMemo(() => {
        if (!recordToShare) return null;
        try {
            const data = {
                character: recordToShare.character,
                settings: recordToShare.settings,
            };
            const jsonString = JSON.stringify(data);
            const base64String = btoa(unescape(encodeURIComponent(jsonString)));
            return `${window.location.origin}/preview?data=${base64String}`;
        } catch {
            return null;
        }
    }, [recordToShare]);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History />
                        Export History
                    </CardTitle>
                    <CardDescription>
                        Review, restore, or duplicate any previous export from this project.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
                            <div className="mb-4 rounded-full border border-dashed p-3">
                                <History className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No Exports Yet</h3>
                            <p className="mt-1 mb-4 text-sm text-muted-foreground">
                                When you export an image or video, it will appear here for future use.
                            </p>
                            <Button disabled>
                               <Download className="mr-2" /> Export to See History
                            </Button>
                             <p className="mt-2 text-xs text-muted-foreground">
                                Use the 'Prepare for Export' button in the live preview panel.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {history.map(record => (
                                <div key={record.id} className="flex items-center gap-4 p-2 border rounded-lg">
                                    <Image
                                        src={record.thumbnail}
                                        alt={`V${record.version} Thumbnail`}
                                        width={80}
                                        height={80}
                                        className="rounded-md aspect-square object-cover bg-muted"
                                    />
                                    <div className="flex-1 text-sm space-y-1">
                                        <p className="font-bold">{record.name}</p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline">{record.source || 'Unknown'}</Badge>
                                            <Badge variant="secondary">{record.type} / v{record.version}</Badge>
                                        </div>
                                        <p className="text-muted-foreground text-xs">{format(new Date(record.timestamp), 'MMM d, yyyy h:mm a')}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button size="sm" variant="outline" onClick={() => setRecordToShare(record)}>
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Get Link
                                        </Button>
                                        <Button size="sm" variant="secondary" onClick={() => onRestore(record)}>
                                            <History className="mr-2 h-4 w-4" />
                                            Restore
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!recordToShare} onOpenChange={(isOpen) => !isOpen && setRecordToShare(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share Historical Preview Link</DialogTitle>
                        <DialogDescription>
                            This is a preview link for Version {recordToShare?.version} of your project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <Input value={generatedLink || 'Generating...'} readOnly />
                        <Button onClick={() => {
                            if (generatedLink) {
                                navigator.clipboard.writeText(generatedLink);
                                toast({ title: 'Copied!', description: 'Link copied to clipboard.' });
                            }
                        }} disabled={!generatedLink}>
                            <Clipboard className="h-4 w-4" />
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setRecordToShare(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
