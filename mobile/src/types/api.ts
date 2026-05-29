export type User = {
  email: string;
  id: number;
  provider?: string;
  username: string;
};

export type Session = {
  token: string;
  tokenType: string;
  user: User;
};

export type Deal = {
  catalogOnly?: boolean;
  dealID: string;
  displayTitle?: string;
  gameID: string;
  normalPrice: string;
  salePrice: string;
  savings: string;
  steamAppID?: string;
  storeID: string;
  storeName?: string;
  targetPrice?: number;
  thumb?: string;
  title: string;
  wishlistId?: number;
};
