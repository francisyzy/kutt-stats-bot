import { addDays, format, subDays } from "date-fns";
import { rawStats } from "./types";

/**
 * Escape MarkdownV2 Characters
 * @param {string} str - The string with characters to escape
 * @return {string} Escaped strings
 */
export function toEscapeMsg(str: string): string {
  return str
    .replace(/_/gi, "\\_")
    .replace(/-/gi, "\\-")
    .replace("+", "\\+")
    .replace("=", "\\=")
    .replace("~", "\\~")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\</g, "\\<")
    .replace(/\>/g, "\\>")
    .replace(/!/gi, "\\!")
    .replace(/`/gi, "\\`")
    .replace(/\./g, "\\.");
}

/**
 * Escape HTML Characters
 * For some reason the < and the > dont wanna escape properly. Prob due to &
 * @param {string} str - The string with characters to escape
 * @return {string} Escaped strings
 */
export function toEscapeHTMLMsg(str: string): string {
  return (
    str
      // .replace(/\</g, "&gt;")
      // .replace(/\>/g, "&lt;")
      // .replace(/\&/g, "&amp;");
      .replace("<", "&gt;")
      .replace(">", "&lt;")
      .replace("&", "&amp;")
  );
}

/**
 * Formats raw stats into viewable stats
 * @param {rawStats} stats - The raw stats object
 * @return {string} Formatted stats string with HTML
 */
export function formatStats(stats: rawStats): string {
  let returnString = `<b>${stats.address}</b>\n`;
  returnString += `${stats.link}\n`;
  returnString += `${stats.target}\n\n`;
  returnString +=
    "<b>Last week total views</b>: " +
    stats.lastWeek.views.reduce((a, b) => a + b) +
    "\n";
  for (let i = 0; i < stats.lastWeek.views.length; i++) {
    const viewCount = stats.lastWeek.views[i];
    if (viewCount !== 0) {
      returnString += `<b>${format(
        addDays(
          subDays(new Date(), stats.lastWeek.views.length),
          i + 1,
        ),
        "dd-MM-yy",
      )}</b>: ${viewCount}\n`;
    }
  }

  returnString += `\nhttps://kutt.it/stats?id=${stats.id}\n`;
  returnString += `\n/stats_${stats.id.replace(/-/g, "_")}\n`;
  return returnString;
}
