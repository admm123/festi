export type Rider = {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  createdAt: string;
  role: string | null;
};

export type GroupMembershipStatus = "PENDING" | "APPROVED";

export type Group = {
  id: string;
  name: string;
  image: string | null;
  createdAt: string;
  isOwner: boolean;
  /** True only when the current user is an APPROVED member. */
  isMember: boolean;
  /** The current user's membership row status, or null when not a member. */
  membershipStatus: GroupMembershipStatus | null;
  needApproval: boolean;
  /** Number of APPROVED members only. */
  memberCount: number;
  createdBy: {
    id: string;
    name: string;
  };
};

export type GroupJoinRequest = {
  id: string;
  user: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
};
