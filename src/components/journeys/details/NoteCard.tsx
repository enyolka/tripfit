import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, Save, X, Trash2 } from "lucide-react";

interface NoteCardProps {
  note: string;
  index: number;
  onUpdate: (index: number, newNote: string) => void;
  onDelete: (index: number) => void;
  isUpdating: boolean;
}

export function NoteCard({ note, index, onUpdate, onDelete, isUpdating }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(note);

  const handleSave = () => {
    if (editedNote.trim()) {
      onUpdate(index, editedNote);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedNote(note);
    setIsEditing(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <h4 className="text-sm font-medium">Notatka {index + 1}</h4>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                disabled={!editedNote.trim() || isUpdating}
                className="h-8 w-8"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={isUpdating}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                disabled={isUpdating}
                className="h-8 w-8"
              >
                <PenLine className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(index)}
                disabled={isUpdating}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editedNote}
            onChange={(e) => setEditedNote(e.target.value)}
            placeholder="Wprowadź tekst notatki..."
            className="min-h-[100px]"
            disabled={isUpdating}
          />
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {note}
          </p>
        )}
      </CardContent>
    </Card>
  );
}