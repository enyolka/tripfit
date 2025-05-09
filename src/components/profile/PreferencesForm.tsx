import { useState } from "react";
import { toast } from "sonner";
import { X, Plus, Pencil, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { PreferenceDTO, CreatePreferenceCommand, UpdatePreferenceCommand } from "@/types";
import { createPreferenceSchema, updatePreferenceSchema } from "@/lib/validations/preference";

interface PreferencesFormProps {
  preferences: PreferenceDTO[];
  onRefresh: () => void;
}

export default function PreferencesForm({ preferences, onRefresh }: PreferencesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preferenceToDeleteId, setPreferenceToDeleteId] = useState<string | null>(null);
  const [newPreference, setNewPreference] = useState<CreatePreferenceCommand>({
    activity_name: "",
    level: 1
  });
  const [editedPreference, setEditedPreference] = useState<UpdatePreferenceCommand>({
    activity_name: "",
    level: 1
  });

  const validateNewPreference = () => {
    try {
      createPreferenceSchema.parse(newPreference);
      return true;
    } catch (err) {
      return false;
    }
  };

  const validateEditedPreference = () => {
    try {
      updatePreferenceSchema.parse(editedPreference);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = createPreferenceSchema.parse(newPreference);
      setIsSubmitting(true);
      
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create preference");
      }

      toast.success("Dodano preferencję");
      setNewPreference({ activity_name: "", level: 1 });
      onRefresh();
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

  const handleUpdate = async (id: string) => {
    try {
      const validatedData = updatePreferenceSchema.parse(editedPreference);
      setIsSubmitting(true);
      
      const response = await fetch(`/api/preferences?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update preference");
      }

      toast.success("Zaktualizowano preferencję");
      setEditingId(null);
      onRefresh();
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

  const handleDelete = async () => {
    if (!preferenceToDeleteId) return;

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/preferences?id=${preferenceToDeleteId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete preference");
      }

      toast.success("Usunięto preferencję");
      setPreferenceToDeleteId(null);
      onRefresh();
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

  const startEditing = (preference: PreferenceDTO) => {
    setEditedPreference({
      activity_name: preference.activity_name,
      level: preference.level
    });
    setEditingId(preference.id);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedPreference({ activity_name: "", level: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Lista istniejących preferencji */}
      {preferences.map(preference => (
        <Card key={preference.id}>
          <CardContent className="pt-6">
            {editingId === preference.id ? (
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`edit-activity-${preference.id}`}>Aktywność</Label>
                  <Input
                    id={`edit-activity-${preference.id}`}
                    value={editedPreference.activity_name}
                    onChange={(e) => setEditedPreference(prev => ({ ...prev, activity_name: e.target.value }))}
                    placeholder="np. bieganie, pływanie, jazda na rowerze"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit-level-${preference.id}`}>Poziom zaawansowania</Label>
                  <Input
                    id={`edit-level-${preference.id}`}
                    type="number"
                    min={1}
                    max={5}
                    value={editedPreference.level}
                    onChange={(e) => setEditedPreference(prev => ({ ...prev, level: parseInt(e.target.value, 10) }))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    onClick={() => handleUpdate(preference.id)}
                    disabled={isSubmitting || !validateEditedPreference()}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Zapisz
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Anuluj
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{preference.activity_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Poziom zaawansowania: {preference.level}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(preference)}
                    disabled={isSubmitting || editingId !== null}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edytuj</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreferenceToDeleteId(preference.id)}
                    disabled={isSubmitting || editingId !== null}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Usuń</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Formularz dodawania nowej preferencji */}
      <Card>
        <CardHeader>
          <CardTitle>Dodaj nową preferencję</CardTitle>
          <CardDescription>
            Określ swoją ulubioną aktywność fizyczną i poziom zaawansowania
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-activity">Aktywność</Label>
              <Input
                id="new-activity"
                value={newPreference.activity_name}
                onChange={(e) => setNewPreference(prev => ({ ...prev, activity_name: e.target.value }))}
                placeholder="np. bieganie, pływanie, jazda na rowerze"
                disabled={isSubmitting || editingId !== null}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-level">Poziom zaawansowania (1-5)</Label>
              <Input
                id="new-level"
                type="number"
                min={1}
                max={5}
                value={newPreference.level}
                onChange={(e) => setNewPreference(prev => ({ ...prev, level: parseInt(e.target.value, 10) }))}
                disabled={isSubmitting || editingId !== null}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting || editingId !== null || !validateNewPreference()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Dodaj preferencję
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Modal potwierdzenia usunięcia */}
      <Dialog open={preferenceToDeleteId !== null} onOpenChange={() => setPreferenceToDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń preferencję</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć tę preferencję? Tej operacji nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setPreferenceToDeleteId(null)}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Usuwanie..." : "Usuń"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}