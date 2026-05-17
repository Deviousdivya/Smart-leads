import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { Lead, LeadStatus, LeadSource, LeadsResponse, UserRole } from "../types";
import DashboardLayout from "../components/DashboardLayout";
import { useAuthStore } from "../hooks/useAuthStore";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { 
  Download, 
  Plus, 
  Search, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  MoreVertical,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import LeadForm from "../components/LeadForm";
import LeadDetailsDialog from "../components/LeadDetailsDialog";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("latest");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, isError } = useQuery<LeadsResponse>({
    queryKey: ["leads", debouncedSearch, statusFilter, sourceFilter, sortOrder, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (sourceFilter !== "all") params.append("source", sourceFilter);
      params.append("sort", sortOrder);
      params.append("page", page.toString());
      
      const res = await api.get(`/leads?${params.toString()}`);
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete lead");
    }
  });

  const handleExportCSV = async () => {
    try {
      window.open("/api/export/leads", "_blank");
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW: return <Badge variant="secondary">New</Badge>;
      case LeadStatus.CONTACTED: return <Badge variant="outline" className="bg-blue-50 text-blue-700">Contacted</Badge>;
      case LeadStatus.QUALIFIED: return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Qualified</Badge>;
      case LeadStatus.LOST: return <Badge variant="destructive">Lost</Badge>;
      default: return null;
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingLead(null);
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search leads..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={LeadStatus.NEW}>New</SelectItem>
                <SelectItem value={LeadStatus.CONTACTED}>Contacted</SelectItem>
                <SelectItem value={LeadStatus.QUALIFIED}>Qualified</SelectItem>
                <SelectItem value={LeadStatus.LOST}>Lost</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value={LeadSource.WEBSITE}>Website</SelectItem>
                <SelectItem value={LeadSource.INSTAGRAM}>Instagram</SelectItem>
                <SelectItem value={LeadSource.REFERRAL}>Referral</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={handleExportCSV}>
              <Download size={20} />
            </Button>

            <Button onClick={handleCreate} className="gap-2">
              <Plus size={20} />
              New Lead
            </Button>
          </div>
        </div>

        <div className="rounded-md border bg-white dark:border-gray-800 dark:bg-gray-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                   <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
                 </TableRow>
              ) : isError ? (
                <TableRow>
                   <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-destructive font-medium">Failed to load leads</p>
                      <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["leads"] })}>
                        Try Again
                      </Button>
                    </div>
                   </TableCell>
                 </TableRow>
              ) : data?.leads.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={6} className="h-24 text-center">No leads found.</TableCell>
                 </TableRow>
              ) : (
                data?.leads.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell className="font-medium dark:text-gray-200">{lead.name}</TableCell>
                    <TableCell className="dark:text-gray-400">{lead.email}</TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell className="dark:text-gray-400">{lead.source}</TableCell>
                    <TableCell className="dark:text-gray-400">{format(new Date(lead.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="View Details"
                          onClick={() => {
                            setViewingLead(lead);
                            setIsViewOpen(true);
                          }}
                        >
                          <Eye size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Edit Lead"
                          onClick={() => handleEdit(lead)}
                        >
                          <MoreVertical size={18} />
                        </Button>
                        {user?.role === UserRole.ADMIN && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Delete Lead"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this lead?")) {
                                deleteMutation.mutate(lead._id);
                              }
                            }}
                          >
                            <Trash2 size={18} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {data?.leads.length || 0} of {data?.pagination.total || 0} leads
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>
            <span className="text-sm font-medium dark:text-white">
              Page {data?.pagination.page || 1} of {data?.pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data?.pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <LeadForm 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        initialData={editingLead}
      />
      <LeadDetailsDialog
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        lead={viewingLead}
      />
    </DashboardLayout>
  );
}
