import React, { useEffect } from "react";
import { useScaffoldEventHistory } from "../../../../hooks/scaffold-eth/useScaffoldEventHistory";
import PollRow from "./poll-row";
import { useChallengeStore } from "~~/services/store/zk-store";

//import { useChallengeStore } from "~~/services/store/zk-store";

const PreviousPolls = () => {
  const pollId = useChallengeStore(state => state.currentPollid);
  const expiresAt = useChallengeStore(state => state.expiresAt);
  const { data: pollCreatedEvents, refetch } = useScaffoldEventHistory({
    contractName: "Voting",
    eventName: "PollCreated",
    watch: false,
    //enabled: !!privateAccount?.address,
  });
  useEffect(() => {
    refetch();
    console.log("Non blockchain time expired");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, pollId]);

  const now = BigInt(Math.floor(Date.now() / 1000));

  const pollIds = React.useMemo(() => {
    if (!pollCreatedEvents?.length) return [];

    return pollCreatedEvents
      .filter((e): e is NonNullable<typeof e> => !!e && !!e.args && typeof e.args.endTime === "bigint")
      .filter(e => e.args.endTime! <= now)
      .map(e => e.args.pollId)
      .slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollCreatedEvents]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-muted-foreground">Past Polls</h3>
      {pollIds.length ? pollIds.map(id => <PollRow id={Number(id)} key={Number(id)} />) : null}
    </div>
  );
};

export default PreviousPolls;
