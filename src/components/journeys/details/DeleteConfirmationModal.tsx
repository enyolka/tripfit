import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Spinner } from "../../ui/spinner";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isDeleting: boolean;
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, isDeleting }: DeleteConfirmationModalProps) {
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const deleteButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Focus the cancel button when modal opens
            cancelButtonRef.current?.focus();
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        try {
            await onConfirm();
        } catch (error) {
            console.error("Failed to delete plan:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent onEscapeKeyDown={onClose} onPointerDownOutside={onClose} className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Plan</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this travel plan? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                        ref={cancelButtonRef}
                        aria-label="Cancel deletion"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        ref={deleteButtonRef}
                        aria-label="Confirm deletion"
                        aria-busy={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Spinner className="mr-2 h-4 w-4" aria-hidden="true" />
                                <span>Deleting...</span>
                            </>
                        ) : (
                            "Delete Plan"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
