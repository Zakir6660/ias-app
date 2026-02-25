"use client";

import { Character } from "@/lib/types";
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
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type BodyCardProps = {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
};

export function BodyCard({ character, updateCharacter }: BodyCardProps) {
  return (
    <AccordionItem value="body">
      <AccordionTrigger className="text-lg font-semibold">Body</AccordionTrigger>
      <AccordionContent>
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>Gender</Label>
              <Select
                value={character.gender}
                onValueChange={(value: Character["gender"]) =>
                  updateCharacter({ gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Body Type</Label>
               <Select
                value={character.bodyType}
                onValueChange={(value: Character["bodyType"]) =>
                  updateCharacter({ bodyType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Slim">Slim</SelectItem>
                  <SelectItem value="Athletic">Athletic</SelectItem>
                  <SelectItem value="Heavy">Heavy</SelectItem>
                  <SelectItem value="Bulky">Bulky</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="age">Age: {character.age}</Label>
              <Slider
                id="age"
                min={18}
                max={99}
                value={[character.age]}
                onValueChange={([value]) => updateCharacter({ age: value })}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="height">Height: {character.height} cm</Label>
              <Slider
                id="height"
                min={140}
                max={220}
                value={[character.height]}
                onValueChange={([value]) => updateCharacter({ height: value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight: {character.weight} kg</Label>
              <Slider
                id="weight"
                min={40}
                max={150}
                value={[character.weight]}
                onValueChange={([value]) => updateCharacter({ weight: value })}
              />
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
