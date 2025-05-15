import { Card, CardContent } from "../../ui/card";
import { PlanItem } from "./PlanItem";
import { Spinner } from "../../ui/spinner";
import type { GenerationDTO } from "../../../types";

interface GeneratedPlansListProps {
    plans: GenerationDTO[];
    isLoading: boolean;
    onUpdatePlan: (id: number, editedText: string) => Promise<void>;
    onDeleteRequest: (id: number) => void;
    isUpdatingPlan: number | null;
}

export function GeneratedPlansList({
    plans,
    isLoading,
    onUpdatePlan,
    onDeleteRequest,
    isUpdatingPlan,
}: GeneratedPlansListProps) {
    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex justify-center items-center min-h-[200px]">
                    <Spinner className="h-8 w-8" />
                </CardContent>
            </Card>
        );
    }

    if (plans.length === 0) {
        return (
            <Card>
                <CardContent className="flex justify-center items-center min-h-[200px] text-muted-foreground">
                    <p>No generated plans yet. Click &apos;Generate Travel Plan&apos; to create one.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Generated Plans</h2>
            <div className="space-y-4">
                {plans.map((plan) => (
                    <PlanItem
                        key={plan.id}
                        plan={plan}
                        onUpdate={(editedText) => onUpdatePlan(plan.id, editedText)}
                        onDeleteRequest={() => onDeleteRequest(plan.id)}
                        isUpdating={isUpdatingPlan === plan.id}
                    />
                ))}
            </div>
        </div>
    );
}
