import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { JourneyDataForm } from './JourneyDataForm';
import { ActionButtons } from './ActionButtons';
import type { JourneyDTO, UpdateJourneyCommand } from '../../../types';

interface JourneyInfoSectionProps {
  journeyData: JourneyDTO;
  onUpdateJourney: (data: UpdateJourneyCommand) => Promise<void>;
  isUpdating: boolean;
}

export function JourneyInfoSection({ journeyData, onUpdateJourney, isUpdating }: JourneyInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateJourneyCommand>({
    destination: journeyData.destination,
    departure_date: journeyData.departure_date,
    return_date: journeyData.return_date,
    activities: journeyData.activities?.toString() || '',
  });

  const handleSave = async () => {
    try {
      await onUpdateJourney(formData);
      setIsEditing(false);
    } catch (error) {
      // Error will be handled by parent component
      console.error('Failed to save journey:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      destination: journeyData.destination,
      departure_date: journeyData.departure_date,
      return_date: journeyData.return_date,
      activities: journeyData.activities?.toString() || '',
    });
    setIsEditing(false);
  };

  const canSave = Boolean(
    formData.destination &&
    formData.departure_date &&
    formData.return_date &&
    new Date(formData.departure_date) <= new Date(formData.return_date)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section aria-labelledby="journey-details-heading">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="journey-details-heading" className="text-2xl font-bold">Journey Details</CardTitle>
          <ActionButtons
            isEditing={isEditing}
            isSaving={isUpdating}
            canSave={canSave}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <div role="form" aria-label="Edit journey details">
              <JourneyDataForm
                initialData={formData}
                onFormChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 id="destination-label" className="text-sm font-medium text-muted-foreground">Destination</h3>
                <p aria-labelledby="destination-label" className="text-lg">{journeyData.destination}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 id="departure-label" className="text-sm font-medium text-muted-foreground">Departure Date</h3>
                  <p aria-labelledby="departure-label">{formatDate(journeyData.departure_date)}</p>
                </div>
                <div>
                  <h3 id="return-label" className="text-sm font-medium text-muted-foreground">Return Date</h3>
                  <p aria-labelledby="return-label">{formatDate(journeyData.return_date)}</p>
                </div>
              </div>
              {journeyData.activities && typeof journeyData.activities === 'string' && (
                <div>
                  <h3 id="activities-label" className="text-sm font-medium text-muted-foreground">Activities</h3>
                  <p aria-labelledby="activities-label">{journeyData.activities}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}