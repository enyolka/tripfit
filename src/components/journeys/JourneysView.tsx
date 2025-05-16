import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useJourneys } from "../hooks/useJourneys";
import { FilterControls } from "./FilterControls";
import { JourneyItem } from "./JourneyItem";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { NewJourneyModal } from "./NewJourneyModal";
import { PlusIcon, MapIcon, GlobeIcon, RefreshCwIcon, AlertCircleIcon } from "lucide-react";
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
            <div className="flex flex-col justify-center items-center min-h-[400px] bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/10 dark:to-transparent rounded-lg p-8">
                <div
                    data-testid="loading-spinner"
                    role="status"
                    aria-label="Loading"
                    className="animate-spin h-12 w-12 border-4 border-slate-200 border-t-slate-400 border-r-slate-300 border-b-slate-300 rounded-full"
                >
                    <span className="sr-only">Loading...</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium">Loading your adventures...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div
                data-testid="error-message"
                className="bg-slate-50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800/30 rounded-lg p-6 text-center"
            >
                <AlertCircleIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-300 font-medium">{error}</p>
                <Button
                    variant="outline"
                    onClick={() => fetchJourneys()}
                    className="mt-6 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/20 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-sky-600 dark:from-teal-400 dark:to-sky-400 text-transparent bg-clip-text flex items-center">
                    <GlobeIcon className="h-8 w-8 mr-3 text-teal-500 dark:text-teal-400" />
                    Your Journeys
                </h1>
                <Button
                    data-testid="create-journey-button"
                    onClick={() => setNewJourneyModalOpen(true)}
                    className="bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Journey
                </Button>
            </div>

            {journeys.length === 0 ? (
                <Card className="bg-gradient-to-br from-sky-50 to-teal-50 dark:from-sky-900/10 dark:to-teal-900/10 border-none shadow-lg overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-teal-100/40 via-transparent to-sky-100/40 dark:from-teal-800/10 dark:to-sky-800/10 opacity-70" />
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center relative z-10">
                        <div className="p-4 bg-white dark:bg-sky-950/30 rounded-full shadow-inner mb-6">
                            <MapIcon className="w-16 h-16 text-teal-500 dark:text-teal-400" />
                        </div>
                        <h2 className="text-3xl font-semibold mb-3 text-sky-800 dark:text-sky-200">
                            Plan Your First Journey
                        </h2>
                        <p className="text-sky-600 dark:text-sky-300 mb-8 max-w-md leading-relaxed">
                            Start your adventure by creating your first journey. Add destinations, dates, and activities
                            - we&apos;ll help you plan the perfect trip!
                        </p>
                        <Button
                            size="lg"
                            onClick={() => setNewJourneyModalOpen(true)}
                            className="bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white font-medium px-8 py-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Create Your First Journey
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <FilterControls onFilterChange={handleFilterChange} />
                    <div data-testid="journeys-grid" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {journeys.map((journey) => (
                            <JourneyItem key={journey.id} journey={journey} onDelete={handleDeleteClick} />
                        ))}
                    </div>
                </>
            )}

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent data-testid="delete-confirmation-dialog">
                    <DialogHeader>
                        <DialogTitle className="text-sky-800 dark:text-sky-300 text-xl">Delete Journey</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this journey? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            data-testid="cancel-delete-button"
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-950/20"
                        >
                            Cancel
                        </Button>
                        <Button data-testid="confirm-delete-button" variant="destructive" onClick={handleDeleteConfirm}>
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
