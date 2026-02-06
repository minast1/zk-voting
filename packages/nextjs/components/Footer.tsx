import React from "react";

// import Link from "next/link";
// import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
// import { hardhat } from "viem/chains";
// import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { HeartIcon } from "@heroicons/react/24/outline";
// import { SwitchTheme } from "~~/components/SwitchTheme";
//import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";
//import { Faucet } from "~~/components/scaffold-eth";
//import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Site footer
 */
export const Footer = () => {
  // const { targetNetwork } = useTargetNetwork();
  //const isLocalNetwork = targetNetwork.id === hardhat.id;
  // const { price: nativeCurrencyPrice } = useFetchNativeCurrencyPrice();

  return (
    <footer className=" flex flex-col space-y-2 border-t border-border/50 py-8 text-center text-xs md:text-sm text-muted-foreground">
      <p>AnonVote — Private, Sybil-resistant voting for everyone</p>
      <p>&copy; {new Date().getFullYear()} AnnonVote. All rights reserved.</p>
    </footer>
  );
};
