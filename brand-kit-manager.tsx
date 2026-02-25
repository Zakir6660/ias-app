
"use client";

import { BrandKit, SubtitleStyle } from "@/lib/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Check, FilePlus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";

type BrandKitManagerProps = {
    brandKits: BrandKit[];
    setBrandKits: React.Dispatch<React.SetStateAction<BrandKit[]>>;
    activeBrandKitId: string | null;
    setActiveBrandKitId: React.Dispatch<React.SetStateAction<string | null>>;
    limit: number;
    userTier: 'free' | 'pro' | 'premium';
};

const defaultSubtitleStyle: SubtitleStyle = {
    size: 'medium',
    background: true,
    color: '#FFFFFF',
    position: 'bottom'
};

const defaultBrandKit: Omit<BrandKit, 'id' | 'name'> = {
    logo: null,
    primaryColor: '#9D4EDD',
    secondaryColor: '#577590',
    subtitleStyle: defaultSubtitleStyle,
    watermarkText: 'IAS'
};

function BrandKitForm({ onSave, existingKit }: { onSave: (kit: BrandKit) => void, existingKit?: BrandKit }) {
    const [name, setName] = useState(existingKit?.name || '');
    const [logo, setLogo] = useState<string | null>(existingKit?.logo || null);
    const [primaryColor, setPrimaryColor] = useState(existingKit?.primaryColor || defaultBrandKit.primaryColor);
    const [secondaryColor, setSecondaryColor] = useState(existingKit?.secondaryColor || defaultBrandKit.secondaryColor);
    const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>(existingKit?.subtitleStyle || defaultBrandKit.subtitleStyle);
    const [watermarkText, setWatermarkText] = useState(existingKit?.watermarkText || defaultBrandKit.watermarkText);
    const { toast } = useToast();

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setLogo(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            toast({ variant: 'destructive', title: 'Error', description: 'Every Brand Kit needs a name.' });
            return;
        }
        onSave({
            id: existingKit?.id || new Date().toISOString(),
            name,
            logo,
            primaryColor,
            secondaryColor,
            subtitleStyle,
            watermarkText
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="kit-name">Brand Kit Name</Label>
                <Input id="kit-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., My Company" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label>Primary Color</Label>
                    <Input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1">
                    <Label>Secondary Color</Label>
                    <Input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="h-10" />
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="logo-upload">Brand Logo</Label>
                <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs" />
                {logo && <img src={logo} alt="logo preview" className="h-12 w-12 object-contain rounded mt-2" />}
            </div>
            
            <div className="space-y-1">
                <Label htmlFor="watermark">Watermark Text</Label>
                <Input id="watermark" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} placeholder="e.g., © MyBrand" />
            </div>
            
            <fieldset className="border p-4 rounded-md space-y-3">
                <legend className="text-sm font-medium px-1">Default Subtitle Style</legend>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <Label>Font Size</Label>
                        <Select value={subtitleStyle.size} onValueChange={(v: 'small'|'medium'|'large') => setSubtitleStyle(s => ({...s, size: v}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                        <Label>Position</Label>
                        <Select value={subtitleStyle.position} onValueChange={(v: 'top'|'bottom') => setSubtitleStyle(s => ({...s, position: v}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="top">Top</SelectItem>
                                <SelectItem value="bottom">Bottom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Font Color</Label>
                        <Input type="color" value={subtitleStyle.color} onChange={e => setSubtitleStyle(s => ({...s, color: e.target.value}))} className="h-10" />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                        <Switch id="subtitle-bg" checked={subtitleStyle.background} onCheckedChange={c => setSubtitleStyle(s => ({...s, background: !!c}))}/>
                        <Label htmlFor="subtitle-bg">Background</Label>
                    </div>
                 </div>
            </fieldset>

            <Button type="submit" className="w-full">Save Brand Kit</Button>
        </form>
    );
}

export function BrandKitManager({ brandKits, setBrandKits, activeBrandKitId, setActiveBrandKitId, limit, userTier }: BrandKitManagerProps) {
    const { toast } = useToast();
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [editingKit, setEditingKit] = useState<BrandKit | undefined>(undefined);
    const isLimitReached = brandKits.length >= limit;

    const handleSaveNew = (kit: BrandKit) => {
        if (isLimitReached) {
            toast({ 
                variant: 'destructive', 
                title: 'Brand Kit Limit Reached', 
                description: `You have reached the limit of ${limit} for the ${userTier} plan. Please upgrade for more.` 
            });
            return;
        }
        setBrandKits(prev => [...prev, kit]);
        toast({ title: 'Brand Kit Saved', description: `"${kit.name}" has been created.` });
        setCreateOpen(false);
        setActiveBrandKitId(kit.id);
    };
    
    const handleSaveEdit = (kit: BrandKit) => {
        setBrandKits(prev => prev.map(k => k.id === kit.id ? kit : k));
        toast({ title: 'Brand Kit Updated', description: `"${kit.name}" has been updated.` });
        setEditingKit(undefined);
    };

    const handleDeleteKit = (kitId: string) => {
        if (activeBrandKitId === kitId) {
            setActiveBrandKitId(null);
        }
        setBrandKits(prev => prev.filter(k => k.id !== kitId));
        toast({ variant: 'destructive', title: 'Brand Kit Deleted' });
    };

    return (
        <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Brand Kits</CardTitle>
                        <CardDescription>Manage and apply your brand assets ({brandKits.length}/{limit === Infinity ? '∞' : limit}).</CardDescription>
                    </div>
                    {brandKits.length > 0 &&
                        <DialogTrigger asChild>
                            <Button variant="outline" disabled={isLimitReached}><FilePlus className="mr-2" /> New Kit</Button>
                        </DialogTrigger>
                    }
                </CardHeader>
                <CardContent>
                    {brandKits.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
                            <h3 className="text-lg font-semibold">Create Your First Brand Kit</h3>
                            <p className="mt-1 mb-4 text-sm text-muted-foreground">
                                Save your logos, colors, and styles to ensure every creation is on-brand.
                            </p>
                            <DialogTrigger asChild>
                                <Button><FilePlus className="mr-2" /> Create New Kit</Button>
                            </DialogTrigger>
                             <p className="mt-4 text-xs text-muted-foreground">
                                Influencer Automation Studio (IAS)
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {brandKits.map(kit => (
                                <div key={kit.id} className="flex items-center justify-between gap-2 p-2 rounded-md border">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: kit.primaryColor }} />
                                        <p className="font-medium">{kit.name}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Dialog open={editingKit?.id === kit.id} onOpenChange={(open) => !open && setEditingKit(undefined)}>
                                            <DialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingKit(kit)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>Edit Brand Kit</DialogTitle></DialogHeader>
                                                <BrandKitForm onSave={handleSaveEdit} existingKit={kit} />
                                            </DialogContent>
                                        </Dialog>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteKit(kit.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        {activeBrandKitId === kit.id ? (
                                            <Button size="sm" variant="secondary" onClick={() => setActiveBrandKitId(null)}>
                                                <X className="mr-2 h-4 w-4" /> Deselect
                                            </Button>
                                        ) : (
                                            <Button size="sm" onClick={() => setActiveBrandKitId(kit.id)}>
                                                <Check className="mr-2 h-4 w-4" /> Select
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
            <DialogContent>
                <DialogHeader><DialogTitle>Create New Brand Kit</DialogTitle></DialogHeader>
                <BrandKitForm onSave={handleSaveNew} />
            </DialogContent>
        </Dialog>
    );
}
