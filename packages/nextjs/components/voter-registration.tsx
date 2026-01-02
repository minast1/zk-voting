import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { AlertCircle, CheckCircle, Eye, EyeOff, Shield } from "lucide-react";
import { VoterIdentity, getAllowedVoters, hashVoterId, isVoterAllowed, registerVoter } from "~~/lib/voting";

interface VoterRegistrationProps {
  onRegister: (identity: VoterIdentity) => void;
}

export function VoterRegistration({ onRegister }: VoterRegistrationProps) {
  const [uniqueId, setUniqueId] = useState("");
  const [showId, setShowId] = useState(false);
  const [error, setError] = useState("");
  const [previewHash, setPreviewHash] = useState("");

  const handleIdChange = (value: string) => {
    setUniqueId(value);
    setError("");
    if (value.length >= 3) {
      setPreviewHash(hashVoterId(value));
    } else {
      setPreviewHash("");
    }
  };

  const handleRegister = () => {
    if (uniqueId.length < 6) {
      setError("Please enter at least 6 characters for your unique identifier");
      return;
    }

    // Check if allowed voters list exists and if this voter is on it
    const allowedVoters = getAllowedVoters();
    if (allowedVoters.length > 0 && !isVoterAllowed(uniqueId)) {
      setError("You are not on the allowed voters list. Contact an administrator.");
      return;
    }

    const identity = registerVoter(uniqueId);
    onRegister(identity);
  };

  return (
    <Card className="glass-card border-primary/20 animate-scale-in max-w-md mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center animate-float">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl gradient-text">Register to Vote</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter a unique identifier to prove your eligibility. Your identity will be hashed to ensure privacy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Unique Identifier</label>
          <div className="relative">
            <Input
              type={showId ? "text" : "password"}
              placeholder="e.g., email, national ID, passport number..."
              value={uniqueId}
              onChange={e => handleIdChange(e.target.value)}
              className="pr-10 bg-secondary/50 border-border focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowId(!showId)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        {previewHash && (
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Your anonymous voter ID:</p>
            <p className="font-mono text-sm text-primary break-all">{previewHash}</p>
          </div>
        )}

        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
          <div className="flex gap-2">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="text-success font-medium mb-1">Privacy Guaranteed</p>
              <p>Your identifier is never stored. Only a cryptographic hash is used to verify your eligibility.</p>
            </div>
          </div>
        </div>

        <Button onClick={handleRegister} className="w-full" size="lg" disabled={uniqueId.length < 6}>
          Register & Start Voting
        </Button>
      </CardContent>
    </Card>
  );
}
