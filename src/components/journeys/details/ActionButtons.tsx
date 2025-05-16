import { Button } from "../../ui/button";
import { Spinner } from "../../ui/spinner";

interface ActionButtonsProps {
    isEditing: boolean;
    isSaving: boolean;
    canSave: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
}

export function ActionButtons({ isEditing, isSaving, canSave, onEdit, onSave, onCancel }: ActionButtonsProps) {
    if (isEditing) {
        return (
            <div className="flex items-center gap-2" role="toolbar" aria-label="Form actions">
                <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving} aria-label="Cancel editing">
                    Cancel
                </Button>
                <Button
                    size="sm"
                    onClick={onSave}
                    disabled={!canSave || isSaving}
                    aria-label="Save changes"
                    aria-busy={isSaving}
                    aria-disabled={!canSave || isSaving}
                    className="bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md hover:shadow-lg"
                >
                    {isSaving ? (
                        <>
                            <Spinner className="mr-2 h-4 w-4" aria-hidden="true" />
                            <span>Saving...</span>
                            <span className="sr-only">Please wait while changes are being saved</span>
                        </>
                    ) : (
                        "Save"
                    )}
                </Button>
            </div>
        );
    }

    return (
        <Button variant="outline" size="sm" onClick={onEdit} aria-label="Edit details">
            Edit
        </Button>
    );
}
