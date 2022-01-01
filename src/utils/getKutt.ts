import got from "got";
import { rawList, rawStats, data, kuttUser } from "../utils/types";
import config from "../config";

/**
 * Get list of rawList happening
 * @param kuttAPIKey API Key to communicate with kutt services
 * @param limit number to paginate
 * @param skip number to paginate
 * @returns {Promise<rawList>} List of rawList
 */
export async function getRawList(
  kuttAPIKey: string,
  limit: number,
  skip: number,
): Promise<rawList> {
  const rawList = (await got(
    `${config.API_URL}links?limit=${limit}&skip=${skip}`,
    {
      headers: { "X-API-KEY": kuttAPIKey },
    },
  ).json()) as rawList;

  return rawList;
}

/**
 * Get rawStats of given uuid
 * @param kuttAPIKey API Key to communicate with kutt services
 * @param uuid of the stats of the url
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

  return rawStats;
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

/**
 * shortens an url
 * @param kuttAPIKey API Key to communicate with kutt services
 * @param domain domain of the short url
 * @param url url to be shortened
 * @returns {Promise<data>} data of the shortened URL
 */
export async function createLink(
  kuttAPIKey: string,
  domain: string,
  url: string,
  custom:string
): Promise<data> {
  const data = (await got
    .post(`${config.API_URL}links`, {
      headers: { "X-API-KEY": kuttAPIKey },
      json: {
        target: url,
        domain: domain,
        customurl: custom,
      },
    })
    .json()
    .catch((error) => {
      // console.log(error);
      const { response } = error;
      console.log(response.body);
      return {
        id: "error",
        address: response.body,
        banned: true,
        created_at: "error",
        updated_at: "error",
        password: true,
        description: null,
        expire_in: null,
        target: "error",
        visit_count: 0,
        domain: "error",
        link: "error",
      };
    })) as data;

  return data;
}

/**
 * Get user object
 * @param kuttAPIKey API Key to communicate with kutt services
 * @returns {Promise<kuttUser>} Kutt user object
 */
export async function getUser(kuttAPIKey: string): Promise<kuttUser> {
  const kuttUser = (await got(`${config.API_URL}users`, {
    headers: { "X-API-KEY": kuttAPIKey },
  }).json()) as kuttUser;

  return kuttUser;
}

/**
 * Validate API Key
 * @param kuttAPIKey API Key to test if its valid
 * @returns {Promise<boolean>} True if valid
 */
export async function checkAPIKey(
  kuttAPIKey: string,
): Promise<boolean> {
  const { statusCode } = await got(`${config.API_URL}users`, {
    headers: { "X-API-KEY": kuttAPIKey },
    throwHttpErrors: false,
  });

  return statusCode === 200;
}
