import { useJourneyDetails } from "../../hooks/useJourneyDetails";
import { Spinner } from "../../ui/spinner";
import { Alert, AlertDescription } from "../../ui/alert";
import { Button } from "../../ui/button";
import { ArrowLeft } from "lucide-react";
import { JourneyInfoSection } from "./JourneyInfoSection";
import { AdditionalNotesSection } from "./AdditionalNotesSection";
import { PlanGenerationSection } from "./PlanGenerationSection";
import { GeneratedPlansList } from "./GeneratedPlansList";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import type { UpdateJourneyCommand } from "../../../types";
import { toast } from "sonner";
import { useEffect } from "react";

interface JourneyDetailsViewProps {
    journeyId: number;
}

export default function JourneyDetailsView({ journeyId }: JourneyDetailsViewProps) {
    const {
        journey,
        generations,
        isLoadingJourney,
        isLoadingGenerations,
        isGeneratingPlan,
        isUpdatingJourney,
        isUpdatingPlan,
        isDeletingPlan,
        planToDeleteId,
        error,
        updateJourney,
        generatePlan,
        updatePlan,
        deletePlan,
        requestDeletePlan,
        cancelDeletePlan,
    } = useJourneyDetails(journeyId);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handlePlanDelete = async () => {
        if (planToDeleteId === null) return;
        await deletePlan(planToDeleteId);
    };

    if (isLoadingJourney) {
        return (
            <div
                className="flex justify-center items-center min-h-[400px]"
                role="status"
                aria-label="Loading journey details"
            >
                <Spinner className="h-8 w-8" aria-hidden="true" />
                <span className="sr-only">Loading journey details</span>
            </div>
        );
    }

    if (!journey) {
        return (
            <Alert variant="destructive" role="alert">
                <AlertDescription>Journey not found</AlertDescription>
            </Alert>
        );
    }

    const handleJourneyUpdate = async (data: UpdateJourneyCommand) => {
        try {
            await updateJourney(data);
        } catch (err) {
            console.error("Failed to update journey:", err);
        }
    };

    return (
        <main className="space-y-8 md:space-y-0" role="main" aria-labelledby="page-title">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => (window.location.href = "/journeys")}
                    className="inline-flex items-center gap-2"
                    aria-label="Back to journeys list"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Journeys
                </Button>
            </div>

            <h1 id="page-title" className="sr-only">
                Journey Details
            </h1>

            {/* Main two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Journey details and notes */}
                <div className="space-y-6">
                    <JourneyInfoSection
                        journeyData={journey}
                        onUpdateJourney={handleJourneyUpdate}
                        isUpdating={isUpdatingJourney}
                    />

                    <AdditionalNotesSection
                        notes={journey.additional_notes}
                        onNotesChange={(notes) => handleJourneyUpdate({ additional_notes: notes })}
                        isUpdating={isUpdatingJourney}
                    />
                </div>

                {/* Right column - Plan generation and generated plans */}
                <div className="space-y-6">
                    <PlanGenerationSection onGeneratePlan={generatePlan} isGenerating={isGeneratingPlan} />

                    <GeneratedPlansList
                        plans={generations}
                        isLoading={isLoadingGenerations}
                        onUpdatePlan={updatePlan}
                        onDeleteRequest={requestDeletePlan}
                        isUpdatingPlan={isUpdatingPlan}
                    />
                </div>
            </div>

            {planToDeleteId !== null && (
                <DeleteConfirmationModal
                    isOpen={planToDeleteId !== null}
                    onClose={cancelDeletePlan}
                    onConfirm={handlePlanDelete}
                    isDeleting={isDeletingPlan === planToDeleteId}
                />
            )}
        </main>
    );
}
