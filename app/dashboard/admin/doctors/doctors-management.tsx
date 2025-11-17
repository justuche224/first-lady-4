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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Stethoscope } from "lucide-react";
import {
  getAllDoctors,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
  type CreateDoctorData,
  type UpdateDoctorData,
} from "@/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Doctor {
  id: number;
  userId: string;
  licenseNumber: string;
  specialty: string;
  departmentId: number | null;
  yearsOfExperience: number | null;
  education: string | null;
  certifications: string | null;
  consultationFee: string | null;
  rating: string | null;
  totalPatients: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  userName: string;
  userEmail: string;
  userImage: string | null;
  isActive: boolean;
  emailVerified: boolean;
  departmentName: string | null;
}

interface Department {
  id: number;
  name: string;
  description: string | null;
  headDoctorId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface DoctorsManagementProps {
  initialDoctors: Doctor[];
  departments: Department[];
}

export default function DoctorsManagement({
  initialDoctors,
  departments,
}: DoctorsManagementProps) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    startTransition(async () => {
      const result = await getAllDoctors(query || undefined);
      if (result.success) {
        setDoctors(result.data);
      }
    });
  };

  const handleCreateDoctor = async (data: CreateDoctorData) => {
    startTransition(async () => {
      const result = await createDoctor(data);
      if (result.success) {
        toast.success("Doctor created successfully");
        setIsCreateOpen(false);
        router.refresh();
        const updatedResult = await getAllDoctors(searchQuery || undefined);
        if (updatedResult.success) {
          setDoctors(updatedResult.data);
        }
      } else {
        toast.error(result.error || "Failed to create doctor");
      }
    });
  };

  const handleUpdateDoctor = async (data: UpdateDoctorData) => {
    startTransition(async () => {
      const result = await updateDoctor(data);
      if (result.success) {
        toast.success("Doctor updated successfully");
        router.refresh();
        const updatedResult = await getAllDoctors(searchQuery || undefined);
        if (updatedResult.success) {
          setDoctors(updatedResult.data);
        }
      } else {
        toast.error(result.error || "Failed to update doctor");
      }
    });
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleDoctorStatus(userId, !currentStatus);
      if (result.success) {
        toast.success(
          `Doctor ${!currentStatus ? "enabled" : "disabled"} successfully`
        );
        router.refresh();
        const updatedResult = await getAllDoctors(searchQuery || undefined);
        if (updatedResult.success) {
          setDoctors(updatedResult.data);
        }
      } else {
        toast.error(result.error || "Failed to update doctor status");
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-7xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manage Doctors</h1>
        <p className="text-muted-foreground">
          Create, edit, and manage doctor accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Doctors</CardTitle>
              <CardDescription>
                View and manage all doctor accounts in the system
              </CardDescription>
            </div>
            <CreateDoctorDialog
              departments={departments}
              open={isCreateOpen}
              onOpenChange={setIsCreateOpen}
              onCreate={handleCreateDoctor}
              isPending={isPending}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, license, or specialty..."
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
                  <TableHead>Doctor</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Stethoscope className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No doctors found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{doctor.userName}</span>
                          <span className="text-sm text-muted-foreground">
                            {doctor.userEmail}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {doctor.licenseNumber}
                        </code>
                      </TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>
                        {doctor.departmentName || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {doctor.yearsOfExperience !== null
                          ? `${doctor.yearsOfExperience} years`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={doctor.isActive ? "default" : "secondary"}
                          >
                            {doctor.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {!doctor.emailVerified && (
                            <Badge variant="outline">Unverified</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={doctor.isActive}
                            onCheckedChange={() =>
                              handleToggleStatus(doctor.userId, doctor.isActive)
                            }
                            disabled={isPending}
                          />
                          <EditDoctorDialog
                            doctor={doctor}
                            departments={departments}
                            onUpdate={handleUpdateDoctor}
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

function CreateDoctorDialog({
  departments,
  open,
  onOpenChange,
  onCreate,
  isPending,
}: {
  departments: Department[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: CreateDoctorData) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState<CreateDoctorData>({
    name: "",
    email: "",
    password: "",
    licenseNumber: "",
    specialty: "",
    departmentId: null,
    yearsOfExperience: 0,
    education: null,
    certifications: null,
    consultationFee: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.licenseNumber ||
      !formData.specialty
    ) {
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
      licenseNumber: "",
      specialty: "",
      departmentId: null,
      yearsOfExperience: 0,
      education: null,
      certifications: null,
      consultationFee: null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <NormalButton>
          <Plus className="h-4 w-4" />
          Create Doctor
        </NormalButton>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Doctor</DialogTitle>
          <DialogDescription>
            Create a new doctor account. The doctor will receive login
            credentials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">
                License Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) =>
                  setFormData({ ...formData, licenseNumber: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">
                Specialty <span className="text-destructive">*</span>
              </Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) =>
                  setFormData({ ...formData, specialty: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <Select
                value={formData.departmentId?.toString() || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    departmentId: value === "none" ? null : parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="none">None</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min="0"
                value={formData.yearsOfExperience || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    yearsOfExperience: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultationFee">Consultation Fee</Label>
              <Input
                id="consultationFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.consultationFee || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consultationFee: parseFloat(e.target.value) || null,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Textarea
              id="education"
              value={formData.education || ""}
              onChange={(e) =>
                setFormData({ ...formData, education: e.target.value || null })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications</Label>
            <Textarea
              id="certifications"
              value={formData.certifications || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  certifications: e.target.value || null,
                })
              }
              rows={3}
            />
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
              {isPending ? "Creating..." : "Create Doctor"}
            </NormalButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditDoctorDialog({
  doctor,
  departments,
  onUpdate,
  isPending,
}: {
  doctor: Doctor;
  departments: Department[];
  onUpdate: (data: UpdateDoctorData) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateDoctorData>({
    userId: doctor.userId,
    name: doctor.userName,
    email: doctor.userEmail,
    licenseNumber: doctor.licenseNumber,
    specialty: doctor.specialty,
    departmentId: doctor.departmentId,
    yearsOfExperience: doctor.yearsOfExperience || undefined,
    education: doctor.education || undefined,
    certifications: doctor.certifications || undefined,
    consultationFee: doctor.consultationFee
      ? parseFloat(doctor.consultationFee)
      : undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.licenseNumber ||
      !formData.specialty
    ) {
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Doctor</DialogTitle>
          <DialogDescription>
            Update doctor account information and professional details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-licenseNumber">
                License Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) =>
                  setFormData({ ...formData, licenseNumber: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-specialty">
                Specialty <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-specialty"
                value={formData.specialty}
                onChange={(e) =>
                  setFormData({ ...formData, specialty: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-departmentId">Department</Label>
              <Select
                value={formData.departmentId?.toString() || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    departmentId: value === "none" ? null : parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="none">None</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-yearsOfExperience">
                Years of Experience
              </Label>
              <Input
                id="edit-yearsOfExperience"
                type="number"
                min="0"
                value={formData.yearsOfExperience || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    yearsOfExperience: parseInt(e.target.value) || undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-consultationFee">Consultation Fee</Label>
            <Input
              id="edit-consultationFee"
              type="number"
              min="0"
              step="0.01"
              value={formData.consultationFee || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  consultationFee: parseFloat(e.target.value) || undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-education">Education</Label>
            <Textarea
              id="edit-education"
              value={formData.education || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  education: e.target.value || undefined,
                })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-certifications">Certifications</Label>
            <Textarea
              id="edit-certifications"
              value={formData.certifications || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  certifications: e.target.value || undefined,
                })
              }
              rows={3}
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
              {isPending ? "Updating..." : "Update Doctor"}
            </NormalButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
