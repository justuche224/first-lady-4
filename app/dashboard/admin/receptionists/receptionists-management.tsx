"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NormalButton } from "@/components/ui/button-normal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Users } from "lucide-react";
import {
  getAllReceptionists,
  createReceptionist,
  updateReceptionist,
  toggleReceptionistStatus,
  type CreateReceptionistData,
  type UpdateReceptionistData,
} from "@/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Receptionist {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface ReceptionistsManagementProps {
  initialReceptionists: Receptionist[];
}

export default function ReceptionistsManagement({
  initialReceptionists,
}: ReceptionistsManagementProps) {
  const [receptionists, setReceptionists] = useState<Receptionist[]>(
    initialReceptionists
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    startTransition(async () => {
      const result = await getAllReceptionists(query || undefined);
      if (result.success) {
        setReceptionists(result.data);
      }
    });
  };

  const handleCreateReceptionist = async (data: CreateReceptionistData) => {
    startTransition(async () => {
      const result = await createReceptionist(data);
      if (result.success) {
        toast.success("Receptionist created successfully");
        setIsCreateOpen(false);
        router.refresh();
        const updatedResult = await getAllReceptionists(
          searchQuery || undefined
        );
        if (updatedResult.success) {
          setReceptionists(updatedResult.data);
        }
      } else {
        toast.error(result.error || "Failed to create receptionist");
      }
    });
  };

  const handleUpdateReceptionist = async (data: UpdateReceptionistData) => {
    startTransition(async () => {
      const result = await updateReceptionist(data);
      if (result.success) {
        toast.success("Receptionist updated successfully");
        router.refresh();
        const updatedResult = await getAllReceptionists(
          searchQuery || undefined
        );
        if (updatedResult.success) {
          setReceptionists(updatedResult.data);
        }
      } else {
        toast.error(result.error || "Failed to update receptionist");
      }
    });
  };

  const handleToggleStatus = async (
    userId: string,
    currentStatus: boolean
  ) => {
    startTransition(async () => {
      const result = await toggleReceptionistStatus(userId, !currentStatus);
      if (result.success) {
        toast.success(
          `Receptionist ${!currentStatus ? "enabled" : "disabled"} successfully`
        );
        router.refresh();
        const updatedResult = await getAllReceptionists(
          searchQuery || undefined
        );
        if (updatedResult.success) {
          setReceptionists(updatedResult.data);
        }
      } else {
        toast.error(result.error || "Failed to update receptionist status");
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-7xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Manage Receptionists
        </h1>
        <p className="text-muted-foreground">
          Create, edit, and manage receptionist accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Receptionists</CardTitle>
              <CardDescription>
                View and manage all receptionist accounts in the system
              </CardDescription>
            </div>
            <CreateReceptionistDialog
              open={isCreateOpen}
              onOpenChange={setIsCreateOpen}
              onCreate={handleCreateReceptionist}
              isPending={isPending}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receptionists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No receptionists found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  receptionists.map((receptionist) => (
                    <TableRow key={receptionist.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {receptionist.name}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{receptionist.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              receptionist.isActive ? "default" : "secondary"
                            }
                          >
                            {receptionist.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {!receptionist.emailVerified && (
                            <Badge variant="outline">Unverified</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {receptionist.createdAt
                          ? new Date(receptionist.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={receptionist.isActive}
                            onCheckedChange={() =>
                              handleToggleStatus(
                                receptionist.id,
                                receptionist.isActive
                              )
                            }
                            disabled={isPending}
                          />
                          <EditReceptionistDialog
                            receptionist={receptionist}
                            onUpdate={handleUpdateReceptionist}
                            isPending={isPending}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateReceptionistDialog({
  open,
  onOpenChange,
  onCreate,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: CreateReceptionistData) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState<CreateReceptionistData>({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    onCreate(formData);
    setFormData({
      name: "",
      email: "",
      password: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <NormalButton>
          <Plus className="h-4 w-4" />
          Create Receptionist
        </NormalButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Receptionist</DialogTitle>
          <DialogDescription>
            Create a new receptionist account. The receptionist will receive
            login credentials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          <DialogFooter>
            <NormalButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </NormalButton>
            <NormalButton type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Receptionist"}
            </NormalButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditReceptionistDialog({
  receptionist,
  onUpdate,
  isPending,
}: {
  receptionist: Receptionist;
  onUpdate: (data: UpdateReceptionistData) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateReceptionistData>({
    userId: receptionist.id,
    name: receptionist.name,
    email: receptionist.email,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    onUpdate(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <NormalButton variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </NormalButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Receptionist</DialogTitle>
          <DialogDescription>
            Update receptionist account information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <DialogFooter>
            <NormalButton
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </NormalButton>
            <NormalButton type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update Receptionist"}
            </NormalButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

