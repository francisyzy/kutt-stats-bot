import got from "got";
import { rawList, rawStats } from "../utils/types";
import config from "../config";

/**
 * Get list of rawList happening
 * @returns {Promise<rawList>} List of rawList
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
 * @returns {Promise<rawStats>} Raw stats object
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

/**
 * Check if the API_URL returns 200
 * @returns {Promise<boolean>} true if service is up, false if service is down
 */
export async function getHealth(): Promise<boolean> {
  //https://docs.kutt.it/#tag/health
  const { statusCode } = await got(`${config.API_URL}health`);
  return statusCode === 200;
}
