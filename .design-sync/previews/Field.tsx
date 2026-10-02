import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  Input,
} from "festi";

export function Basic() {
  return (
    <FieldGroup className="w-80">
      <Field>
        <FieldLabel htmlFor="f-name">Ride name</FieldLabel>
        <Input id="f-name" placeholder="Saturday Social" />
        <FieldDescription>Shown to everyone you invite.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="f-meet">Meeting point</FieldLabel>
        <Input id="f-meet" defaultValue="River bridge car park" />
      </Field>
    </FieldGroup>
  );
}
