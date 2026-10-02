import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "festi";

export function Open() {
  return (
    <Select defaultValue="alpine" open>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Choose a route" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Road</SelectLabel>
          <SelectItem value="alpine">Alpine Loop</SelectItem>
          <SelectItem value="river">River Spin</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Gravel</SelectLabel>
          <SelectItem value="forest">Forest Traverse</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function Closed() {
  return (
    <Select defaultValue="alpine">
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Choose a route" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="alpine">Alpine Loop</SelectItem>
        <SelectItem value="river">River Spin</SelectItem>
      </SelectContent>
    </Select>
  );
}
