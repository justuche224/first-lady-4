# Role-Based Access Control - Implementation Guide

This document outlines the specific capabilities and permissions for each user role in the Patient Information Management System.

---

## 🔐 Administrator (`admin`)

### User Account Management

- **Create Staff Accounts**

  - Create new user accounts for doctors and receptionists
  - Set initial role (doctor or receptionist)
  - Set initial email verification status
  - Assign email and password credentials

- **Edit Staff Accounts**

  - Update user name, email, and profile image
  - Change user role (promote/demote between doctor and receptionist)
  - Update account details

- **Disable/Enable Staff Accounts**

  - Set `isActive` flag to `false` to disable accounts (prevents login)
  - Set `isActive` flag to `true` to re-enable accounts
  - View list of all active/inactive staff accounts

- **View All Staff Accounts**
  - List all users (doctors and receptionists)
  - View account status (active/inactive)
  - View account creation and last update timestamps

### System Access

- Full access to all system modules
- Can view all patient records (read-only access)
- Can view all appointments and medical records (read-only access)

---

## 👩‍💼 Medical Receptionist (`receptionist`)

### Patient Management

- **Register New Patient**

  - Create new patient records in the system
  - Enter patient demographics:
    - Name (required)
    - Email (required, unique)
    - Date of birth
    - Gender
    - Phone number
    - Address
  - Enter emergency contact information:
    - Emergency contact name
    - Emergency contact phone
  - Enter medical information:
    - Blood type
    - Known allergies
    - Medical history
  - Enter insurance information:
    - Insurance provider
    - Insurance number

- **Search/View Patient**

  - Search patients by:
    - Name
    - Email
    - Phone number
    - Patient ID
  - View complete patient demographic information
  - View patient's basic medical information (allergies, blood type)
  - View patient's insurance information
  - View patient registration date and last update timestamp

- **Update Patient Records**
  - Edit patient demographic information
  - Update contact details (phone, address, email)
  - Update emergency contact information
  - Update medical information (allergies, medical history)
  - Update insurance information

### Appointment Management

- **Schedule Appointment**

  - Create new appointments for patients
  - Select patient from system
  - Select doctor from available doctors
  - Set appointment date and time
  - Set appointment duration (default: 30 minutes)
  - Set appointment type (consultation, follow-up, checkup, etc.)
  - Enter reason for visit
  - Set initial status (scheduled, confirmed)
  - System automatically records `scheduledBy` field with receptionist's user ID

- **View Appointments**

  - View all scheduled appointments
  - Filter appointments by:
    - Date range
    - Doctor
    - Patient
    - Status (scheduled, confirmed, completed, cancelled, no_show)
  - View appointment details (date, time, reason, status)

- **Manage Appointments**
  - Update appointment details (date, time, reason)
  - Cancel appointments (with reason)
  - Reschedule appointments
  - Update appointment status (e.g., mark as confirmed)
  - System records `cancelledBy` field when cancelling

### Restrictions

- **Cannot:**
  - View or create medical records (visit notes, diagnosis)
  - Prescribe medications
  - Access doctor-specific features
  - Manage user accounts
  - View prescription history

---

## 👨‍⚕️ Doctor (`doctor`)

### Patient Management

- **Search/View Patient**

  - Search patients by:
    - Name
    - Email
    - Phone number
    - Patient ID
  - Access complete patient records including:
    - All demographic information
    - Complete medical history
    - Allergies and blood type
    - Insurance information

- **View Patient Medical History**
  - View all past medical records/visits
  - View all past appointments (completed)
  - View all past prescriptions
  - View symptoms, diagnoses, and notes from previous visits
  - View follow-up requirements and dates

### Medical Records Management

