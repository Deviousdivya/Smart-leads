import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Lead } from "../types";
import { format } from "date-fns";
import { Badge } from "./ui/badge";

interface LeadDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export default function LeadDetailsDialog({ isOpen, onClose, lead }: LeadDetailsProps) {
  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Lead Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-6 border-y my-4 dark:border-gray-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</p>
              <p className="text-sm font-medium dark:text-gray-200">{lead.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm font-medium dark:text-gray-200">{lead.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
              <div className="mt-1">
                <Badge variant="outline">{lead.status}</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Source</p>
              <p className="text-sm font-medium dark:text-gray-200">{lead.source}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Created At</p>
              <p className="text-sm font-medium dark:text-gray-200">
                {format(new Date(lead.createdAt), "PPPP p")}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
              <p className="text-sm font-medium dark:text-gray-200">
                {format(new Date(lead.updatedAt), "PPPP p")}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
