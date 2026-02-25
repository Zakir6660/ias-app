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
import { Switch } from "../ui/switch";

type ClothingCardProps = {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
};

export function ClothingCard({ character, updateCharacter }: ClothingCardProps) {
  return (
    <AccordionItem value="clothing">
      <AccordionTrigger className="text-lg font-semibold">Clothing</AccordionTrigger>
      <AccordionContent>
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Top</Label>
              <Select
                value={character.top}
                onValueChange={(value: Character["top"]) =>
                  updateCharacter({ top: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select top" />
                </SelectTrigger>
                <SelectContent>
                  {(characterOptions.top || []).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bottom</Label>
              <Select
                value={character.bottom}
                onValueChange={(value: Character["bottom"]) =>
                  updateCharacter({ bottom: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bottom" />
                </SelectTrigger>
                <SelectContent>
                  {(characterOptions.bottom || []).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Clothing Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={character.clothingColor}
                  onChange={(e) =>
                    updateCharacter({ clothingColor: e.target.value })
                  }
                  className="p-1 h-10 w-14"
                />
                 <Input
                  type="text"
                  value={character.clothingColor}
                  onChange={(e) =>
                    updateCharacter({ clothingColor: e.target.value })
                  }
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 self-end pb-2">
              <Switch 
                id="show-logo" 
                checked={character.showLogo}
                onCheckedChange={(checked) => updateCharacter({ showLogo: checked })}
              />
              <Label htmlFor="show-logo">Show Logo</Label>
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
