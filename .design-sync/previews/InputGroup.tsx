import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
} from "festi";
import { Search, MapPin } from "lucide-react";

export function WithIcon() {
  return (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search routes…" />
    </InputGroup>
  );
}

export function WithAddons() {
  return (
    <div className="flex w-80 flex-col gap-3">
      <InputGroup>
        <InputGroupAddon>
          <MapPin />
        </InputGroupAddon>
        <InputGroupInput placeholder="Start location" />
        <InputGroupButton>Set</InputGroupButton>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>km</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="Distance" defaultValue="84" />
      </InputGroup>
    </div>
  );
}
