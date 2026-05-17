import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

interface Teammate {
  id: number;
  name: string;
  role: string;
  status: "online" | "offline" | "busy";
  email: string;
}

const mockTeammates: Teammate[] = [
  { id: 1, name: "Sarah Chen", role: "Sales Manager", status: "online", email: "sarah@example.com" },
  { id: 2, name: "James Wilson", role: "Sales Executive", status: "busy", email: "james@example.com" },
  { id: 3, name: "Maria Garcia", role: "Admin", status: "online", email: "maria@example.com" },
  { id: 4, name: "Robert Taylor", role: "Sales Executive", status: "offline", email: "robert@example.com" },
];

interface TeamStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TeamStatusDialog({ open, onOpenChange }: TeamStatusDialogProps) {
  const getStatusColor = (status: Teammate["status"]) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "busy": return "bg-amber-500";
      case "offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Team Status</DialogTitle>
          <DialogDescription>
            See who's online and connect with your teammates.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {mockTeammates.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {member.name.charAt(0)}
                  </div>
                  <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => toast.success(`Chat started with ${member.name}`)}
                >
                  <MessageCircle size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => toast.info(`Calling ${member.name}...`)}
                >
                  <Phone size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center border-t pt-4 mt-2">
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
