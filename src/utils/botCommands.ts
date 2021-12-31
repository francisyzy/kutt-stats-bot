import { BotCommand } from "typegram";
/**
 * All admin commands here
 * @return {BotCommand[]} List of admin commands
 */
export function getBotCommands(): BotCommand[] {
  const BotCommand: BotCommand[] = [
    {
      command: "account",
      description: "Get account information of user",
    },
    {
      command: "invite",
      description: "Invite other users to use this bot",
    },
    {
      command: "list",
      description: "Get list of short links you have created",
    },
    {
      command: "status",
      description: "Get list status of kutt.it",
    },
  ];
  return BotCommand;
}
