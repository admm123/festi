import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "festi";

export function Basic() {
  return (
    <Tabs defaultValue="route" className="w-80">
      <TabsList>
        <TabsTrigger value="route">Route</TabsTrigger>
        <TabsTrigger value="riders">Riders</TabsTrigger>
        <TabsTrigger value="chat">Chat</TabsTrigger>
      </TabsList>
      <TabsContent value="route" className="text-sm text-muted-foreground">
        84 km loop with two categorized climbs.
      </TabsContent>
      <TabsContent value="riders" className="text-sm text-muted-foreground">
        12 riders have joined so far.
      </TabsContent>
      <TabsContent value="chat" className="text-sm text-muted-foreground">
        Say hi to the group before Saturday.
      </TabsContent>
    </Tabs>
  );
}
