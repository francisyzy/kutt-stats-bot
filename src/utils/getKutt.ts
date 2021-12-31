import got from "got";
import { rawList, rawStats } from "../utils/types";
import config from "../config";

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
    `${config.API_URL}links?limit=${limit}&skip=${skip}`,
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
    `${config.API_URL}links/${uuid}/stats`,
    {
      headers: { "X-API-KEY": kuttAPIKey },
    },
  ).json()) as rawStats;

  return rawStats as rawStats;
}
