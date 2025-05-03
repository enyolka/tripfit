import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { CreateJourneyCommand } from '../../types';

interface ActivityWithLevel {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
}

const DIFFICULTY_LEVELS = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
] as const;

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
        activities: null,
        additional_notes: []
    });
    const [activities, setActivities] = useState<ActivityWithLevel[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateActivities = (newActivities: ActivityWithLevel[]) => {
        setActivities(newActivities);
        // Convert activities to string format for API
        const activitiesString = newActivities
            .map(activity => `${activity.name} - poziom ${activity.level}`)
            .join(', ');
        setFormData(prev => ({ ...prev, activities: activitiesString || null }));
    };

    const handleAddActivity = () => {
        updateActivities([...activities, { name: '', level: 'beginner' }]);
    };

    const handleRemoveActivity = (index: number) => {
        const newActivities = activities.filter((_, i) => i !== index);
        updateActivities(newActivities);
    };

    const handleActivityChange = (index: number, field: keyof ActivityWithLevel, value: string) => {
        const newActivities = activities.map((activity, i) => {
            if (i === index) {
                return {
                    ...activity,
                    [field]: value
                };
            }
            return activity;
        });
        updateActivities(newActivities);
    };

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
                    <div className="grid grid-cols-2 gap-4">
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
                                min="2024-01-01"
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
                                min={formData.departure_date || '2024-01-01'}
                                pattern="\d{4}-\d{2}-\d{2}"
                                aria-label="Return date in YYYY-MM-DD format"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">Activities</label>
                            <button
                                type="button"
                                onClick={handleAddActivity}
                                className="text-sm text-primary hover:underline"
                            >
                                + Add Activity
                            </button>
                        </div>
                        <div className="space-y-3">
                            {activities.map((activity, index) => (
                                <div key={index} className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <Input
                                            value={activity.name}
                                            onChange={(e) => handleActivityChange(index, 'name', e.target.value)}
                                            placeholder="Enter activity"
                                        />
                                    </div>
                                    <div className="w-48">
                                        <Select
                                            value={activity.level}
                                            onValueChange={(value) => handleActivityChange(index, 'level', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DIFFICULTY_LEVELS.map(level => (
                                                    <SelectItem key={level.value} value={level.value}>
                                                        {level.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveActivity(index)}
                                        className="text-destructive hover:text-destructive/80 p-2"
                                        aria-label="Remove activity"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <p className="text-sm text-muted-foreground">No activities added. Click "Add Activity" to start.</p>
                            )}
                        </div>
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