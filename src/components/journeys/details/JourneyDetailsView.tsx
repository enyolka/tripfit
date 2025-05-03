import { useJourneyDetails } from '../../hooks/useJourneyDetails';
import { Spinner } from '../../ui/spinner';
import { Alert, AlertDescription } from '../../ui/alert';
import { JourneyInfoSection } from './JourneyInfoSection';
import { AdditionalNotesSection } from './AdditionalNotesSection';
import { PlanGenerationSection } from './PlanGenerationSection';
import { GeneratedPlansList } from './GeneratedPlansList';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import type { UpdateJourneyCommand } from '../../../types';

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

  const handlePlanDelete = async () => {
    if (planToDeleteId === null) return;
    await deletePlan(planToDeleteId);
  };

  // Loading state
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

  // Error state
  if (error || !journey) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertDescription>
          {error || 'Journey not found'}
        </AlertDescription>
      </Alert>
    );
  }

  const handleJourneyUpdate = async (data: UpdateJourneyCommand) => {
    try {
      await updateJourney(data);
    } catch (err) {
      // Error will be handled by the hook and displayed in the UI
      console.error('Failed to update journey:', err);
    }
  };

  return (
    <main className="space-y-8" role="main" aria-labelledby="page-title">
      <h1 id="page-title" className="sr-only">Journey Details</h1>
      
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

      <PlanGenerationSection
        onGeneratePlan={generatePlan}
        isGenerating={isGeneratingPlan}
      />

      <GeneratedPlansList
        plans={generations}
        isLoading={isLoadingGenerations}
        onUpdatePlan={updatePlan}
        onDeleteRequest={requestDeletePlan}
        isUpdatingPlan={isUpdatingPlan}
      />

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