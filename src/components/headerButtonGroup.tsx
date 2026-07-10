import { DirectChatHeaderButton } from "@/features/chat/components/directChatHeaderButton";
import FollowerListSheet from "@/features/followers/components/followerListSheet";
import NotificationSheet from "@/features/notification/components/notificationSheet";

const HeaderButtonGroup = () => {
  return (
    <div className="flex items-center gap-2">
      <NotificationSheet />
      <DirectChatHeaderButton />
      <FollowerListSheet />
    </div>
  );
};

export default HeaderButtonGroup;
