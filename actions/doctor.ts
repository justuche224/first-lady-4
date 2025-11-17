"use server";

import { db } from "@/db";
import {
  appointments,
  medicalRecords,
  prescriptions,
  doctors,
  patients,
} from "@/db/schema";
import { count, eq, and, sql, or, like, desc, inArray } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";

async function verifyDoctorAccess() {
  const session = await serverAuth();
  if (!session || session.user.role !== "doctor") {
    throw new Error("Unauthorized: Doctor access required");
  }
  return session;
}

async function getDoctorId(): Promise<number> {
  const session = await verifyDoctorAccess();

  const doctorRecord = await db
    .select({ id: doctors.id })
    .from(doctors)
    .where(eq(doctors.userId, session.user.id))
    .limit(1);

  if (!doctorRecord[0]) {
    throw new Error("Doctor record not found");
  }

  return doctorRecord[0].id;
}

export async function getDoctorDashboardStats() {
  try {
    const session = await verifyDoctorAccess();

    const doctorRecord = await db
      .select({ id: doctors.id })
      .from(doctors)
      .where(eq(doctors.userId, session.user.id))
      .limit(1);

    if (!doctorRecord[0]) {
      throw new Error("Doctor record not found");
    }

    const doctorId = doctorRecord[0].id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const todayAppointmentsResult = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          sql`${appointments.appointmentDate} = ${todayStr}::date`,
          sql`${appointments.status} IN ('scheduled', 'confirmed')`
        )
      );

    const upcomingAppointmentsResult = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          sql`${appointments.appointmentDate} >= ${tomorrowStr}::date`,
          sql`${appointments.status} IN ('scheduled', 'confirmed')`
        )
      );

    const totalPatientsSeenResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${medicalRecords.patientId})::int`,
      })
      .from(medicalRecords)
      .where(eq(medicalRecords.doctorId, doctorId));

    const totalMedicalRecordsResult = await db
      .select({ count: count() })
      .from(medicalRecords)
      .where(eq(medicalRecords.doctorId, doctorId));

    const totalPrescriptionsResult = await db
      .select({ count: count() })
      .from(prescriptions)
      .where(eq(prescriptions.doctorId, doctorId));

    const activePrescriptionsResult = await db
      .select({ count: count() })
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.doctorId, doctorId),
          eq(prescriptions.isActive, true)
        )
      );

    return {
      todayAppointments: todayAppointmentsResult[0]?.count ?? 0,
      upcomingAppointments: upcomingAppointmentsResult[0]?.count ?? 0,
      totalPatientsSeen: totalPatientsSeenResult[0]?.count ?? 0,
      totalMedicalRecords: totalMedicalRecordsResult[0]?.count ?? 0,
      totalPrescriptions: totalPrescriptionsResult[0]?.count ?? 0,
      activePrescriptions: activePrescriptionsResult[0]?.count ?? 0,
    };
  } catch (error) {
    console.error("Error fetching doctor dashboard stats:", error);
    return {
      todayAppointments: 0,
      upcomingAppointments: 0,
      totalPatientsSeen: 0,
      totalMedicalRecords: 0,
      totalPrescriptions: 0,
      activePrescriptions: 0,
    };
  }
}

export async function getDoctorPatients(search?: string) {
  try {
    const doctorId = await getDoctorId();

    // Get unique patient IDs from appointments and medical records
    const appointmentPatients = await db
      .selectDistinct({ patientId: appointments.patientId })
      .from(appointments)
      .where(eq(appointments.doctorId, doctorId));

    const medicalRecordPatients = await db
      .selectDistinct({ patientId: medicalRecords.patientId })
      .from(medicalRecords)
      .where(eq(medicalRecords.doctorId, doctorId));

    const patientIds = [
      ...new Set([
        ...appointmentPatients.map((p) => p.patientId),
        ...medicalRecordPatients.map((p) => p.patientId),
      ]),
    ];

    if (patientIds.length === 0) {
      return { success: true, data: [] };
    }

    const results = search
      ? await db
          .select()
          .from(patients)
          .where(
            and(
              inArray(patients.id, patientIds),
              or(
                like(patients.name, `%${search}%`),
                like(patients.email, `%${search}%`),
                like(patients.phone, `%${search}%`)
              )
            )
          )
          .orderBy(desc(patients.createdAt))
      : await db
          .select()
          .from(patients)
          .where(inArray(patients.id, patientIds))
          .orderBy(desc(patients.createdAt));

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching doctor patients:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function getDoctorPatientById(patientId: number) {
  try {
    const doctorId = await getDoctorId();

    // Verify doctor has access to this patient (has appointment or medical record)
    const appointmentCheck = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.patientId, patientId)
        )
      );

    const medicalRecordCheck = await db
      .select({ count: count() })
      .from(medicalRecords)
      .where(
        and(
          eq(medicalRecords.doctorId, doctorId),
          eq(medicalRecords.patientId, patientId)
        )
      );

    const hasAccess =
      (appointmentCheck[0]?.count ?? 0) > 0 ||
      (medicalRecordCheck[0]?.count ?? 0) > 0;

    if (!hasAccess) {
      return {
        success: false,
        error: "Patient not found or access denied",
        data: null,
      };
    }

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

    // Get medical records for this patient by this doctor
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
      })
      .from(medicalRecords)
      .where(
        and(
          eq(medicalRecords.patientId, patientId),
          eq(medicalRecords.doctorId, doctorId)
        )
      )
      .orderBy(desc(medicalRecords.visitDate));

    // Get prescriptions for this patient by this doctor
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
      })
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.patientId, patientId),
          eq(prescriptions.doctorId, doctorId)
        )
      )
      .orderBy(desc(prescriptions.prescribedDate));

    // Get appointments for this patient with this doctor
    const appointmentsList = await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        type: appointments.type,
        status: appointments.status,
        reason: appointments.reason,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.patientId, patientId),
          eq(appointments.doctorId, doctorId)
        )
      )
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
    console.error("Error fetching doctor patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export async function getDoctorAppointments(filters?: {
  dateFrom?: string;
  dateTo?: string;
  patientId?: number;
  status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
}) {
  try {
    const doctorId = await getDoctorId();

    const conditions = [eq(appointments.doctorId, doctorId)];

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
    if (filters?.patientId) {
      conditions.push(eq(appointments.patientId, filters.patientId));
    }
    if (filters?.status) {
      conditions.push(eq(appointments.status, filters.status));
    }

    const results = await db
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
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .where(and(...conditions))
      .orderBy(
        desc(appointments.appointmentDate),
        appointments.appointmentTime
      );

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function updateAppointmentStatus(
  appointmentId: number,
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
) {
  try {
    const doctorId = await getDoctorId();
    const session = await verifyDoctorAccess();

    // Verify the appointment belongs to this doctor
    const appointment = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.doctorId, doctorId)
        )
      )
      .limit(1);

    if (!appointment[0]) {
      return {
        success: false,
        error: "Appointment not found or access denied",
      };
    }

    await db
      .update(appointments)
      .set({
        status,
        updatedAt: new Date(),
        ...(status === "cancelled" && {
          cancelledBy: session.user.id,
        }),
      })
      .where(eq(appointments.id, appointmentId));

    return { success: true };
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getDoctorPatientsForFilter() {
  try {
    const doctorId = await getDoctorId();

    // Get unique patient IDs from appointments
    const appointmentPatients = await db
      .selectDistinct({ patientId: appointments.patientId })
      .from(appointments)
      .where(eq(appointments.doctorId, doctorId));

    const patientIds = appointmentPatients.map((p) => p.patientId);

    if (patientIds.length === 0) {
      return { success: true, data: [] };
    }

    const results = await db
      .select({
        id: patients.id,
        name: patients.name,
        email: patients.email,
      })
      .from(patients)
      .where(inArray(patients.id, patientIds))
      .orderBy(patients.name);

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching doctor patients for filter:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export interface CreateMedicalRecordData {
  appointmentId: number;
  symptoms?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  followUpRequired?: boolean;
  followUpDate?: string | null;
}

export async function getDoctorMedicalRecords(filters?: {
  dateFrom?: string;
  dateTo?: string;
  patientId?: number;
}) {
  try {
    const doctorId = await getDoctorId();

    const conditions = [eq(medicalRecords.doctorId, doctorId)];

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
    if (filters?.patientId) {
      conditions.push(eq(medicalRecords.patientId, filters.patientId));
    }

    const results = await db
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
      })
      .from(medicalRecords)
      .innerJoin(patients, eq(medicalRecords.patientId, patients.id))
      .where(and(...conditions))
      .orderBy(desc(medicalRecords.visitDate));

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching doctor medical records:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function getAppointmentsForMedicalRecord() {
  try {
    const doctorId = await getDoctorId();

    // Get completed appointments that don't have medical records yet
    const appointmentsWithRecords = await db
      .selectDistinct({ appointmentId: medicalRecords.appointmentId })
      .from(medicalRecords)
      .where(eq(medicalRecords.doctorId, doctorId));

    const appointmentIdsWithRecords = appointmentsWithRecords.map(
      (r) => r.appointmentId
    );

    const conditions = [
      eq(appointments.doctorId, doctorId),
      eq(appointments.status, "completed"),
    ];

    if (appointmentIdsWithRecords.length > 0) {
      conditions.push(
        sql`${appointments.id} NOT IN (${sql.join(
          appointmentIdsWithRecords.map((id) => sql`${id}`),
          sql`, `
        )})`
      );
    }

    const results = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        type: appointments.type,
        reason: appointments.reason,
        status: appointments.status,
        patientName: patients.name,
        patientEmail: patients.email,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .where(and(...conditions))
      .orderBy(
        desc(appointments.appointmentDate),
        appointments.appointmentTime
      );

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching appointments for medical record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function createMedicalRecord(data: CreateMedicalRecordData) {
  try {
    const doctorId = await getDoctorId();

    // Verify the appointment belongs to this doctor and is completed
    const appointment = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        status: appointments.status,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.id, data.appointmentId),
          eq(appointments.doctorId, doctorId)
        )
      )
      .limit(1);

    if (!appointment[0]) {
      return {
        success: false,
        error: "Appointment not found or access denied",
      };
    }

    if (appointment[0].status !== "completed") {
      return {
        success: false,
        error: "Medical records can only be created for completed appointments",
      };
    }

    // Check if medical record already exists for this appointment
    const existingRecord = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.appointmentId, data.appointmentId))
      .limit(1);

    if (existingRecord[0]) {
      return {
        success: false,
        error: "Medical record already exists for this appointment",
      };
    }

    await db.insert(medicalRecords).values({
      appointmentId: data.appointmentId,
      patientId: appointment[0].patientId,
      doctorId: doctorId,
      symptoms: data.symptoms || null,
      diagnosis: data.diagnosis || null,
      notes: data.notes || null,
      followUpRequired: data.followUpRequired || false,
      followUpDate: data.followUpDate || null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating medical record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export interface CreatePrescriptionData {
  medicalRecordId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
}

export async function getDoctorPrescriptions(filters?: {
  dateFrom?: string;
  dateTo?: string;
  patientId?: number;
  isActive?: boolean;
}) {
  try {
    const doctorId = await getDoctorId();

    const conditions = [eq(prescriptions.doctorId, doctorId)];

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
    if (filters?.patientId) {
      conditions.push(eq(prescriptions.patientId, filters.patientId));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(prescriptions.isActive, filters.isActive));
    }

    const results = await db
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
      })
      .from(prescriptions)
      .innerJoin(patients, eq(prescriptions.patientId, patients.id))
      .where(and(...conditions))
      .orderBy(desc(prescriptions.prescribedDate));

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching doctor prescriptions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function createPrescription(data: CreatePrescriptionData) {
  try {
    const doctorId = await getDoctorId();

    // Verify the medical record belongs to this doctor
    const medicalRecord = await db
      .select({
        id: medicalRecords.id,
        patientId: medicalRecords.patientId,
        doctorId: medicalRecords.doctorId,
      })
      .from(medicalRecords)
      .where(
        and(
          eq(medicalRecords.id, data.medicalRecordId),
          eq(medicalRecords.doctorId, doctorId)
        )
      )
      .limit(1);

    if (!medicalRecord[0]) {
      return {
        success: false,
        error: "Medical record not found or access denied",
      };
    }

    await db.insert(prescriptions).values({
      medicalRecordId: data.medicalRecordId,
      patientId: medicalRecord[0].patientId,
      doctorId: doctorId,
      medicationName: data.medicationName,
      dosage: data.dosage,
      frequency: data.frequency,
      duration: data.duration,
      instructions: data.instructions || null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating prescription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function togglePrescriptionStatus(
  prescriptionId: number,
  isActive: boolean
) {
  try {
    const doctorId = await getDoctorId();

    // Verify the prescription belongs to this doctor
    const prescription = await db
      .select()
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.id, prescriptionId),
          eq(prescriptions.doctorId, doctorId)
        )
      )
      .limit(1);

    if (!prescription[0]) {
      return {
        success: false,
        error: "Prescription not found or access denied",
      };
    }

    await db
      .update(prescriptions)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(prescriptions.id, prescriptionId));

    return { success: true };
  } catch (error) {
    console.error("Error toggling prescription status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getMedicalRecordsForPrescription() {
  try {
    const doctorId = await getDoctorId();

    const results = await db
      .select({
        id: medicalRecords.id,
        appointmentId: medicalRecords.appointmentId,
        patientId: medicalRecords.patientId,
        visitDate: medicalRecords.visitDate,
        diagnosis: medicalRecords.diagnosis,
        patientName: patients.name,
        patientEmail: patients.email,
      })
      .from(medicalRecords)
      .innerJoin(patients, eq(medicalRecords.patientId, patients.id))
      .where(eq(medicalRecords.doctorId, doctorId))
      .orderBy(desc(medicalRecords.visitDate));

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching medical records for prescription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}
