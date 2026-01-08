import { useState } from "react";
import { HelpCircle, Plus } from "lucide-react";
import { Button } from "~~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/components/ui/dialog";
import { Input } from "~~/components/ui/input";
import { Poll } from "~~/lib/voting";

interface CreatePollDialogProps {
  voterHash: string;
  onPollCreated: (poll: Poll) => void;
}

export function CreatePollDialog({}: CreatePollDialogProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");

  // const handleCreate = () => {
  //   if (question.trim().length < 10) {
  //     setError("Question must be at least 10 characters");
  //     return;
  //   }
  //   if (!question.includes("?")) {
  //     setError("Question must end with a question mark");
  //     return;
  //   }

  //   const poll = "Notinign for now";  //createPoll(question.trim(), voterHash);
  //   onPollCreated(poll);
  //   setQuestion("");
  //   setOpen(false);
  // };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Create Poll
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-text flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Create a New Poll
          </DialogTitle>
          <DialogDescription>Ask a Yes/No question that registered voters can answer anonymously.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Your Question</label>
            <Input
              placeholder="Should we implement feature X?"
              value={question}
              onChange={e => {
                setQuestion(e.target.value);
                setError("");
              }}
              className="bg-secondary/50 border-border focus:border-primary"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              //onClick={handleCreate}
              disabled={question.length < 10}
            >
              Create Poll
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
