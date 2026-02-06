"use client";

import React, { useState } from "react";
import Link from "next/link";
import TestnetFaucetButton from "./TestnetFaucetButton";
import { FaucetButton, RainbowKitCustomConnectButton } from "./scaffold-eth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useWatchBalance } from "@scaffold-ui/hooks";
import clsx from "clsx";
//import { Button } from "./ui/button";
import { CheckCircleIcon, ChevronDown, Droplets, Globe, Shield, SquareArrowLeft, Wallet } from "lucide-react";
import { formatEther, getAddress } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, useDisconnect } from "wagmi";
import { ArrowTopRightOnSquareIcon, DocumentDuplicateIcon } from "@heroicons/react/20/solid";
import { useCopyToClipboard, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

// interface HeaderProps {
//   voter: boolean | null;
//   onLogout: () => void;
// }
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const [selectingNetwork] = useState(false);
  const { openConnectModal } = useConnectModal();
  const { copyToClipboard: copyAddressToClipboard, isCopiedToClipboard: isAddressCopiedToClipboard } =
    useCopyToClipboard();
  const { address, chain, connector } = useAccount();
  const { data: balance } = useWatchBalance({ address, chainId: targetNetwork.id });
  const formattedBalance = balance ? Number(formatEther(balance.value)) : 0;
  const { disconnect } = useDisconnect();

  const checkSumAddress = address ? getAddress(address) : "";
  const blockExplorerAddressLink = address ? getBlockExplorerAddressLink(targetNetwork, address) : undefined;
  const connected = address && chain && connector;
  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-3">
          <div className="w-7 md:w-10 h-7 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 md:w-5 h-4 md:h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold gradient-text">AnonVote</h1>
            <p className="hidden md:block text-xs text-muted-foreground">Sybil-resistant voting</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-3">
            <RainbowKitCustomConnectButton />
            {isLocalNetwork ? <FaucetButton /> : <TestnetFaucetButton />}
            {/* <SwitchTheme /> */}
          </div>
        </div>
        {/* Mobile navigation */}
        <div className="sm:hidden flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/50 hover:bg-primary/20 transition-colors cursor-pointer">
                <Wallet className="h-3 w-3 text-primary" />
                <span className="text-xs font-mono text-primary">
                  {checkSumAddress?.slice(0, 4) + "..." + checkSumAddress?.slice(-4)}
                </span>
                <span className="text-xs font-bold text-primary border-l border-primary/50 pl-2">
                  {formattedBalance.toFixed(4)} ETH
                </span>
                <ChevronDown className="h-3 w-3 text-primary/70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="shadow-xl" onCloseAutoFocus={e => e.preventDefault()}>
              <DropdownMenuItem
                onSelect={e => {
                  e.preventDefault();
                  copyAddressToClipboard(checkSumAddress);
                }}
                className={clsx(selectingNetwork ? "hidden" : "")}
              >
                {isAddressCopiedToClipboard ? (
                  <>
                    <CheckCircleIcon className="text-xl font-normal h-6 w-4 ml-2 sm:ml-0" aria-hidden="true" />
                    <span className="whitespace-nowrap">Copied!</span>
                  </>
                ) : (
                  <>
                    <DocumentDuplicateIcon className="text-xl font-normal h-6 w-4 mr-2 sm:ml-0" aria-hidden="true" />
                    <span className="whitespace-nowrap">Copy address</span>
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem className={clsx(selectingNetwork ? "hidden" : "")}>
                <ArrowTopRightOnSquareIcon className="h-6 w-4 mr-2 sm:ml-0" />
                <a
                  target="_blank"
                  href={blockExplorerAddressLink}
                  rel="noopener noreferrer"
                  className="whitespace-nowrap"
                >
                  View on Block Explorer
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                {isLocalNetwork ? (
                  <FaucetButton />
                ) : (
                  <Link href="https://console.optimism.io/faucet" className="flex items-center gap-4">
                    <Droplets className="h-4 w-4" />
                    <span className="sm:inline">Faucet</span>
                  </Link>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={!connected ? openConnectModal : handleDisconnect}
                className={selectingNetwork ? "hidden" : ""}
              >
                {!connected ? (
                  <>
                    <Globe className="h-3 w-3" /> Connect
                  </>
                ) : (
                  <>
                    <SquareArrowLeft className="h-6 w-4 mr-2 sm:ml-0" /> Disconnect
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

//goes on line 37
//  {voter && (
//             <>
//               <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
//                 <User className="w-4 h-4" />
//                 <span className="font-mono text-primary">
//                   {/* {voter.hashedId.slice(0, 8)}... */}
//                   0x568865...
//                 </span>
//               </div>
//               <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2">
//                 <LogOut className="w-4 h-4" />
//                 <span className="hidden sm:inline">Sign Out</span>
//               </Button>
//             </>
//           )}
