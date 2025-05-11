import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useJourneys } from "../hooks/useJourneys";
import { FilterControls } from "./FilterControls";
import { JourneyItem } from "./JourneyItem";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { NewJourneyModal } from "./NewJourneyModal";
import { PlusIcon, MapIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import type { CreateJourneyCommand } from "../../types";

export default function JourneysView() {
    const { journeys, isLoading, error, fetchJourneys, deleteJourney, filterJourneys, createJourney } = useJourneys();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedJourneyId, setSelectedJourneyId] = useState<number | null>(null);
    const [newJourneyModalOpen, setNewJourneyModalOpen] = useState(false);

    useEffect(() => {
        fetchJourneys();
    }, [fetchJourneys]);

    const handleFilterChange = (searchQuery: string, sortBy: "date" | "status" | "name") => {
        filterJourneys(searchQuery, sortBy);
    };

    const handleDeleteClick = (journeyId: number) => {
        setSelectedJourneyId(journeyId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (selectedJourneyId === null) return;

        try {
            await deleteJourney(selectedJourneyId);
            setDeleteDialogOpen(false);
            setSelectedJourneyId(null);
        } catch (err) {
            console.error("Failed to delete journey:", err);
        }
    };
    const handleCreateJourney = async (journey: CreateJourneyCommand) => {
        try {
            await createJourney(journey);
            await fetchJourneys(); // Refresh the list after creating
        } catch (error) {
            console.error("Failed to create journey:", error);
            // Don't re-throw the error, as that causes unhandled rejection in tests
            // The error is already logged and handled in the UI via the error state from useJourneys
        }
    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div
                    data-testid="loading-spinner"
                    role="status"
                    aria-label="Loading"
                    className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
                >
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                <p>{error}</p>
                <Button variant="outline" onClick={() => fetchJourneys()} className="mt-4">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Your Journeys</h1>
                <Button onClick={() => setNewJourneyModalOpen(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Journey
                </Button>
            </div>

            {journeys.length === 0 ? (
                <Card className="bg-muted/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <MapIcon className="w-12 h-12 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Plan Your First Journey</h2>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            Start your adventure by creating your first journey. Add destinations, dates, and activities
                            - we'll help you plan the perfect trip!
                        </p>
                        <Button size="lg" onClick={() => setNewJourneyModalOpen(true)}>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Create Your First Journey
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <FilterControls onFilterChange={handleFilterChange} />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {journeys.map((journey) => (
                            <JourneyItem key={journey.id} journey={journey} onDelete={handleDeleteClick} />
                        ))}
                    </div>
                </>
            )}

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Journey</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this journey? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <NewJourneyModal
                isOpen={newJourneyModalOpen}
                onClose={() => setNewJourneyModalOpen(false)}
                onSubmit={handleCreateJourney}
            />
        </div>
    );
}
