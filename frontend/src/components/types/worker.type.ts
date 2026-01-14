import type { Schedule } from "./schedule.type";
import type { Attendance } from "./attendance.type";

// Definir tipos para los objetos que tienen subestructuras
interface Role {
    name: string;
}

interface Status {
    name: string;
}

interface Campaign {
    name: string;
}

interface Team {
    name: string;
}

interface WorkType {
    name: string;
}

interface ContractType {
    name: string;
}

export interface Worker {
    document: string;
    name: string;
    role: Role;
    status: Status;
    campaign: Campaign;
    team: Team;
    work_type: WorkType;
    contract_type: ContractType;
    manager: string;
    supervisor: string;
    coordinator: string;
    start_date: string;
    termination_date?: string; 
    requirement_id?: string;
    api_id?: string;
    api_name?: string;
    api_email?: string;
    observation_1?: string;
    observation_2?: string;
    tenure: number;
    trainee: string;
    productive: string;
    schedules: Schedule[];
    attendances: Attendance[];
}
