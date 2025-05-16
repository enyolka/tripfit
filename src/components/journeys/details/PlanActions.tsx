import { Button } from "../../ui/button";
import { Spinner } from "../../ui/spinner";

interface PlanActionsProps {
    isEditing: boolean;
    isSaving: boolean;
    canSave: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onDelete: () => void;
}

export function PlanActions({ isEditing, isSaving, canSave, onEdit, onSave, onCancel, onDelete }: PlanActionsProps) {
    if (isEditing) {
        return (
            <div className="flex items-center gap-2" role="toolbar" aria-label="Edit plan actions">
                <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving} aria-label="Cancel editing">
                    Cancel
                </Button>
                <Button
                    size="sm"
                    onClick={onSave}
                    disabled={!canSave || isSaving}
                    aria-label="Save plan"
                    aria-busy={isSaving}
                    aria-disabled={!canSave || isSaving}
                    className="bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md hover:shadow-lg"
                >
                    {isSaving ? (
                        <>
                            <Spinner className="mr-2 h-4 w-4" aria-hidden="true" />
                            <span>Saving...</span>
                            <span className="sr-only">Please wait while the plan is being saved</span>
                        </>
                    ) : (
                        "Save"
                    )}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2" role="toolbar" aria-label="Plan actions">
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0" aria-label="Edit plan">
                <span className="sr-only">Edit plan</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                </svg>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                aria-label="Delete plan"
            >
                <span className="sr-only">Delete plan</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
            </Button>
        </div>
    );
}
