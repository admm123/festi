import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "festi";

export function Basic() {
  return (
    <div className="w-[32rem]">
      <Table>
        <TableCaption>Recent group rides</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Ride</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Distance</TableHead>
            <TableHead className="text-right">Riders</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Alpine Loop</TableCell>
            <TableCell>Sat, Jun 7</TableCell>
            <TableCell className="text-right">84 km</TableCell>
            <TableCell className="text-right">12</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">River Spin</TableCell>
            <TableCell>Sun, Jun 8</TableCell>
            <TableCell className="text-right">42 km</TableCell>
            <TableCell className="text-right">8</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Hill Repeats</TableCell>
            <TableCell>Tue, Jun 10</TableCell>
            <TableCell className="text-right">28 km</TableCell>
            <TableCell className="text-right">5</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell className="text-right">154 km</TableCell>
            <TableCell className="text-right">25</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
