import { useState } from 'react';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import type { UpdateJourneyCommand } from '../../../types';

interface ActivityWithLevel {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
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
      const [name, level] = activity.split(' - poziom ');
      return {
        name: name.trim(),
        level: (level?.trim() as ActivityWithLevel['level']) || 'beginner'
      };
    });
  });

  const updateActivities = (newActivities: ActivityWithLevel[]) => {
    setActivities(newActivities);
    // Convert activities to string format for API
    const activitiesString = newActivities
      .map(activity => `${activity.name} - poziom ${activity.level}`)
      .join(', ');
    onFormChange('activities', activitiesString || null);
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

  const difficultyLevels = [
    { value: 'beginner', label: 'Początkujący' },
    { value: 'intermediate', label: 'Średniozaawansowany' },
    { value: 'advanced', label: 'Zaawansowany' }
  ];

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
              <div className="w-48">
                <Select
                  value={activity.level}
                  onValueChange={(value) => handleActivityChange(index, 'level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map(level => (
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
    </div>
  );
}