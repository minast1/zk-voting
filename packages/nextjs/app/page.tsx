"use client";

// import Link from "next/link";
// import { Address } from "@scaffold-ui/components";
import { useEffect, useState } from "react";
import { useScaffoldEventHistory } from "../hooks/scaffold-eth/useScaffoldEventHistory";
// import { hardhat } from "viem/chains";
// import { useAccount } from "wagmi";
// import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { Eye, Lock, ShieldCheck, Vote } from "lucide-react";
import type { NextPage } from "next";
import { VoterRegistration } from "~~/components/voter-registration";
import { Poll, VoterIdentity, getPolls, getVoterIdentity } from "~~/lib/voting";

const Home: NextPage = () => {
  const { data: leafEvents } = useScaffoldEventHistory({
    contractName: "Voting",
    eventName: "NewLeaf",
    watch: true,
    enabled: true,
  });

  const [, setVoter] = useState<VoterIdentity | null>(null);
  const [, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    const storedVoter = getVoterIdentity();
    if (storedVoter) {
      setVoter(storedVoter);
    }
    setPolls(getPolls());
  }, []);

  return (
    <>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <ShieldCheck className="w-4 h-4" />
            Sybil-Resistant & Private
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold">
            <span className="gradient-text">Anonymous Voting</span>
            <br />
            <span className="text-foreground">Made Simple</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create polls, prove your eligibility, and vote exactly once — all without revealing your identity. Your vote
            matters, your privacy is protected.
          </p>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-4 pb-8">
          {[
            {
              icon: <Vote className="w-6 h-6 text-primary" />,
              title: "One Person, One Vote",
              desc: "Sybil-resistant verification prevents double voting",
            },
            {
              icon: <Eye className="w-6 h-6 text-primary" />,
              title: "Complete Privacy",
              desc: "Your identity is never revealed, only a hash is stored",
            },
            {
              icon: <Lock className="w-6 h-6 text-primary" />,
              title: "Cryptographic Proof",
              desc: "Zero-knowledge style verification protects your ballot",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass-card p-5 rounded-xl text-center space-y-3 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Registration */}
        <VoterRegistration leafEvents={leafEvents || []} />
      </div>
    </>
  );
};

export default Home;
