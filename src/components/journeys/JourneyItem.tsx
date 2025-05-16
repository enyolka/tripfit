import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { CalendarIcon, NavigationIcon, Trash2Icon } from "lucide-react";
import type { JourneyDTO } from "../../types";

interface JourneyItemProps {
    journey: JourneyDTO;
    onDelete: (id: number) => void;
}

export function JourneyItem({ journey, onDelete }: JourneyItemProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };
    return (
        <Card
            className="hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-900/20"
            data-testid={`journey-item-${journey.id}`}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-slate-100 dark:border-slate-800/20">
                <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                    <NavigationIcon className="h-4 w-4 text-slate-400" />

                    <a href={`/journeys/${journey.id}`} className="hover:text-primary transition-colors">
                        {journey.destination}
                    </a>
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-slate-100 hover:text-slate-600 rounded-full h-8 w-8 p-0 dark:hover:bg-slate-800/30"
                    onClick={(e) => {
                        e.preventDefault();
                        onDelete(journey.id);
                    }}
                >
                    <span className="sr-only">Delete journey</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-red-500"
                    >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </Button>
            </CardHeader>
            <CardContent className="pt-2">
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" />
                    <p>
                        {formatDate(journey.departure_date)} - {formatDate(journey.return_date)}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
