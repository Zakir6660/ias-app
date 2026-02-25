"use client";

import { Character } from "@/lib/types";
import { characterOptions } from "@/lib/data";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FaceCardProps = {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
};

export function FaceCard({ character, updateCharacter }: FaceCardProps) {
  return (
    <AccordionItem value="face">
      <AccordionTrigger className="text-lg font-semibold">Face</AccordionTrigger>
      <AccordionContent>
        <Card>
          <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-3 gap-6">
            {(Object.keys(characterOptions) as (keyof typeof characterOptions)[]).filter(key => 
                ['faceShape', 'jawline', 'cheeks', 'chin', 'nose', 'lips'].includes(key)
            ).map((key) => (
              <div className="space-y-2" key={key}>
                <Label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</Label>
                <Select
                  value={character[key as keyof Character] as string}
                  onValueChange={(value) => updateCharacter({ [key]: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${key}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {characterOptions[key].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
