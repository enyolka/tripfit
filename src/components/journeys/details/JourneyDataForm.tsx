import { useState, useEffect } from 'react';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import type { UpdateJourneyCommand, PreferenceDTO } from '../../../types';
import { toast } from 'sonner';

interface ActivityWithLevel {
  name: string;
  level: number;
}

interface JourneyDataFormProps {
  initialData: UpdateJourneyCommand;
  onFormChange: (field: string, value: any) => void;
}

export function JourneyDataForm({ initialData, onFormChange }: JourneyDataFormProps) {
  // Parse initial activities string to get activities with levels
  const [activities, setActivities] = useState<ActivityWithLevel[]>(() => {
    if (!initialData.activities) return [];
    return initialData.activities.split(',').map(activity => {
      const [name, levelPart] = activity.split(' - poziom ');
      return {
        name: name.trim(),
        level: parseInt(levelPart?.trim() || '1', 10) || 1
      };
    });
  });

  const [userPreferences, setUserPreferences] = useState<PreferenceDTO[]>([]);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const response = await fetch('/api/preferences');
        if (!response.ok) throw new Error('Failed to fetch preferences');
        const data = await response.json();
        setUserPreferences(data);
      } catch (err) {
        console.error('Error fetching preferences:', err);
        toast.error('Could not load your activity preferences');
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    fetchUserPreferences();
  }, []);

  useEffect(() => {
    // When preferences are loaded and no activities are set, initialize with user preferences
    if (!isLoadingPreferences && userPreferences.length > 0 && activities.length === 0) {
      const preferencesAsActivities = userPreferences.map(pref => ({
        name: pref.activity_name,
        level: pref.level
      }));
      updateActivities(preferencesAsActivities);
    }
  }, [isLoadingPreferences, userPreferences]);

  const updateActivities = (newActivities: ActivityWithLevel[]) => {
    setActivities(newActivities);
    // Convert activities to string format for API
    const activitiesString = newActivities
      .map(activity => `${activity.name} - poziom ${activity.level}`)
      .join(', ');
    onFormChange('activities', activitiesString || null);
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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="destination" className="text-sm font-medium">
          Destination
        </label>
        <Input
          id="destination"
          value={initialData.destination || ''}
          onChange={(e) => onFormChange('destination', e.target.value)}
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
            value={initialData.departure_date || ''}
            onChange={(e) => onFormChange('departure_date', e.target.value)}
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
            value={initialData.return_date || ''}
            onChange={(e) => onFormChange('return_date', e.target.value)}
            required
            min={initialData.departure_date || '2024-01-01'}
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
    </div>
  );
}