import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import type { CreateJourneyCommand, PreferenceDTO } from '../../types';

interface ActivityWithLevel {
  name: string;
  level: number;
}

interface NewJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJourneyCommand) => Promise<void>;
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
  const [userPreferences, setUserPreferences] = useState<PreferenceDTO[]>([]);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const response = await fetch('/api/preferences');
        if (!response.ok) throw new Error('Failed to fetch preferences');
        const data = await response.json();
        setUserPreferences(data);
        // Automatically add user preferences as activities
        const preferencesAsActivities = data.map((pref: PreferenceDTO) => ({
          name: pref.activity_name,
          level: pref.level
        }));
        updateActivities(preferencesAsActivities);
      } catch (err) {
        console.error('Error fetching preferences:', err);
        toast.error('Could not load your activity preferences');
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    if (isOpen) {
      fetchUserPreferences();
    }
  }, [isOpen]);

  const updateActivities = (newActivities: ActivityWithLevel[]) => {
    setActivities(newActivities);
    // Convert activities to string format for API
    const activitiesString = newActivities
      .map(activity => `${activity.name} - poziom ${activity.level}`)
      .join(', ');
    setFormData(prev => ({ ...prev, activities: activitiesString || null }));
  };

  const handleAddActivity = () => {
    updateActivities([...activities, { name: '', level: 1 }]);
  };

  const handleRemoveActivity = (index: number) => {
    const newActivities = activities.filter((_, i) => i !== index);
    updateActivities(newActivities);
  };

  const handleActivityChange = (index: number, field: keyof ActivityWithLevel, value: string | number) => {
    const newActivities = activities.map((activity, i) => {
      if (i === index) {
        return {
          ...activity,
          [field]: field === 'level' ? Number(value) : value
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
                  <div className="w-32">
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={activity.level}
                      onChange={(e) => handleActivityChange(index, 'level', e.target.value)}
                      placeholder="Level 1-5"
                    />
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
              {activities.length === 0 && !isLoadingPreferences && (
                <p className="text-sm text-muted-foreground">No activities added. Click "Add Activity" to start.</p>
              )}
              {isLoadingPreferences && (
                <p className="text-sm text-muted-foreground">Loading your activity preferences...</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Create Journey
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}