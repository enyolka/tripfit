import { useState, useId } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { PlanContent } from './PlanContent';
import { PlanActions } from './PlanActions';
import type { GenerationDTO } from '../../../types';

interface PlanItemProps {
  plan: GenerationDTO;
  onUpdate: (editedText: string) => Promise<void>;
  onDeleteRequest: () => void;
  isUpdating: boolean;
}

export function PlanItem({
  plan,
  onUpdate,
  onDeleteRequest,
  isUpdating,
}: PlanItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(plan.edited_text || plan.generated_text);
  const headingId = useId();

  const handleSave = async () => {
    try {
      await onUpdate(editedText);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  const handleCancel = () => {
    setEditedText(plan.edited_text || plan.generated_text);
    setIsEditing(false);
  };

  const canSave = Boolean(editedText.trim()) && editedText !== (plan.edited_text || plan.generated_text);

  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card role="region" aria-labelledby={headingId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <div id={headingId} className="text-sm text-muted-foreground">
            <span>Generated on {formatDate(plan.created_at)}</span>
            {plan.edited_at && (
              <span className="block">
                Last edited on {formatDate(plan.edited_at)}
              </span>
            )}
          </div>
        </div>
        <PlanActions
          isEditing={isEditing}
          isSaving={isUpdating}
          canSave={canSave}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={onDeleteRequest}
        />
      </CardHeader>
      <CardContent>
        <div role="region" aria-label={isEditing ? "Edit travel plan" : "Travel plan content"}>
          <PlanContent
            text={editedText}
            isEditing={isEditing}
            onChange={setEditedText}
            isDisabled={isUpdating}
          />
        </div>
      </CardContent>
    </Card>
  );
}