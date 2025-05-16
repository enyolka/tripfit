import { useState, useEffect } from "react";
import type { PreferenceDTO } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import PreferencesForm from "./PreferencesForm";
import UserInfoForm from "./UserInfoForm";

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [preferences, setPreferences] = useState<PreferenceDTO[]>([]);

    const fetchPreferences = async () => {
        try {
            const response = await fetch("/api/preferences");
            if (!response.ok) {
                throw new Error("Failed to fetch preferences");
            }
            const data = await response.json();
            setPreferences(data);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : "An error occurred";
            setError(message);
            toast.error("Error", {
                description: message,
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-sky-600 dark:from-teal-400 dark:to-sky-400 text-transparent bg-clip-text flex items-center">
                Your Profile
            </h1>
            <UserInfoForm />
            <Card>
                <CardHeader>
                    <CardTitle>Activity Preferences</CardTitle>
                    {preferences.length === 0 && (
                        <CardDescription>
                            No preferences have been added yet. Fill out the form below to set your activity
                            preferences.
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <PreferencesForm preferences={preferences} onRefresh={fetchPreferences} />
                </CardContent>
            </Card>
        </div>
    );
}
