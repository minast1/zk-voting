import React, { useState } from "react";
import { CheckCircle2, Clock, Loader2, Send } from "lucide-react";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
//import { useScaffoldEventHistory } from '../../../../hooks/scaffold-eth/useScaffoldEventHistory';
import useVoterManagementLIst from "~~/hooks/useVoterManagementLIst";
import { notification } from "~~/utils/scaffold-eth";

type TProps = {
  status: "active" | "expired" | undefined;
  pollId: bigint | undefined;
};
const AllowlistStatusCard = ({ status, pollId }: TProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, getVoterStatus } = useVoterManagementLIst(pollId);
  const accessRequestStatus = getVoterStatus();
  const { writeContractAsync: requestAccess } = useScaffoldWriteContract({
    contractName: "Voting",
  });
  const handleSubmitRequest = async () => {
    setIsSubmitting(true);
    try {
      await requestAccess({
        args: [pollId],
        functionName: "requestAccess",
      });
    } catch (error) {
      notification.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(status);
  if (status === "active") {
    return (
      <Card className="glass-card border-success/30">
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="font-semibold text-success">{"You're on the Allowlist"}</p>
              <p className="text-sm text-muted-foreground">You can register and vote in active polls</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return null;
  }

  if (accessRequestStatus === "pending") {
    return (
      <Card className="glass-card border-warning/30">
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="font-semibold text-warning">Request Pending</p>
              <p className="text-sm text-muted-foreground">Your access request is awaiting admin approval</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // if (accessRequest?.status === "rejected") {
  //   return (
  //     <Card className="glass-card border-destructive/30">
  //       <CardContent className="py-6">
  //         <div className="flex items-center gap-3">
  //           <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
  //             <AlertCircle className="w-6 h-6 text-destructive" />
  //           </div>
  //           <div className="flex-1">
  //             <p className="font-semibold text-destructive">Request Rejected</p>
  //             <p className="text-sm text-muted-foreground">Your previous access request was not approved</p>
  //           </div>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <Card className="glass-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Request Access
        </CardTitle>
        <CardDescription>You&apos;re not on the allowlist. Submit a request to the admin.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* <Textarea
          placeholder="Why should you be allowed to vote? (optional)"
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="bg-secondary/50 border-border resize-none"
          rows={3}
        /> */}
        <Button onClick={handleSubmitRequest} disabled={isSubmitting} className="w-full gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Request
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AllowlistStatusCard;
