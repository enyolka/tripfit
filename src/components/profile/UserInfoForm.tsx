import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export default function UserInfoForm() {
    const [user, setUser] = useState<{ email: string } | null>(null);

    useEffect(() => {
        // In the future, we can add retrieval of additional user data
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
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your basic user information</CardDescription>
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
