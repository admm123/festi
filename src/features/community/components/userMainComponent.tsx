"use client";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { ErrorComponent } from "@/components/errorComponent";
import LoadingComponent from "@/components/loadingComponent";
import NotFoundComponent from "@/components/notFoundComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRider, type Rider } from "../actions/getRider";
import FollowRiderButton from "./followRiderButton";

const UserMainComponent = () => {
  const params = useParams();
  const id = params.id as string;

  const query = useQuery<Rider | null>({
    queryKey: ["rider-profile", id],
    queryFn: () => getRider(id),
  });

  if (query.isError) {
    return (
      <ErrorComponent
        error={(query.error as any)?.message ?? "An error occurred"}
      />
    );
  }

  if (query.isLoading) {
    return <LoadingComponent />;
  }

  if (!query.data) {
    return <NotFoundComponent />;
  }

  const rider = query.data;
  const joinedDate = new Date(rider.createdAt);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="size-20">
          <AvatarImage src={rider.image ?? undefined} />
          <AvatarFallback>
            {rider.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-4">
              {rider.name}{" "}
              <BadgeCheck
                size={25}
                color={rider.role === "admin" ? "#eab308" : "#3b82f6"}
              />
            </h1>
            <FollowRiderButton targetId={id} isFollowing={rider.isFollowing} />
          </div>
          <p className="text-muted-foreground">@{rider.username ?? "rider"}</p>
          <p className="text-sm text-muted-foreground">
            {rider.followersCount} followers • {rider.followingCount} following
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Joined{" "}
        {Number.isNaN(joinedDate.getTime())
          ? "Joined date unknown"
          : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
              joinedDate,
            )}
      </p>
    </div>
  );
};

export default UserMainComponent;
