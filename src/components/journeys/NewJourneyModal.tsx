import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { CreateJourneyCommand } from '../../types';

interface NewJourneyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (journey: CreateJourneyCommand) => Promise<void>;
}

export function NewJourneyModal({ isOpen, onClose, onSubmit }: NewJourneyModalProps) {
    const [formData, setFormData] = useState<Partial<CreateJourneyCommand>>({
        destination: '',
        departure_date: '',
        return_date: '',
        additional_notes: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.destination || !formData.departure_date || !formData.return_date) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData as CreateJourneyCommand);
            onClose();
        } catch (error) {
            console.error('Failed to create journey:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Journey</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="destination" className="text-sm font-medium">
                            Destination
                        </label>
                        <Input
                            id="destination"
                            value={formData.destination || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                            placeholder="Enter destination"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="departure_date" className="text-sm font-medium">
                            Departure Date
                        </label>
                        <Input
                            id="departure_date"
                            type="date"
                            value={formData.departure_date || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, departure_date: e.target.value }))}
                            required
                            min="2024-01-01" // Set reasonable min date
                            pattern="\d{4}-\d{2}-\d{2}"
                            aria-label="Departure date in YYYY-MM-DD format"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="return_date" className="text-sm font-medium">
                            Return Date
                        </label>
                        <Input
                            id="return_date"
                            type="date"
                            value={formData.return_date || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, return_date: e.target.value }))}
                            required
                            min={formData.departure_date || '2024-01-01'} // Can't be before departure
                            pattern="\d{4}-\d{2}-\d{2}"
                            aria-label="Return date in YYYY-MM-DD format"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Journey'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}