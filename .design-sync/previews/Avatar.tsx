import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "festi";

export function WithImage() {
  return (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/80?img=12" alt="Rider" />
      <AvatarFallback>AR</AvatarFallback>
    </Avatar>
  );
}

export function Fallback() {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MT</AvatarFallback>
      </Avatar>
    </div>
  );
}

export function Group() {
  return (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/80?img=5" alt="" />
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/80?img=8" alt="" />
        <AvatarFallback>B</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>C</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  );
}
