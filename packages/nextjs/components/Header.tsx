"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AddVoterDialog } from "./dialogs/add-voter";
import { FaucetButton, RainbowKitCustomConnectButton } from "./scaffold-eth";
//import Image from "next/image";
//import Link from "next/link";
//import { usePathname } from "next/navigation";
//import { hardhat } from "viem/chains";
//import { Bars3Icon } from "@heroicons/react/24/outline";
//import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { Button } from "./ui/button";
import { LogOut, Shield, User } from "lucide-react";
import { hardhat } from "viem/chains";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

interface HeaderProps {
  voter: boolean | null;
  onLogout: () => void;
}
export const Header = ({ voter, onLogout }: HeaderProps) => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const pathname = usePathname();

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">AnonVote</h1>
            <p className="text-xs text-muted-foreground">Sybil-resistant voting</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {pathname === "/dashboard/admin-portal" && <AddVoterDialog />}
            <RainbowKitCustomConnectButton />
            {isLocalNetwork && <FaucetButton />}
            {/* <SwitchTheme /> */}
          </div>
          {voter && (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="font-mono text-primary">
                  {/* {voter.hashedId.slice(0, 8)}... */}
                  0x568865...
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
