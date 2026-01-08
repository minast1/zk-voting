import { Plus, Vote } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center animate-float">
        <Vote className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Active Polls</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Be the first to create a poll! Click the &quot;Create Poll&quot; button to get started.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Plus className="w-4 h-4" />
        <span>Your polls will appear here</span>
      </div>
    </div>
  );
}
