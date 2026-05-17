import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { Lead, LeadStatus, LeadSource } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  status: z.nativeEnum(LeadStatus),
  source: z.nativeEnum(LeadSource),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Lead | null;
}

export default function LeadForm({ isOpen, onClose, initialData }: LeadFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      status: LeadStatus.NEW,
      source: LeadSource.WEBSITE,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        status: initialData.status,
        source: initialData.source,
      });
    } else {
      reset({
        name: "",
        email: "",
        status: LeadStatus.NEW,
        source: LeadSource.WEBSITE,
      });
    }
  }, [initialData, reset]);

  const mutation = useMutation({
    mutationFn: (values: LeadFormValues) => {
      if (initialData) {
        return api.patch(`/leads/${initialData._id}`, values);
      }
      return api.post("/leads", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(initialData ? "Lead updated successfully" : "Lead created successfully");
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save lead");
    }
  });

  const onSubmit = (values: LeadFormValues) => {
    mutation.mutate(values);
  };

  const statusValue = watch("status");
  const sourceValue = watch("source");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Lead" : "Add New Lead"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="lead-name">Name</Label>
            <Input id="lead-name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-email">Email</Label>
            <Input id="lead-email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={statusValue} 
                onValueChange={(v) => setValue("status", v as LeadStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LeadStatus.NEW}>New</SelectItem>
                  <SelectItem value={LeadStatus.CONTACTED}>Contacted</SelectItem>
                  <SelectItem value={LeadStatus.QUALIFIED}>Qualified</SelectItem>
                  <SelectItem value={LeadStatus.LOST}>Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select 
                value={sourceValue} 
                onValueChange={(v) => setValue("source", v as LeadSource)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LeadSource.WEBSITE}>Website</SelectItem>
                  <SelectItem value={LeadSource.INSTAGRAM}>Instagram</SelectItem>
                  <SelectItem value={LeadSource.REFERRAL}>Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update Lead" : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
