import { Button } from '../../ui/button';
import { Spinner } from '../../ui/spinner';

interface GeneratePlanButtonProps {
  onGeneratePlan: () => Promise<void>;
  isLoading: boolean;
}

export function GeneratePlanButton({ onGeneratePlan, isLoading }: GeneratePlanButtonProps) {
  const handleClick = async () => {
    try {
      await onGeneratePlan();
    } catch (error) {
      console.error('Failed to generate plan:', error);
    }
  };
  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      size="lg"
      className="w-full"
      aria-busy={isLoading}
      aria-disabled={isLoading}
      aria-live="polite"
    >
      {isLoading ? (
        <>
          <Spinner className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Generating Plan...</span>
          <span className="sr-only">Please wait while your travel plan is being generated</span>
        </>
      ) : (
        'Generate Travel Plan'
      )}
    </Button>
  );
}