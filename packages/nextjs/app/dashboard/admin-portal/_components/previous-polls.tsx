import React, { useEffect } from "react";
import PollRow from "./poll-row";
import useGetPollCreatedEvents from "~~/hooks/useGetPollCreatedEvents";
import { useChallengeStore } from "~~/services/store/zk-store";

//import { useChallengeStore } from "~~/services/store/zk-store";

const PreviousPolls = () => {
  const pollId = useChallengeStore(state => state.currentPollid);
  const expiresAt = useChallengeStore(state => state.expiresAt);
  const { pollIds, refetch } = useGetPollCreatedEvents(pollId ? BigInt(pollId) : undefined);

  useEffect(() => {
    refetch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, pollId]);

  return pollIds.length > 0 ? (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-muted-foreground">Previous Polls</h3>
      {pollIds.length ? pollIds.map(id => <PollRow id={Number(id)} key={Number(id)} />) : null}
    </div>
  ) : null;
};

export default PreviousPolls;
