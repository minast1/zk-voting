import React from "react";
import { useScaffoldEventHistory } from "../../../../hooks/scaffold-eth/useScaffoldEventHistory";
import PollRow from "./poll-row";

//import { useChallengeStore } from "~~/services/store/zk-store";

const PreviousPolls = () => {
  // const currentPollId = useChallengeStore(state => state.currentPollid);
  const { data: pollCreatedEvents } = useScaffoldEventHistory({
    contractName: "Voting",
    eventName: "PollCreated",
    watch: true,
    //enabled: !!privateAccount?.address,
  });

  const pollIds = React.useMemo(() => {
    if (!pollCreatedEvents) return [];
    return pollCreatedEvents
      .filter(e => (e.args.endTime || 0n) < BigInt(Math.floor(Date.now() / 1000)))
      .map(e => e.args.pollId)
      .slice(0, 3);
  }, [pollCreatedEvents]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-muted-foreground">Past Polls</h3>
      {pollIds.length ? pollIds.map(id => <PollRow id={Number(id)} key={Number(id)} />) : null}
    </div>
  );
};

export default PreviousPolls;
