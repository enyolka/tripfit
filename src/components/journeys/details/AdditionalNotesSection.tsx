import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { AddNoteButton } from './AddNoteButton';
import { NoteCard } from './NoteCard';

interface AdditionalNotesSectionProps {
  notes: string[];
  onNotesChange: (notes: string[]) => void;
  isUpdating: boolean;
}

export function AdditionalNotesSection({ notes, onNotesChange, isUpdating }: AdditionalNotesSectionProps) {
  const handleNoteUpdate = (index: number, newNote: string) => {
    const updatedNotes = notes.map((note, i) => i === index ? newNote : note);
    onNotesChange(updatedNotes);
  };

  const handleNoteDelete = (index: number) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    onNotesChange(updatedNotes);
  };

  const handleAddNote = () => {
    onNotesChange([...notes, '']);
  };

  return (
    <section aria-labelledby="notes-section-title">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="notes-section-title" className="text-xl font-semibold">Additional Notes</CardTitle>
          <AddNoteButton onClick={handleAddNote} disabled={isUpdating} />
        </CardHeader>
        <CardContent>
          <div role="feed" aria-label="Journey notes" className="space-y-4">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground" role="status">
                No notes yet. Click "Add Note" to create one.
              </p>
            ) : (
              notes.map((note, index) => (
                <NoteCard
                  key={index}
                  note={note}
                  index={index}
                  onUpdate={handleNoteUpdate}
                  onDelete={handleNoteDelete}
                  isUpdating={isUpdating}
                  aria-posinset={index + 1}
                  aria-setsize={notes.length}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}