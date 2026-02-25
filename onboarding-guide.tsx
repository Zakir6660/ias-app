
"use client";

import { useState, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type OnboardingStep = {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
};

const steps: OnboardingStep[] = [
  {
    targetId: 'character-builder-accordion',
    title: '1/4: Customize Your Character',
    content: 'This is where the magic starts. Customize every detail of your character here.',
    position: 'bottom',
    align: 'start',
  },
  {
    targetId: 'live-preview-card',
    title: '2/4: See Your Character Live',
    content: 'See your creation come to life! This preview updates instantly as you make changes.',
    position: 'left',
    align: 'center',
  },
  {
    targetId: 'export-controls-card',
    title: '3/4: Export & Share',
    content: 'Ready to share? Prepare for export to download your work or generate a shareable link for clients.',
    position: 'top',
    align: 'start',
  },
  {
    targetId: 'project-manager-card',
    title: '4/4: Save Your Work',
    content: 'Stay organized! Save your work in Projects and manage your Brand Kits.',
    position: 'bottom',
    align: 'start',
  },
];

type TooltipPosition = {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
};

type ElementRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function OnboardingGuide({ onComplete }: { onComplete: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);
  const [highlightBox, setHighlightBox] = useState<ElementRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const currentStep = steps[stepIndex];

  useLayoutEffect(() => {
    function updatePosition() {
      const targetElement = document.getElementById(currentStep.targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        
        // Use a timeout to wait for the scroll to finish
        const scrollTimeout = setTimeout(() => {
            const rect = targetElement.getBoundingClientRect();
            setHighlightBox({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });

            const tooltipPosition: TooltipPosition = {};
            const offset = 16; // 1rem
            const tooltipWidth = 350;
            const tooltipHeight = 220; // Approximate height

            switch (currentStep.position) {
            case 'bottom':
                tooltipPosition.top = `${rect.bottom + offset}px`;
                break;
            case 'top':
                tooltipPosition.bottom = `${window.innerHeight - rect.top + offset}px`;
                break;
            case 'left':
                tooltipPosition.right = `${window.innerWidth - rect.left + offset}px`;
                break;
            case 'right':
                tooltipPosition.left = `${rect.right + offset}px`;
                break;
            }

            if (currentStep.position === 'top' || currentStep.position === 'bottom') {
                switch (currentStep.align) {
                    case 'start':
                        tooltipPosition.left = `${rect.left}px`;
                        break;
                    case 'center':
                        tooltipPosition.left = `${Math.max(8, rect.left + rect.width / 2 - tooltipWidth / 2)}px`;
                        break;
                    case 'end':
                        tooltipPosition.right = `${window.innerWidth - rect.right}px`;
                        break;
                }
            } else { // left or right
                switch (currentStep.align) {
                    case 'start':
                        tooltipPosition.top = `${rect.top}px`;
                        break;
                    case 'center':
                        tooltipPosition.top = `${Math.max(8, rect.top + rect.height / 2 - tooltipHeight / 2)}px`;
                        break;
                    case 'end':
                        tooltipPosition.bottom = `${window.innerHeight - rect.bottom}px`;
                        break;
                }
            }
            setTooltipPos(tooltipPosition);
            setIsVisible(true);
        }, 300); // Adjust timeout as needed
        
        return () => clearTimeout(scrollTimeout);
      }
    }

    setIsVisible(false);
    const updateTimeout = setTimeout(updatePosition, 100);

    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      clearTimeout(updateTimeout);
    };
  }, [stepIndex, currentStep]);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete();
    }
  };
  
  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-[99]" onClick={onComplete} />
      {highlightBox && isVisible && (
        <div 
            className="fixed border-4 border-primary rounded-lg pointer-events-none transition-all duration-300 z-[100] shadow-2xl"
            style={{ 
                top: highlightBox.top - 6, 
                left: highlightBox.left - 6, 
                width: highlightBox.width + 12, 
                height: highlightBox.height + 12
            }}
        />
      )}
      {tooltipPos && (
          <Card 
            className={`fixed z-[101] w-[350px] transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{...tooltipPos, transform: 'translateZ(0)'}} // translateZ for performance
          >
            <CardHeader>
              <CardTitle>{currentStep.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{currentStep.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Step {stepIndex + 1} of {steps.length}</p>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onComplete}>Skip</Button>
                    <Button onClick={handleNext}>
                        {stepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                </div>
            </CardFooter>
          </Card>
      )}
    </>
  );
}
