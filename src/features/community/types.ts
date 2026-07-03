export type Rider = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  role: string | null;
};

export type Group = {
  id: string;
  name: string;
  image: string | null;
  createdAt: string;
  isOwner: boolean;
  isMember: boolean;
  memberCount: number;
  createdBy: {
    id: string;
    name: string;
  };
};
