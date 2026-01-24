"use client";

// import Link from "next/link";
// import { Address } from "@scaffold-ui/components";
import Link from "next/link";
// import { hardhat } from "viem/chains";
// import { useAccount } from "wagmi";
// import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { ArrowRight, Eye, Lock, ShieldCheck, UserCog, Users, Vote } from "lucide-react";
import type { NextPage } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";

//import { VoterRegistration } from "~~/components/voter-registration";

const Home: NextPage = () => {
  return (
    <>
      <div className="space-y-12 max-w-5xl mx-auto">
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

        {/* <VoterRegistration leafEvents={leafEvents || []} /> */}
        {/* Portal Cards */}
        <div className="grid sm:grid-cols-2 gap-6 py-8">
          <Link href="/dashboard/voter-portal" className="group">
            <Card className="glass-card border-border/50 h-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  Voter Portal
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </CardTitle>
                <CardDescription>Participate in polls and manage your voting access</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Register identity per poll
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Vote privately with ZK proofs
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    View allowlist status
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Request voting access
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin-portal" className="group">
            <Card className="glass-card border-border/50 h-full transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <UserCog className="w-7 h-7 text-accent" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  Admin Dashboard
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </CardTitle>
                <CardDescription>Manage polls, voters, and access requests</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Create and manage polls
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Add/remove voters from allowlist
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Review access requests
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Monitor poll results
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;
