import type { RideSummary } from "@/features/rides/types";

export type PostAuthor = {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
};

export type PostImageInfo = {
  id: string;
  url: string;
  position: number;
};

export type PostSummary = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: PostAuthor;
  images: PostImageInfo[];
  isAuthor: boolean;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
};

export type PostComment = {
  id: string;
  content: string;
  createdAt: string;
  author: PostAuthor;
  isAuthor: boolean;
};

/** A single entry in the combined "For You" timeline. */
export type FeedItem =
  | { kind: "post"; createdAt: string; post: PostSummary }
  | { kind: "ride"; createdAt: string; ride: RideSummary };
