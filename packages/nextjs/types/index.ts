export type Poll = {
  question: string;
  startTime: number;
  endTime: number;
  yesVotes: number;
  noVotes: number;

  size: number;
  depth: number;
  root: string;
};
