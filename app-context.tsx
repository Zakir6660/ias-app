
'use client';

import {
  Character,
  AdTemplate,
  LivePreviewSettings,
  BrandKit,
  Project,
  ExportRecord,
  UserTier,
  FeatureFlag,
  Notification,
} from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import featureFlagsData from '@/lib/feature-flags.json';

type AuthUser = {
  name: string;
  email: string;
  role: 'creator' | 'agency' | null;
  hasCompletedOnboarding: boolean;
  isAdmin?: boolean;
  isBeta?: boolean;
};

// --- Default States ---
const initialCharacter: Character = {
  gender: 'Female',
  age: 28,
  height: 175,
  weight: 64,
  bodyType: 'Athletic',
  faceShape: 'Heart',
  jawline: 'Soft',
  cheeks: 'High',
  chin: 'Pointed',
  nose: 'Upturned',
  lips: 'Full',
  eyeColor: 'Purple',
  eyeType: 'Glowing',
  specialEyes: 'None',
  hairType: 'Wavy',
  hairLength: 'Long',
  hairColor: 'Pink',
  beard: 'None',
  skinTone: '#E0AC93',
  skinMaterial: 'Human',
  skinConditions: ['Freckles'],
  surfacePatterns: 'None',
  ears: 'Elf',
  horns: 'None',
  teeth: 'Normal',
  tongue: 'Normal',
  top: 'Jacket',
  bottom: 'Pants',
  clothingColor: '#9D4EDD',
  showLogo: true,
};

const initialSettings: LivePreviewSettings = {
  animationState: 'idle',
  expressionState: 'neutral',
  pose: 'front',
  cameraView: 'upper',
  background: 'studio',
  script: 'Welcome to Influencer Automation Studio! This is a sample project to get you started.',
  subtitleStyle: { size: 'medium', background: true, color: '#FFFFFF', position: 'bottom' },
  brandOverlay: { name: 'VirtuBrand', logo: null, cta: 'Get Started' },
  aspectRatio: '9:16',
  videoDuration: 10,
  isCaptureMode: false,
  watermark: 'IAS',
  showWatermarkOnPreview: true,
};

const defaultProject: Project = {
  id: 'default-project',
  name: 'Sample Project - Astra',
  character: initialCharacter,
  settings: initialSettings,
  activeTemplateId: null,
  activeBrandKitId: null,
  exportHistory: [],
  status: 'Pending',
  feedbackNotes: '',
  statusTimestamp: null,
};

const TIER_LIMITS = {
  free: { projects: 2, brandKits: 1 },
  pro: { projects: Infinity, brandKits: 5 },
  premium: { projects: Infinity, brandKits: Infinity },
};


// --- Context Definition ---
interface AppDataContextType {
  isLoading: boolean;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  activeProjectId: string | null;
  setActiveProjectId: React.Dispatch<React.SetStateAction<string | null>>;
  activeProject: Project | undefined;
  templates: AdTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<AdTemplate[]>>;
  brandKits: BrandKit[];
  setBrandKits: React.Dispatch<React.SetStateAction<BrandKit[]>>;
  userTier: UserTier;
  setUserTier: React.Dispatch<React.SetStateAction<UserTier>>;
  tierLimits: { projects: number; brandKits: number };
  updateProjectState: (getNewState: (project: Project) => Partial<Project>) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  updateSettings: (updates: Partial<LivePreviewSettings>) => void;
  setActiveBrandKitId: (id: string | null) => void;
  handleExport: (newExportData: Omit<ExportRecord, 'id' | 'version' | 'timestamp'>) => void;
  authUser: AuthUser | null;
  updateAuthUser: (updates: Partial<AuthUser>) => void;
  logout: () => void;
  featureFlags: FeatureFlag[];
  resetAppData: () => void;
  deleteAccount: () => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);


