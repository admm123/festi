export type AdminUser = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
  isOnline: boolean;
  lastActiveAt: string | null;
};
