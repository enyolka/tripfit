import { Button } from "@/components/ui/button";

interface SaveButtonProps {
  isSubmitting: boolean;
  label: string;
}

export default function SaveButton({ isSubmitting, label }: SaveButtonProps) {
  return (
    <Button type="submit" disabled={isSubmitting}>
      {label}
    </Button>
  );
}