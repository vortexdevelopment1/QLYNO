import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import Link from "next/link";
import { Quote, Vendor } from "@/hospital-admin/store/slices/procurementSlice";

interface QuoteComparisonViewProps {
  quotes: Quote[];
  vendors: Vendor[];
  requestStatus: string;
  onSelectQuote: (quoteId: string) => void;
  onShortlistQuote?: (quoteId: string) => void;
}

export function QuoteComparisonView({ quotes, vendors, requestStatus, onSelectQuote, onShortlistQuote }: QuoteComparisonViewProps) {
  if (quotes.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
        No quotes received yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Vendor</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Availability</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map(quote => (
            <TableRow key={quote.id} className={quote.status === 'Selected' ? 'bg-primary/5' : ''}>
              <TableCell className="font-medium">
                {vendors.find(v => v.id === quote.vendorId)?.name || quote.vendorId}
              </TableCell>
              <TableCell className="font-semibold text-lg">
                ${quote.price.toLocaleString()}
              </TableCell>
              <TableCell>{quote.availability}</TableCell>
              <TableCell>{quote.deliveryTimelineDays} days</TableCell>
              <TableCell>
                <Link href="#" className="text-primary hover:underline text-sm">View Spec</Link>
              </TableCell>
              <TableCell>
                <Badge variant={quote.status === 'Selected' ? 'default' : quote.status === 'Shortlisted' ? 'secondary' : 'outline'}>
                  {quote.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {quote.status !== 'Selected' && requestStatus !== 'Approved' && requestStatus !== 'Ordered' && requestStatus !== 'Closed' && requestStatus !== 'Fulfilled' && (
                  <div className="flex justify-end gap-2">
                    {onShortlistQuote && quote.status !== 'Shortlisted' && (
                      <Button variant="outline" size="sm" onClick={() => onShortlistQuote(quote.id)}>
                        Shortlist
                      </Button>
                    )}
                    <Button size="sm" onClick={() => onSelectQuote(quote.id)}>
                      Select Quote
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
