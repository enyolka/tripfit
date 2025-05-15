import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { AddNoteButton } from "./AddNoteButton";
import { NoteCard } from "./NoteCard";

interface AdditionalNotesSectionProps {
    notes: string[];
    onNotesChange: (notes: string[]) => void;
    isUpdating: boolean;
}

export function AdditionalNotesSection({ notes, onNotesChange, isUpdating }: AdditionalNotesSectionProps) {
    const handleNoteUpdate = (index: number, newNote: string) => {
        const updatedNotes = notes.map((note, i) => (i === index ? newNote : note));
        onNotesChange(updatedNotes);
    };

    const handleNoteDelete = (index: number) => {
        const updatedNotes = notes.filter((_, i) => i !== index);
        onNotesChange(updatedNotes);
    };

    const handleAddNote = () => {
        onNotesChange([...notes, ""]);
    };

    return (
        <section aria-labelledby="notes-section-title">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle id="notes-section-title" className="text-xl font-semibold">
                        Additional Notes
                    </CardTitle>
                    <AddNoteButton onClick={handleAddNote} disabled={isUpdating} />
                </CardHeader>
                <CardContent>
                    <div role="feed" aria-label="Journey notes">
                        {notes.length === 0 ? (
                            <p className="text-sm text-muted-foreground" role="status">
                                No notes yet. Click &quot;Add Note&quot; to create one.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {notes.map((note, index) => (
                                    <NoteCard
                                        key={index}
                                        note={note}
                                        index={index}
                                        onUpdate={handleNoteUpdate}
                                        onDelete={handleNoteDelete}
                                        isUpdating={isUpdating}
                                        initialIsEditing={note === ""}
                                        aria-posinset={index + 1}
                                        aria-setsize={notes.length}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