// --- Provider Component ---
export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([defaultProject]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(defaultProject.id);
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const tierLimits = TIER_LIMITS[userTier];
  const activeProject = projects.find(p => p.id === activeProjectId);

  // --- Client-side Hydration ---
  useEffect(() => {
    try {
      // Demo Mode: We'll create a mock user with Admin and Beta access for testing.
      const mockUser: AuthUser = {
        name: 'Zakira (Admin Demo)',
        email: 'zakiraaaa88@gmail.com',
        role: 'agency',
        hasCompletedOnboarding: true,
        isAdmin: true,
        isBeta: true,
      };
      setAuthUser(mockUser);
      setUserTier('premium'); // Demo gets premium tier access

      const savedProjects = localStorage.getItem('virtubrand_projects');
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        if (parsedProjects.length > 0) {
          setProjects(parsedProjects);
          setActiveProjectId(parsedProjects[0].id);
        }
      }

      const savedTemplates = localStorage.getItem('virtubrand_templates');
      if (savedTemplates) setTemplates(JSON.parse(savedTemplates));

      const savedBrandKits = localStorage.getItem('virtubrand_brandKits');
      if (savedBrandKits) setBrandKits(JSON.parse(savedBrandKits));

      const savedNotifications = localStorage.getItem('virtubrand_notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      } else {
        // Add default welcome notifications
        setNotifications([
            {
                id: 'new-feature-notification',
                title: 'New Feature: AI Presenter!',
                description: 'Combine real footage with your AI influencer. Check it out under the "Hybrid Ads" tab.',
                timestamp: new Date().toISOString(),
                read: false,
                type: 'feature'
            },
            {
                id: 'welcome-notification',
                title: 'Welcome to IAS!',
                description: 'Explore the dashboard and start creating your first AI influencer.',
                timestamp: new Date().toISOString(),
                read: false,
                type: 'system'
            }
        ]);
      }

      setFeatureFlags(featureFlagsData as FeatureFlag[]);

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({
        variant: "destructive",
        title: "Could not load data",
        description: "There was an issue loading your saved work. Using defaults.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, router]);

  // --- Data Persistence Effects ---
  useEffect(() => {
    if (!isLoading) localStorage.setItem('virtubrand_projects', JSON.stringify(projects));
  }, [projects, isLoading]);

  useEffect(() => {
    if (!isLoading) localStorage.setItem('virtubrand_templates', JSON.stringify(templates));
  }, [templates, isLoading]);

  useEffect(() => {
    if (!isLoading) localStorage.setItem('virtubrand_brandKits', JSON.stringify(brandKits));
  }, [brandKits, isLoading]);
  
  useEffect(() => {
    if (!isLoading && authUser && !authUser.isAdmin && !authUser.isBeta) {
        localStorage.setItem('virtubrand_userTier', userTier);
    }
  }, [userTier, isLoading, authUser]);

  useEffect(() => {
    if (!isLoading) localStorage.setItem('virtubrand_notifications', JSON.stringify(notifications));
  }, [notifications, isLoading]);

  // --- Notification Functions ---
  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
        ...notificationData,
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
        read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // --- State Update Functions ---
  const updateAuthUser = useCallback((updates: Partial<AuthUser>) => {
    setAuthUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, ...updates };
        return updatedUser;
    });
  }, []);

  const logout = useCallback(() => {
    toast({ title: 'Demo Mode', description: 'Logout is disabled in this public demo.' });
  }, [toast]);
  
  const resetAppData = useCallback(() => {
    // Keep user and settings, remove creative data
    localStorage.removeItem('virtubrand_projects');
    localStorage.removeItem('virtubrand_templates');
    localStorage.removeItem('virtubrand_brandKits');
    localStorage.removeItem('virtubrand_notifications');
    toast({ title: 'App Data Reset', description: 'Your creative data has been cleared. Reloading app...' });
    // Reload to apply default state from scratch
    setTimeout(() => window.location.reload(), 1500);
  }, [toast]);
  
  const deleteAccount = useCallback(() => {
    toast({ title: 'Action Disabled', description: 'Delete account is not available in demo mode.' });
  }, [toast]);

  const updateProjectState = useCallback((getNewState: (project: Project) => Partial<Project>) => {
    if (!activeProjectId) return;
    setProjects(prevProjects => prevProjects.map(p => {
        if (p.id === activeProjectId) {
            return { ...p, ...getNewState(p) };
        }
        return p;
    }));
  }, [activeProjectId]);

  const updateCharacter = useCallback((updates: Partial<Character>) => {
    updateProjectState(p => ({ character: { ...p.character, ...updates } }));
  }, [updateProjectState]);

  const updateSettings = useCallback((updates: Partial<LivePreviewSettings>) => {
    updateProjectState(p => ({ settings: { ...p.settings, ...updates } }));
  }, [updateProjectState]);

  const setActiveBrandKitId = useCallback((id: string | null) => {
    const activeKit = brandKits.find(kit => kit.id === id);
    if (activeKit) {
        updateProjectState(p => ({
            activeBrandKitId: id,
            character: { ...p.character, clothingColor: activeKit.primaryColor },
            settings: {
                ...p.settings,
                brandOverlay: { ...p.settings.brandOverlay, name: activeKit.name, logo: activeKit.logo },
                subtitleStyle: activeKit.subtitleStyle,
                watermark: activeKit.watermarkText,
            }
        }));
        toast({ title: 'Brand Kit Applied', description: `"${activeKit.name}" is now active.`});
    } else {
        updateProjectState(p => ({
            activeBrandKitId: null,
            character: { ...p.character, clothingColor: initialCharacter.clothingColor },
            settings: {
                ...p.settings,
                brandOverlay: { ...initialSettings.brandOverlay },
                subtitleStyle: initialSettings.subtitleStyle,
                watermark: initialSettings.watermark,
            }
        }));
    }
  }, [brandKits, toast, updateProjectState]);

  const handleExport = useCallback((newExportData: Omit<ExportRecord, 'id' | 'version' | 'timestamp'>) => {
    if (!activeProjectId) return;

    setProjects(prevProjects => {
      const newProjects = prevProjects.map(p => {
        if (p.id === activeProjectId) {
          const newVersion = (p.exportHistory?.length || 0) + 1;
          const newExport: ExportRecord = {
            ...newExportData,
            id: new Date().toISOString() + Math.random(),
            timestamp: new Date().toISOString(),
            version: newVersion,
          };
          const updatedHistory = [newExport, ...(p.exportHistory || [])];
          return { ...p, exportHistory: updatedHistory };
        }
        return p;
      });
      return newProjects;
    });
    toast({ title: 'Export Saved to History', description: 'This export is now saved in your project\'s history.' });
  }, [activeProjectId, toast]);

  const value = {
    isLoading,
    projects,
    setProjects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    templates,
    setTemplates,
    brandKits,
    setBrandKits,
    userTier,
    setUserTier,
    tierLimits,
    updateProjectState,
    updateCharacter,
    updateSettings,
    setActiveBrandKitId,
    handleExport,
    authUser,
    updateAuthUser,
    logout,
    featureFlags,
    resetAppData,
    deleteAccount,
    notifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };

  return (
    <AppDataContext.Provider value={value}>
        {children}
    </AppDataContext.Provider>
  );
}


// --- Hook for consuming context ---
export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within a AppDataProvider');
  }
  return context;
}
