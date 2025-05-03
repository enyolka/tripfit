import { Button } from '../../ui/button';

interface AddNoteButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function AddNoteButton({ onClick, disabled }: AddNoteButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
    >
      + Add Note
    </Button>
  );
}