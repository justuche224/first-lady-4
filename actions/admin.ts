"use server";

import { db } from "@/db";
import {
  user,
  patients,
  appointments,
  doctors,
  departments,
  medicalRecords,
  prescriptions,
  appointmentStatus,
} from "@/db/schema";
import { count, eq, and, inArray, desc, like, or, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { serverAuth } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";

export async function getAdminDashboardStats() {
  try {
    const totalStaffResult = await db
      .select({ count: count() })
      .from(user)
      .where(inArray(user.role, ["doctor", "receptionist"]));

    const doctorsResult = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.role, "doctor"));

    const receptionistsResult = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.role, "receptionist"));

    const patientsResult = await db.select({ count: count() }).from(patients);

    const appointmentsResult = await db
      .select({ count: count() })
      .from(appointments);

    const activeUsersResult = await db
      .select({ count: count() })
      .from(user)
      .where(
        and(
          eq(user.isActive, true),
          inArray(user.role, ["doctor", "receptionist"])
        )
      );

    const inactiveUsersResult = await db
      .select({ count: count() })
      .from(user)
      .where(
        and(
          eq(user.isActive, false),
          inArray(user.role, ["doctor", "receptionist"])
        )
      );

    return {
      totalStaff: totalStaffResult[0]?.count ?? 0,
      totalDoctors: doctorsResult[0]?.count ?? 0,
      totalReceptionists: receptionistsResult[0]?.count ?? 0,
      totalPatients: patientsResult[0]?.count ?? 0,
      totalAppointments: appointmentsResult[0]?.count ?? 0,
      activeUsers: activeUsersResult[0]?.count ?? 0,
      inactiveUsers: inactiveUsersResult[0]?.count ?? 0,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return {
      totalStaff: 0,
      totalDoctors: 0,
      totalReceptionists: 0,
      totalPatients: 0,
      totalAppointments: 0,
      activeUsers: 0,
      inactiveUsers: 0,
    };
  }
}

