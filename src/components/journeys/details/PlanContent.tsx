import { useId } from "react";
import { Textarea } from "../../ui/textarea";

interface PlanContentProps {
    text: string;
    isEditing: boolean;
    onChange: (text: string) => void;
    isDisabled: boolean;
}

export function PlanContent({ text, isEditing, onChange, isDisabled }: PlanContentProps) {
    const textareaId = useId();

    if (isEditing) {
        return (
            <div role="form" aria-label="Edit travel plan">
                <Textarea
                    id={textareaId}
                    value={text}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={isDisabled}
                    placeholder="Enter your edited plan text"
                    className="min-h-[200px] resize-none"
                    aria-label="Plan content"
                    aria-required="true"
                    aria-invalid={text.trim().length === 0}
                />
            </div>
        );
    }

    return (
        <div className="whitespace-pre-wrap prose prose-sm max-w-none" role="article" aria-label="Travel plan content">
            {text}
        </div>
    );
}
