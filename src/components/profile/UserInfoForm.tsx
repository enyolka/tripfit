import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export default function UserInfoForm() {
    const [user, setUser] = useState<{ email: string } | null>(null);

    useEffect(() => {
        // W przyszłości można dodać pobieranie dodatkowych danych użytkownika
        const currentUser = (window as any).Astro?.user;
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    if (!user) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dane podstawowe</CardTitle>
                <CardDescription>Twoje podstawowe dane użytkownika</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <div id="email" className="py-2 px-3 rounded-md bg-muted">
                            {user.email}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