async function verifyAdminAccess() {
  const session = await serverAuth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

export interface CreateDoctorData {
  name: string;
  email: string;
  password: string;
  licenseNumber: string;
  specialty: string;
  departmentId?: number | null;
  yearsOfExperience?: number;
  education?: string | null;
  certifications?: string | null;
  consultationFee?: number | null;
}

export interface UpdateDoctorData {
  userId: string;
  name?: string;
  email?: string;
  licenseNumber?: string;
  specialty?: string;
  departmentId?: number | null;
  yearsOfExperience?: number;
  education?: string | null;
  certifications?: string | null;
  consultationFee?: number | null;
}

export async function getAllDoctors(search?: string) {
  try {
    await verifyAdminAccess();

    const baseQuery = db
      .select({
        id: doctors.id,
        userId: doctors.userId,
        licenseNumber: doctors.licenseNumber,
        specialty: doctors.specialty,
        departmentId: doctors.departmentId,
        yearsOfExperience: doctors.yearsOfExperience,
        education: doctors.education,
        certifications: doctors.certifications,
        consultationFee: doctors.consultationFee,
        rating: doctors.rating,
        totalPatients: doctors.totalPatients,
        createdAt: doctors.createdAt,
        updatedAt: doctors.updatedAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        departmentName: departments.name,
      })
      .from(doctors)
      .innerJoin(user, eq(doctors.userId, user.id))
      .leftJoin(departments, eq(doctors.departmentId, departments.id));

    const results = search
      ? await baseQuery
          .where(
            or(
              like(user.name, `%${search}%`),
              like(user.email, `%${search}%`),
              like(doctors.licenseNumber, `%${search}%`),
              like(doctors.specialty, `%${search}%`)
            )
          )
          .orderBy(desc(doctors.createdAt))
      : await baseQuery.orderBy(desc(doctors.createdAt));

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function createDoctor(doctorData: CreateDoctorData) {
  try {
    await verifyAdminAccess();

    const existingLicense = await db
      .select()
      .from(doctors)
      .where(eq(doctors.licenseNumber, doctorData.licenseNumber))
      .limit(1);

    if (existingLicense[0]) {
      throw new Error("License number already exists");
    }

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, doctorData.email))
      .limit(1);

    if (existingUser[0]) {
      throw new Error("Email already exists");
    }

    const newUser = await auth.api.signUpEmail({
      body: {
        email: doctorData.email,
        password: doctorData.password,
        name: doctorData.name,
        role: "doctor",
      },
    });

    if (!newUser || !newUser.user?.id) {
      throw new Error("Failed to create user account");
    }

    await db
      .update(user)
      .set({ emailVerified: true })
      .where(eq(user.id, newUser.user.id));

    await db.insert(doctors).values({
      userId: newUser.user.id,
      licenseNumber: doctorData.licenseNumber,
      specialty: doctorData.specialty,
      departmentId: doctorData.departmentId || null,
      yearsOfExperience: doctorData.yearsOfExperience || 0,
      education: doctorData.education || null,
      certifications: doctorData.certifications || null,
      consultationFee: doctorData.consultationFee?.toString() || null,
    });

    revalidatePath("/dashboard/admin/doctors");
    return { success: true, userId: newUser.user.id };
  } catch (error) {
    console.error("Error creating doctor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateDoctor(doctorData: UpdateDoctorData) {
  try {
    await verifyAdminAccess();

    if (doctorData.name || doctorData.email) {
      await db
        .update(user)
        .set({
          ...(doctorData.name && { name: doctorData.name }),
          ...(doctorData.email && { email: doctorData.email }),
          updatedAt: new Date(),
        })
        .where(eq(user.id, doctorData.userId));
    }

    const doctorRecord = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, doctorData.userId))
      .limit(1);

    if (!doctorRecord[0]) {
      throw new Error("Doctor record not found");
    }

    if (doctorData.licenseNumber) {
      const existingLicense = await db
        .select()
        .from(doctors)
        .where(
          and(
            eq(doctors.licenseNumber, doctorData.licenseNumber),
            eq(doctors.userId, doctorData.userId)
          )
        )
        .limit(1);

      if (!existingLicense[0]) {
        const duplicateCheck = await db
          .select()
          .from(doctors)
          .where(eq(doctors.licenseNumber, doctorData.licenseNumber))
          .limit(1);

        if (duplicateCheck[0]) {
          throw new Error("License number already exists");
        }
      }
    }

    await db
      .update(doctors)
      .set({
        ...(doctorData.licenseNumber && {
          licenseNumber: doctorData.licenseNumber,
        }),
        ...(doctorData.specialty && { specialty: doctorData.specialty }),
        ...(doctorData.departmentId !== undefined && {
          departmentId: doctorData.departmentId,
        }),
        ...(doctorData.yearsOfExperience !== undefined && {
          yearsOfExperience: doctorData.yearsOfExperience,
        }),
        ...(doctorData.education !== undefined && {
          education: doctorData.education,
        }),
        ...(doctorData.certifications !== undefined && {
          certifications: doctorData.certifications,
        }),
        ...(doctorData.consultationFee !== undefined && {
          consultationFee: doctorData.consultationFee?.toString() || null,
        }),
        updatedAt: new Date(),
      })
      .where(eq(doctors.userId, doctorData.userId));

    revalidatePath("/dashboard/admin/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error updating doctor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function toggleDoctorStatus(userId: string, isActive: boolean) {
  try {
    await verifyAdminAccess();

    await db
      .update(user)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    revalidatePath("/dashboard/admin/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error toggling doctor status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getDepartments() {
  try {
    await verifyAdminAccess();

    const depts = await db.select().from(departments).orderBy(departments.name);
    return { success: true, data: depts };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export interface CreateReceptionistData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateReceptionistData {
  userId: string;
  name?: string;
  email?: string;
}

export async function getAllReceptionists(search?: string) {
  try {
    await verifyAdminAccess();

    const results = search
      ? await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })
          .from(user)
          .where(
            and(
              eq(user.role, "receptionist"),
              or(
                like(user.name, `%${search}%`),
                like(user.email, `%${search}%`)
              )
            )
          )
          .orderBy(desc(user.createdAt))
      : await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })
          .from(user)
          .where(eq(user.role, "receptionist"))
          .orderBy(desc(user.createdAt));

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching receptionists:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function createReceptionist(
  receptionistData: CreateReceptionistData
) {
  try {
    await verifyAdminAccess();

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, receptionistData.email))
      .limit(1);

    if (existingUser[0]) {
      throw new Error("Email already exists");
    }

    const newUser = await auth.api.signUpEmail({
      body: {
        email: receptionistData.email,
        password: receptionistData.password,
        name: receptionistData.name,
        role: "receptionist",
      },
    });

    if (!newUser || !newUser.user?.id) {
      throw new Error("Failed to create user account");
    }

    await db
      .update(user)
      .set({ emailVerified: true })
      .where(eq(user.id, newUser.user.id));

    revalidatePath("/dashboard/admin/receptionists");
    return { success: true, userId: newUser.user.id };
  } catch (error) {
    console.error("Error creating receptionist:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateReceptionist(
  receptionistData: UpdateReceptionistData
) {
  try {
    await verifyAdminAccess();

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, receptionistData.userId))
      .limit(1);

    if (!existingUser[0]) {
      throw new Error("Receptionist not found");
    }

    if (existingUser[0].role !== "receptionist") {
      throw new Error("User is not a receptionist");
    }

    if (
      receptionistData.email &&
      receptionistData.email !== existingUser[0].email
    ) {
      const emailExists = await db
        .select()
        .from(user)
        .where(eq(user.email, receptionistData.email))
        .limit(1);

      if (emailExists[0]) {
        throw new Error("Email already exists");
      }
    }

    await db
      .update(user)
      .set({
        ...(receptionistData.name && { name: receptionistData.name }),
        ...(receptionistData.email && { email: receptionistData.email }),
        updatedAt: new Date(),
      })
      .where(eq(user.id, receptionistData.userId));

    revalidatePath("/dashboard/admin/receptionists");
    return { success: true };
  } catch (error) {
    console.error("Error updating receptionist:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function toggleReceptionistStatus(
  userId: string,
  isActive: boolean
) {
  try {
    await verifyAdminAccess();

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!existingUser[0] || existingUser[0].role !== "receptionist") {
      throw new Error("Receptionist not found");
    }

    await db
      .update(user)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    revalidatePath("/dashboard/admin/receptionists");
    return { success: true };
  } catch (error) {
    console.error("Error toggling receptionist status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAllPatients(search?: string) {
  try {
    await verifyAdminAccess();

    const results = search
      ? await db
          .select()
          .from(patients)
          .where(
            or(
              like(patients.name, `%${search}%`),
              like(patients.email, `%${search}%`),
              like(patients.phone, `%${search}%`)
            )
          )
          .orderBy(desc(patients.createdAt))
      : await db.select().from(patients).orderBy(desc(patients.createdAt));

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function getPatientById(patientId: number) {
  try {
    await verifyAdminAccess();

    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    if (!patient[0]) {
      return {
        success: false,
        error: "Patient not found",
        data: null,
      };
    }

    const records = await db
      .select({
        id: medicalRecords.id,
        appointmentId: medicalRecords.appointmentId,
        visitDate: medicalRecords.visitDate,
        symptoms: medicalRecords.symptoms,
        diagnosis: medicalRecords.diagnosis,
        notes: medicalRecords.notes,
        followUpRequired: medicalRecords.followUpRequired,
        followUpDate: medicalRecords.followUpDate,
        createdAt: medicalRecords.createdAt,
        doctorName: user.name,
        doctorEmail: user.email,
        doctorSpecialty: doctors.specialty,
      })
      .from(medicalRecords)
      .innerJoin(doctors, eq(medicalRecords.doctorId, doctors.id))
      .innerJoin(user, eq(doctors.userId, user.id))
      .where(eq(medicalRecords.patientId, patientId))
      .orderBy(desc(medicalRecords.visitDate));

    const allPrescriptions = await db
      .select({
        id: prescriptions.id,
        medicalRecordId: prescriptions.medicalRecordId,
        medicationName: prescriptions.medicationName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency,
        duration: prescriptions.duration,
        instructions: prescriptions.instructions,
        prescribedDate: prescriptions.prescribedDate,
        isActive: prescriptions.isActive,
        createdAt: prescriptions.createdAt,
        doctorName: user.name,
        doctorEmail: user.email,
      })
      .from(prescriptions)
      .innerJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .innerJoin(user, eq(doctors.userId, user.id))
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.prescribedDate));

    const appointmentsList = await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        type: appointments.type,
        status: appointments.status,
        reason: appointments.reason,
        createdAt: appointments.createdAt,
        doctorName: user.name,
        doctorSpecialty: doctors.specialty,
      })
      .from(appointments)
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .innerJoin(user, eq(doctors.userId, user.id))
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.appointmentDate));

    return {
      success: true,
      data: {
        patient: patient[0],
        medicalRecords: records,
        prescriptions: allPrescriptions,
        appointments: appointmentsList,
      },
    };
  } catch (error) {
    console.error("Error fetching patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export async function getAllAppointmentsForAdmin(filters?: {
  dateFrom?: string;
  dateTo?: string;
  doctorId?: number;
  patientId?: number;
  status?: (typeof appointmentStatus)[number];
}) {
  try {
    await verifyAdminAccess();

    const baseQuery = db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        duration: appointments.duration,
        type: appointments.type,
        status: appointments.status,
        reason: appointments.reason,
        scheduledBy: appointments.scheduledBy,
        cancelledBy: appointments.cancelledBy,
        cancelReason: appointments.cancelReason,
        rescheduledFrom: appointments.rescheduledFrom,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        patientName: patients.name,
        patientEmail: patients.email,
        doctorName: user.name,
        doctorSpecialty: doctors.specialty,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .innerJoin(user, eq(doctors.userId, user.id));

    const conditions = [];

    if (filters?.dateFrom) {
      conditions.push(
        sql`${appointments.appointmentDate} >= ${filters.dateFrom}::date`
      );
    }
    if (filters?.dateTo) {
      conditions.push(
        sql`${appointments.appointmentDate} <= ${filters.dateTo}::date`
      );
    }
    if (filters?.doctorId) {
      conditions.push(eq(appointments.doctorId, filters.doctorId));
    }
    if (filters?.patientId) {
      conditions.push(eq(appointments.patientId, filters.patientId));
    }
    if (filters?.status) {
      conditions.push(
        eq(
          appointments.status,
          filters.status as (typeof appointmentStatus)[number]
        )
      );
    }

    const results = conditions.length
      ? await baseQuery
          .where(and(...conditions))
          .orderBy(
            desc(appointments.appointmentDate),
            appointments.appointmentTime
          )
      : await baseQuery.orderBy(
          desc(appointments.appointmentDate),
          appointments.appointmentTime
        );

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function getAppointmentByIdForAdmin(appointmentId: number) {
  try {
    await verifyAdminAccess();

    const appointment = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        duration: appointments.duration,
        type: appointments.type,
        status: appointments.status,
        reason: appointments.reason,
        scheduledBy: appointments.scheduledBy,
        cancelledBy: appointments.cancelledBy,
        cancelReason: appointments.cancelReason,
        rescheduledFrom: appointments.rescheduledFrom,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        patientName: patients.name,
        patientEmail: patients.email,
        doctorName: user.name,
        doctorSpecialty: doctors.specialty,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .innerJoin(user, eq(doctors.userId, user.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment[0]) {
      return {
        success: false,
        error: "Appointment not found",
        data: null,
      };
    }

    return { success: true, data: appointment[0] };
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export async function getDoctorsForAppointmentFilter() {
  try {
    await verifyAdminAccess();

    const results = await db
      .select({
        id: doctors.id,
        name: user.name,
        specialty: doctors.specialty,
      })
      .from(doctors)
      .innerJoin(user, eq(doctors.userId, user.id))
      .where(eq(user.isActive, true))
      .orderBy(user.name);

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function getPatientsForAppointmentFilter() {
  try {
    await verifyAdminAccess();

    const results = await db
      .select({
        id: patients.id,
        name: patients.name,
        email: patients.email,
      })
      .from(patients)
      .orderBy(patients.name);

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function getAllMedicalRecordsForAdmin(filters?: {
  dateFrom?: string;
  dateTo?: string;
  doctorId?: number;
  patientId?: number;
}) {
  try {
    await verifyAdminAccess();

    const baseQuery = db
      .select({
        id: medicalRecords.id,
        appointmentId: medicalRecords.appointmentId,
        patientId: medicalRecords.patientId,
        doctorId: medicalRecords.doctorId,
        visitDate: medicalRecords.visitDate,
        symptoms: medicalRecords.symptoms,
        diagnosis: medicalRecords.diagnosis,
        notes: medicalRecords.notes,
        followUpRequired: medicalRecords.followUpRequired,
        followUpDate: medicalRecords.followUpDate,
        createdAt: medicalRecords.createdAt,
        updatedAt: medicalRecords.updatedAt,
        patientName: patients.name,
        patientEmail: patients.email,
        doctorName: user.name,
        doctorSpecialty: doctors.specialty,
      })
      .from(medicalRecords)
      .innerJoin(patients, eq(medicalRecords.patientId, patients.id))
      .innerJoin(doctors, eq(medicalRecords.doctorId, doctors.id))
      .innerJoin(user, eq(doctors.userId, user.id));

    const conditions = [];

    if (filters?.dateFrom) {
      conditions.push(
        sql`DATE(${medicalRecords.visitDate}) >= ${filters.dateFrom}::date`
      );
    }
    if (filters?.dateTo) {
      conditions.push(
        sql`DATE(${medicalRecords.visitDate}) <= ${filters.dateTo}::date`
      );
    }
    if (filters?.doctorId) {
      conditions.push(eq(medicalRecords.doctorId, filters.doctorId));
    }
    if (filters?.patientId) {
      conditions.push(eq(medicalRecords.patientId, filters.patientId));
    }

    const results = conditions.length
      ? await baseQuery
          .where(and(...conditions))
          .orderBy(desc(medicalRecords.visitDate))
      : await baseQuery.orderBy(desc(medicalRecords.visitDate));

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function getAllPrescriptionsForAdmin(filters?: {
  dateFrom?: string;
  dateTo?: string;
  doctorId?: number;
  patientId?: number;
  isActive?: boolean;
}) {
  try {
    await verifyAdminAccess();

    const baseQuery = db
      .select({
        id: prescriptions.id,
        medicalRecordId: prescriptions.medicalRecordId,
        patientId: prescriptions.patientId,
        doctorId: prescriptions.doctorId,
        medicationName: prescriptions.medicationName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency,
        duration: prescriptions.duration,
        instructions: prescriptions.instructions,
        prescribedDate: prescriptions.prescribedDate,
        isActive: prescriptions.isActive,
        createdAt: prescriptions.createdAt,
        updatedAt: prescriptions.updatedAt,
        patientName: patients.name,
        patientEmail: patients.email,
        doctorName: user.name,
        doctorSpecialty: doctors.specialty,
      })
      .from(prescriptions)
      .innerJoin(patients, eq(prescriptions.patientId, patients.id))
      .innerJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .innerJoin(user, eq(doctors.userId, user.id));

    const conditions = [];

    if (filters?.dateFrom) {
      conditions.push(
        sql`DATE(${prescriptions.prescribedDate}) >= ${filters.dateFrom}::date`
      );
    }
    if (filters?.dateTo) {
      conditions.push(
        sql`DATE(${prescriptions.prescribedDate}) <= ${filters.dateTo}::date`
      );
    }
    if (filters?.doctorId) {
      conditions.push(eq(prescriptions.doctorId, filters.doctorId));
    }
    if (filters?.patientId) {
      conditions.push(eq(prescriptions.patientId, filters.patientId));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(prescriptions.isActive, filters.isActive));
    }

    const results = conditions.length
      ? await baseQuery
          .where(and(...conditions))
          .orderBy(desc(prescriptions.prescribedDate))
      : await baseQuery.orderBy(desc(prescriptions.prescribedDate));

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}
