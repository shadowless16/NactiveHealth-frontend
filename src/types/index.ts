export type UserRole = 'doctor' | 'nurse' | 'admin';

export interface User {
  id: number;
  username: string;
  role: UserRole;
}

export interface Patient {
  id: number;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  created_at?: string;
}

export interface Encounter {
  id: number;
  patient_id: number;
  clinician_role: string;
  notes?: string;
  created_at?: string;
}

export interface Prescription {
  id: number;
  encounter_id: number;
  drug_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  created_by: number;
  created_at?: string;
  prescribed_by?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface PatientRecords {
  patient: Patient;
  encounters: Encounter[];
  prescriptions: Prescription[];
}
