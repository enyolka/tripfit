import { Button } from "../../ui/button";
import { Spinner } from "../../ui/spinner";

interface GeneratePlanButtonProps {
    onGeneratePlan: () => Promise<void>;
    isLoading: boolean;
}

export function GeneratePlanButton({ onGeneratePlan, isLoading }: GeneratePlanButtonProps) {
    const handleClick = async () => {
        try {
            await onGeneratePlan();
        } catch (error) {
            console.error("Failed to generate plan:", error);
        }
    };
    return (
        <Button
            onClick={handleClick}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white shadow-md hover:shadow-lg transition-all duration-300 w-full"
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
                "Generate Travel Plan"
            )}
        </Button>
    );
}
