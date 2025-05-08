import { useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { PreferenceDTO, UpdatePreferenceCommand } from "@/types";
import { updatePreferenceSchema } from "@/lib/validations/preference";
import SaveButton from "./SaveButton";

interface PreferencesFormProps {
  preferences: PreferenceDTO | null;
  onUpdate: () => void;
}

export default function PreferencesForm({ preferences, onUpdate }: PreferencesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdatePreferenceCommand>({
    preference: preferences?.preference || "",
    level: preferences?.level || 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = updatePreferenceSchema.parse(formData);
      setIsSubmitting(true);
      
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save preferences");
      }

      toast.success("Zapisano preferencje");
      onUpdate();
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Błąd", {
          description: err.message
        });
      } else {
        toast.error("Wystąpił nieoczekiwany błąd");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencje aktywności</CardTitle>
        <CardDescription>
          Określ swoje preferencje dotyczące aktywności fizycznych
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="preference">Preferowana aktywność</Label>
            <Input
              id="preference"
              type="text"
              value={formData.preference}
              onChange={(e) => setFormData(prev => ({ ...prev, preference: e.target.value }))}
              placeholder="np. bieganie, pływanie, jazda na rowerze"
              aria-describedby="preference-description"
              required
            />
            <p id="preference-description" className="text-sm text-muted-foreground">
              Wpisz swoją ulubioną aktywność fizyczną
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="level">Poziom zaawansowania</Label>
            <Input
              id="level"
              type="number"
              min={1}
              max={5}
              value={formData.level}
              onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value, 10) }))}
              aria-describedby="level-description"
              required
            />
            <p id="level-description" className="text-sm text-muted-foreground">
              Określ swój poziom zaawansowania (1-5)
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <SaveButton 
            isSubmitting={isSubmitting} 
            label={isSubmitting ? "Zapisywanie..." : preferences ? "Zapisz zmiany" : "Dodaj preferencje"}
          />
        </CardFooter>
      </form>
    </Card>
  );
}