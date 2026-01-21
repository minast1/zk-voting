import React from "react";
import { CheckCircle2, ClipboardList, XCircle } from "lucide-react";
//import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent } from "~~/components/ui/card";
import { TabsContent } from "~~/components/ui/tabs";

const PendingRequests = () => {
  const pendingRequests: any[] = [];
  return (
    <TabsContent value="requests" className="space-y-4">
      <h2 className="text-xl font-semibold">Access Requests</h2>
      {pendingRequests.length === 0 ? (
        <Card className="glass-card border-border/50 border-dashed">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No Pending Requests</p>
            <p className="text-sm text-muted-foreground">Access requests from voters will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingRequests.map(request => (
            <Card key={request.id} className="glass-card border-border/50">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-mono text-sm">{request.eoa}</p>
                    {request.reason && <p className="text-xs text-muted-foreground mt-1">{request.reason}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-success hover:text-success"
                      // onClick={() => handleApprove(request.id)}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-destructive hover:text-destructive"
                      // onClick={() => handleReject(request.id)}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/*             
            //  {accessRequests.filter(r => r.status !== "pending").length > 0 && (
            //   <div className="space-y-3">
            //     <h3 className="text-lg font-medium text-muted-foreground">Past Requests</h3>
            //     {accessRequests
            //       .filter(r => r.status !== "pending")
            //       .map(request => (
            //         <Card key={request.id} className="glass-card border-border/50 opacity-70">
            //           <CardContent className="py-4">
            //             <div className="flex items-center justify-between">
            //               <span className="font-mono text-sm">{request.eoa}</span>
            //               <Badge variant={request.status === "approved" ? "default" : "destructive"}>
            //                 {request.status}
            //               </Badge>
            //             </div>
            //           </CardContent>
            //         </Card>
            //       ))}
            //   </div>
            // )}  */}
    </TabsContent>
  );
};

export default PendingRequests;
