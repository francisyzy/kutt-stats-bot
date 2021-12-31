import got from "got";
import { rawList, rawStats } from "../utils/types";

/**
 * Get list of rawList happening
 * @return {rawList} List of rawList
 */
export async function getRawList(
  kuttAPIKey: string,
  limit: number,
  skip: number,
): Promise<rawList> {
  console.log("limit" + limit);
  console.log("skip" + skip);
  const rawList = (await got(
    `https://kutt.it/api/v2/links?limit=${limit}&skip=${skip}`,
    {
      headers: { "X-API-KEY": kuttAPIKey },
    },
  ).json()) as rawList;

  return rawList as rawList;
}

/**
 * Get rawStats of given uuid
 * @return {rawStats} Raw stats object
 */
export async function getStats(
  kuttAPIKey: string,
  uuid: string,
): Promise<rawStats> {
  const rawStats = (await got(
    `https://kutt.it/api/v2/links/${uuid}/stats`,
    {
      headers: { "X-API-KEY": kuttAPIKey },
    },
  ).json()) as rawStats;

  return rawStats as rawStats;
}
