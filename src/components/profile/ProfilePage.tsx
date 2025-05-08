import { useState, useEffect } from "react";
import type { PreferenceDTO } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import PreferencesForm from "./PreferencesForm.tsx";
import UserInfoForm from "./UserInfoForm.tsx";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<PreferenceDTO | null>(null);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/preferences");
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          // Brak preferencji to nie jest błąd - ustawiamy null
          setPreferences(null);
          return;
        }
        // Dla innych błędów HTTP rzucamy wyjątek
        throw new Error(data.error || "Failed to fetch preferences");
      }
      
      setPreferences(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error("Błąd", {
        description: message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <UserInfoForm />
      <Card>
        <CardHeader>
          <CardTitle>Preferencje aktywności</CardTitle>
          {!preferences && (
            <CardDescription>
              Nie dodano jeszcze żadnych preferencji. Wypełnij poniższy formularz, aby określić swoje preferencje aktywności.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <PreferencesForm preferences={preferences} onUpdate={fetchPreferences} />
        </CardContent>
      </Card>
    </div>
  );
}