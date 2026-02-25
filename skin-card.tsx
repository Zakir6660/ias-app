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
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";

type SkinCardProps = {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
};

export function SkinCard({ character, updateCharacter }: SkinCardProps) {
  const handleSkinConditionChange = (checked: boolean, condition: string) => {
    let newConditions: string[];
    if (checked) {
      if (condition === "None") {
        newConditions = ["None"];
      } else {
        newConditions = [...character.skinConditions.filter(c => c !== "None"), condition];
      }
    } else {
      newConditions = character.skinConditions.filter(c => c !== condition);
      if (newConditions.length === 0) {
        newConditions = ["None"];
      }
    }
    updateCharacter({ skinConditions: newConditions });
  };
  
  return (
    <AccordionItem value="skin">
      <AccordionTrigger className="text-lg font-semibold">
        Skin &amp; Material
      </AccordionTrigger>
      <AccordionContent>
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Skin Tone</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={character.skinTone}
                  onChange={(e) =>
                    updateCharacter({ skinTone: e.target.value })
                  }
                  className="p-1 h-10 w-14"
                />
                 <Input
                  type="text"
                  value={character.skinTone}
                  onChange={(e) =>
                    updateCharacter({ skinTone: e.target.value })
                  }
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Skin Material</Label>
              <Select
                value={character.skinMaterial}
                onValueChange={(value) =>
                  updateCharacter({ skinMaterial: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {characterOptions.skinMaterial.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Surface Patterns</Label>
              <Select
                value={character.surfacePatterns}
                onValueChange={(value) =>
                  updateCharacter({ surfacePatterns: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  {characterOptions.surfacePatterns.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Skin Conditions</Label>
              <div className="grid grid-cols-2 gap-2">
                {characterOptions.skinConditions.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skin-${condition}`}
                      checked={character.skinConditions.includes(condition)}
                      onCheckedChange={(checked) => handleSkinConditionChange(!!checked, condition)}
                    />
                    <Label htmlFor={`skin-${condition}`} className="font-normal">{condition}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
