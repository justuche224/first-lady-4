"use server";

import { db } from "@/db";
import { patients, appointments, doctors, user } from "@/db/schema";
import { count, eq, and, sql, like, or, desc } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";
import { appointmentStatus } from "@/db/schema";

async function verifyReceptionistAccess() {
  const session = await serverAuth();
  if (!session || session.user.role !== "receptionist") {
    throw new Error("Unauthorized: Receptionist access required");
  }
  return session;
}

export async function getReceptionistDashboardStats() {
  try {
    const session = await verifyReceptionistAccess();

    const totalPatientsResult = await db
      .select({ count: count() })
      .from(patients);

    const totalAppointmentsResult = await db
      .select({ count: count() })
      .from(appointments);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const todayAppointmentsResult = await db
      .select({ count: count() })
      .from(appointments)
      .where(sql`${appointments.appointmentDate} = ${todayStr}::date`);

    const upcomingAppointmentsResult = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          sql`${appointments.appointmentDate} >= ${tomorrowStr}::date`,
          sql`${appointments.status} IN ('scheduled', 'confirmed')`
        )
      );

    const scheduledByMeResult = await db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.scheduledBy, session.user.id));

    return {
      totalPatients: totalPatientsResult[0]?.count ?? 0,
      totalAppointments: totalAppointmentsResult[0]?.count ?? 0,
      todayAppointments: todayAppointmentsResult[0]?.count ?? 0,
      upcomingAppointments: upcomingAppointmentsResult[0]?.count ?? 0,
      scheduledByMe: scheduledByMeResult[0]?.count ?? 0,
    };
  } catch (error) {
    console.error("Error fetching receptionist dashboard stats:", error);
    return {
      totalPatients: 0,
      totalAppointments: 0,
      todayAppointments: 0,
      upcomingAppointments: 0,
      scheduledByMe: 0,
    };
  }
}

export interface CreatePatientData {
  name: string;
  email: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phone?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  bloodType?: string | null;
  allergies?: string | null;
  medicalHistory?: string | null;
  insuranceProvider?: string | null;
  insuranceNumber?: string | null;
}

export interface UpdatePatientData {
  id: number;
  name?: string;
  email?: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phone?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  bloodType?: string | null;
  allergies?: string | null;
  medicalHistory?: string | null;
  insuranceProvider?: string | null;
  insuranceNumber?: string | null;
}