- **Create Medical Records**

  - Create medical record when appointment is completed
  - Link medical record to appointment (`appointmentId`)
  - Enter visit information:
    - Symptoms reported by patient
    - Diagnosis
    - Doctor's notes and observations
    - Follow-up requirements
    - Follow-up date (if needed)
  - System automatically records:
    - `visitDate` (timestamp)
    - `doctorId` (current doctor's ID)
    - `patientId` (from appointment)

- **Update Medical Records**
  - Edit existing medical records (own records only)
  - Update diagnosis
  - Add additional notes
  - Update follow-up information

### Prescription Management

- **Prescribe Medication**

  - Add new prescriptions linked to medical records
  - Enter medication details:
    - Medication name (required)
    - Dosage (e.g., "500mg", "2 tablets") (required)
    - Frequency (e.g., "twice daily", "once a day") (required)
    - Duration (e.g., "7 days", "2 weeks") (required)
    - Additional instructions (optional)
  - System automatically records:
    - `prescribedDate` (timestamp)
    - `doctorId` (current doctor's ID)
    - `patientId` (from medical record)
    - `medicalRecordId` (link to visit record)
    - `isActive` (default: true)

- **View Prescriptions**

  - View all prescriptions for a patient
  - View active prescriptions (`isActive = true`)
  - View prescription history
  - View prescription details (medication, dosage, frequency, duration, instructions)

- **Manage Prescriptions**
  - Mark prescriptions as inactive (`isActive = false`) when no longer needed
  - Update prescription details if needed

### Appointment Management

- **View Appointment Schedule**

  - View daily patient appointments
  - View upcoming appointments (future dates)
  - Filter appointments by:
    - Date range
    - Status
    - Patient
  - View appointment details:
    - Patient information
    - Appointment date and time
    - Reason for visit
    - Appointment type
    - Status

- **Update Appointment Status**
  - Mark appointments as completed (when visit is finished)
  - Mark appointments as "no_show" if patient doesn't arrive
  - Update appointment notes

### Restrictions

- **Cannot:**
  - Register new patients (receptionist only)
  - Schedule new appointments (receptionist only)
  - Manage user accounts (admin only)
  - Edit patient demographic information (receptionist only)
  - Cancel appointments (receptionist only)

---

## 🔒 Security & Access Control Notes

### Authentication

- Only staff members (admin, doctor, receptionist) can login to the system
- Patients **cannot** login and do not have user accounts
- All user accounts must have a valid role assigned
- Inactive accounts (`isActive = false`) cannot login

### Data Access

- All actions are logged with timestamps (`createdAt`, `updatedAt`)
- User IDs are tracked for audit purposes (`scheduledBy`, `cancelledBy`, `doctorId`)
- Cascade deletes ensure data integrity when patients or doctors are removed

### Role Validation

- All API endpoints and UI components should validate user role before allowing actions
- Role checks should be performed both on the frontend (UX) and backend (security)
- Return appropriate error messages for unauthorized access attempts

---

## 📋 Implementation Checklist

### Administrator Features

- [ ] User account creation form
- [ ] User account edit form
- [ ] User account list view
- [ ] Enable/disable account toggle
- [ ] Role assignment dropdown
- [ ] User search and filtering

### Receptionist Features

- [ ] Patient registration form
- [ ] Patient search functionality
- [ ] Patient detail view
- [ ] Patient edit form
- [ ] Appointment scheduling form
- [ ] Appointment list view
- [ ] Appointment edit/cancel functionality
- [ ] Appointment filtering and search

### Doctor Features

- [ ] Patient search functionality
- [ ] Patient detail view with full history
- [ ] Medical record creation form
- [ ] Medical record edit form
- [ ] Prescription creation form
- [ ] Prescription list view
- [ ] Prescription management (activate/deactivate)
- [ ] Appointment schedule view
- [ ] Appointment status update functionality

### Shared Features

- [ ] Role-based navigation menu
- [ ] Dashboard views per role
- [ ] Authentication and session management
- [ ] Error handling for unauthorized actions
- [ ] Audit logging for sensitive operations
