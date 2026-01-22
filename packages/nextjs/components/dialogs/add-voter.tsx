"use client";

import { useState } from "react";
import { AddressInput } from "../address-input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
//import { Switch } from "../ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
//import { Textarea } from "../ui/textarea";
import { Plus, UserPlus, X } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { allowListSchema } from "~~/lib/schema";
import { useChallengeStore } from "~~/services/store/zk-store";

export function AddVoterDialog() {
  const [open, setOpen] = useState(false);
  const [allowStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const pollId = useChallengeStore(state => state.currentPollid);
  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "Voting",
  });
  const Aschema = allowListSchema(allowStatus);
  type AllowListSchema = z.infer<typeof Aschema>;
  const form = useForm({
    resolver: zodResolver(Aschema),
    defaultValues: {
      list: [{ address: "", status: allowStatus }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "list",
  });

  const handleBulkAdd = (data: AllowListSchema) => {
    // console.log(data);
    setIsLoading(true);
    try {
      writeContractAsync(
        {
          functionName: "addVoters",
          args: [data.list.map(item => item.address), BigInt(pollId || 0n), data.list.map(item => item.status)],
        },
        {
          blockConfirmations: 1,
          onBlockConfirmation: () => {
            form.reset();
            setIsLoading(false);
          },
        },
      );
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block w-fit">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setOpen(true)}
                disabled={typeof pollId === "undefined"}
              >
                <UserPlus className="h-4 w-4" />
                Manage Voters
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create a new poll to enable this feature</p>
          </TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Manage Allowed Voters</DialogTitle>
          <DialogDescription>Add or revoke voter eligibility by entering EOA or ENS addresses.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4 pt-4" onSubmit={form.handleSubmit(handleBulkAdd)}>
          <div className="space-y-2">
            <Label>EOA Addresses</Label>
            <div className="rounded-lg border bg-secondary/30 p-2">
              <div className="max-h-40 overflow-y-auto space-y-3">
                {fields.map((field, index) => (
                  <Controller
                    key={field.id}
                    control={form.control}
                    name={`list.${index}.address`}
                    render={({ field }) => (
                      <div className="flex items-center gap-3 mt-1 group pr-2">
                        <AddressInput
                          // {...form.register(`list.${fields.length}.address`)}
                          placeholder="0x1234...abcd"
                          {...field}
                          //onKeyDown={e => handleKeyDown(e, field.value)}
                          className="font-mono text-sm border-0 dark:focus-visible:ring-transparent dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0 h-10  px-2"
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="opacity-0 hover:cursor-pointer group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  />
                ))}
              </div>
              <div className="mt-2 flex w-full justify-end">
                <Button
                  type="button"
                  //variant="outline"
                  size="sm"
                  onClick={async () => {
                    const isValid = await form.trigger(`list.${fields.length - 1}.address`);
                    if (isValid) {
                      append({ address: "", status: allowStatus });
                    }
                  }}
                  className="shrink-0 h-8 w-8 p-0 rounded-full hover:cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p
              className={`text-xs ${form.formState.errors.list ? "text-destructive text-center" : "text-muted-foreground"} `}
            >
              {form.formState.errors.list
                ? form.formState.errors.list?.[fields.length - 1]?.address?.message
                : "Enter Ethereum addresses (EOAs) and press Enter or click + to add."}
            </p>
          </div>

          {/* <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="allow-status" className="text-base">
                {allowStatus ? "Allow Voting" : "Revoke Voting"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {allowStatus
                  ? "These addresses will be allowed to register and vote"
                  : "These addresses will have their voting rights revoked"}
              </p>
            </div>
            <Switch id="allow-status" checked={allowStatus} onCheckedChange={setAllowStatus} />
          </div> */}

          <Button
            type="submit"
            //onClick={handleSubmit}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Spinner /> <span className="ml-2">Adding...Please Wait</span>
              </>
            ) : (
              "Add to Allowed List"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