export async function getAllPatients(search?: string) {
  try {
    await verifyReceptionistAccess();

    const results = search
      ? await db
          .select()
          .from(patients)
          .where(
            or(
              like(patients.name, `%${search}%`),
              like(patients.email, `%${search}%`),
              like(patients.phone, `%${search}%`),
              sql`CAST(${patients.id} AS TEXT) LIKE ${`%${search}%`}`
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
    await verifyReceptionistAccess();

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

    return { success: true, data: patient[0] };
  } catch (error) {
    console.error("Error fetching patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export async function createPatient(patientData: CreatePatientData) {
  try {
    await verifyReceptionistAccess();

    const existingPatient = await db
      .select()
      .from(patients)
      .where(eq(patients.email, patientData.email))
      .limit(1);

    if (existingPatient[0]) {
      throw new Error("Email already exists");
    }

    await db.insert(patients).values({
      name: patientData.name,
      email: patientData.email,
      dateOfBirth: patientData.dateOfBirth || null,
      gender: patientData.gender || null,
      phone: patientData.phone || null,
      address: patientData.address || null,
      emergencyContact: patientData.emergencyContact || null,
      emergencyPhone: patientData.emergencyPhone || null,
      bloodType: patientData.bloodType || null,
      allergies: patientData.allergies || null,
      medicalHistory: patientData.medicalHistory || null,
      insuranceProvider: patientData.insuranceProvider || null,
      insuranceNumber: patientData.insuranceNumber || null,
    });

    revalidatePath("/dashboard/receptionist/patients");
    return { success: true };
  } catch (error) {
    console.error("Error creating patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updatePatient(patientData: UpdatePatientData) {
  try {
    await verifyReceptionistAccess();

    const existingPatient = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientData.id))
      .limit(1);

    if (!existingPatient[0]) {
      throw new Error("Patient not found");
    }

    if (patientData.email && patientData.email !== existingPatient[0].email) {
      const emailExists = await db
        .select()
        .from(patients)
        .where(eq(patients.email, patientData.email))
        .limit(1);

      if (emailExists[0]) {
        throw new Error("Email already exists");
      }
    }

    await db
      .update(patients)
      .set({
        ...(patientData.name && { name: patientData.name }),
        ...(patientData.email && { email: patientData.email }),
        ...(patientData.dateOfBirth !== undefined && {
          dateOfBirth: patientData.dateOfBirth,
        }),
        ...(patientData.gender !== undefined && {
          gender: patientData.gender,
        }),
        ...(patientData.phone !== undefined && { phone: patientData.phone }),
        ...(patientData.address !== undefined && {
          address: patientData.address,
        }),
        ...(patientData.emergencyContact !== undefined && {
          emergencyContact: patientData.emergencyContact,
        }),
        ...(patientData.emergencyPhone !== undefined && {
          emergencyPhone: patientData.emergencyPhone,
        }),
        ...(patientData.bloodType !== undefined && {
          bloodType: patientData.bloodType,
        }),
        ...(patientData.allergies !== undefined && {
          allergies: patientData.allergies,
        }),
        ...(patientData.medicalHistory !== undefined && {
          medicalHistory: patientData.medicalHistory,
        }),
        ...(patientData.insuranceProvider !== undefined && {
          insuranceProvider: patientData.insuranceProvider,
        }),
        ...(patientData.insuranceNumber !== undefined && {
          insuranceNumber: patientData.insuranceNumber,
        }),
        updatedAt: new Date(),
      })
      .where(eq(patients.id, patientData.id));

    revalidatePath("/dashboard/receptionist/patients");
    revalidatePath(`/dashboard/receptionist/patients/${patientData.id}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export interface CreateAppointmentData {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  duration?: number;
  type: string;
  reason?: string | null;
  status?: "scheduled" | "confirmed";
}

export interface UpdateAppointmentData {
  id: number;
  appointmentDate?: string;
  appointmentTime?: string;
  duration?: number;
  type?: string;
  reason?: string | null;
  status?: (typeof appointmentStatus)[number];
}

export interface CancelAppointmentData {
  id: number;
  cancelReason: string;
}

export async function getDoctorsForAppointment() {
  try {
    await verifyReceptionistAccess();

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

export async function getAllAppointments(filters?: {
  dateFrom?: string;
  dateTo?: string;
  doctorId?: number;
  patientId?: number;
  status?: (typeof appointmentStatus)[number];
}) {
  try {
    await verifyReceptionistAccess();

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
      conditions.push(eq(appointments.status, filters.status));
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

export async function getAppointmentById(appointmentId: number) {
  try {
    await verifyReceptionistAccess();

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

export async function createAppointment(
  appointmentData: CreateAppointmentData
) {
  try {
    const session = await verifyReceptionistAccess();

    await db.insert(appointments).values({
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      duration: appointmentData.duration || 30,
      type: appointmentData.type,
      reason: appointmentData.reason || null,
      status: appointmentData.status || "scheduled",
      scheduledBy: session.user.id,
    });

    revalidatePath("/dashboard/receptionist/appointments");
    return { success: true };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateAppointment(
  appointmentData: UpdateAppointmentData
) {
  try {
    await verifyReceptionistAccess();

    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentData.id))
      .limit(1);

    if (!existingAppointment[0]) {
      throw new Error("Appointment not found");
    }

    await db
      .update(appointments)
      .set({
        ...(appointmentData.appointmentDate && {
          appointmentDate: appointmentData.appointmentDate,
        }),
        ...(appointmentData.appointmentTime && {
          appointmentTime: appointmentData.appointmentTime,
        }),
        ...(appointmentData.duration !== undefined && {
          duration: appointmentData.duration,
        }),
        ...(appointmentData.type && { type: appointmentData.type }),
        ...(appointmentData.reason !== undefined && {
          reason: appointmentData.reason,
        }),
        ...(appointmentData.status && { status: appointmentData.status }),
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentData.id));

    revalidatePath("/dashboard/receptionist/appointments");
    revalidatePath(
      `/dashboard/receptionist/appointments/${appointmentData.id}`
    );
    return { success: true };
  } catch (error) {
    console.error("Error updating appointment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function cancelAppointment(
  appointmentData: CancelAppointmentData
) {
  try {
    const session = await verifyReceptionistAccess();

    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentData.id))
      .limit(1);

    if (!existingAppointment[0]) {
      throw new Error("Appointment not found");
    }

    await db
      .update(appointments)
      .set({
        status: "cancelled",
        cancelledBy: session.user.id,
        cancelReason: appointmentData.cancelReason,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentData.id));

    revalidatePath("/dashboard/receptionist/appointments");
    revalidatePath(
      `/dashboard/receptionist/appointments/${appointmentData.id}`
    );
    return { success: true };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
