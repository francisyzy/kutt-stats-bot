interface data {
  id: string;
  address: string;
  banned: boolean;
  created_at: string;
  updated_at: string;
  password: boolean;
  description: string | null;
  expire_in: string | null;
  target: string;
  visit_count: number;
  domain: string;
  link: string;
}

interface rawList {
  total: number;
  limit: number;
  skip: number;
  data: data[];
}

interface browser {
  name: string;
  value: number;
}

interface os {
  name: string;
  value: number;
}

interface country {
  name: string;
  value: number;
}

interface referrer {
  name: string;
  value: number;
}

interface stats {
  stats: {
    browser: browser[];
    os: os[];
    country: country[];
    referrer: referrer[];
  };
  views: number[];
}

interface rawStats extends data {
  allTime: stats;
  lastDay: stats;
  lastMonth: stats;
  lastWeek: stats;
}

interface domain {
  id: string;
  banned: boolean;
  address: string;
  homepage: string;
  created_at: string;
  updated_at: string;
}

interface kuttUser {
  apiKey: string;
  email: string;
  domains: domain[];
}

export { rawList, rawStats, data, kuttUser };
