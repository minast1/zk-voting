import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { UserPlus } from "lucide-react";
import { addAllowedVoter, isVoterAllowed } from "~~/lib/voting";

export function AddVoterDialog() {
  const [open, setOpen] = useState(false);
  const [voterId, setVoterId] = useState("");

  const handleAddVoter = () => {
    if (voterId.trim().length < 4) {
      // toast.error('Voter ID must be at least 4 characters');
      return;
    }

    if (isVoterAllowed(voterId.trim())) {
      //  toast.error('This voter is already on the allowed list');
      return;
    }

    addAllowedVoter(voterId.trim());
    // toast.success('Voter added to allowed list');
    setVoterId("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Voter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Allowed Voter</DialogTitle>
          <DialogDescription>
            Add a voter&apos;s unique identifier to the allowed list. Only allowed voters can register and vote.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="voter-id">Voter Identifier</Label>
            <Input
              id="voter-id"
              placeholder="Enter unique voter ID..."
              value={voterId}
              onChange={e => setVoterId(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddVoter()}
            />
            <p className="text-xs text-muted-foreground">This should match the ID the voter will use to register.</p>
          </div>
          <Button onClick={handleAddVoter} className="w-full">
            Add to Allowed List
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
