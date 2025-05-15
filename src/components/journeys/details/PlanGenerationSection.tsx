import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../ui/card";
import { GeneratePlanButton } from "./GeneratePlanButton";

interface PlanGenerationSectionProps {
    onGeneratePlan: () => Promise<void>;
    isGenerating: boolean;
}

export function PlanGenerationSection({ onGeneratePlan, isGenerating }: PlanGenerationSectionProps) {
    return (
        <section aria-labelledby="plan-generation-title">
            <Card>
                <CardHeader>
                    <CardTitle id="plan-generation-title" className="text-xl font-semibold">
                        Plan Generation
                    </CardTitle>
                    <CardDescription>
                        Generate a customized travel plan based on your journey details and preferences.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div aria-live="polite">
                        <GeneratePlanButton onGeneratePlan={onGeneratePlan} isLoading={isGenerating} />
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
