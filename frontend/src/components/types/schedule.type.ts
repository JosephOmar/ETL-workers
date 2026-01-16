import type { Attendance } from "./attendance.type";

export interface Schedule {
    start_date_pe: string;
    end_date_pe: string;
    start_time_pe: string;
    end_time_pe: string;
    break_start_date_pe: string;
    break_end_date_pe: string;
    break_start_time_pe: string;
    break_end_time_pe: string;
    start_date_es: string;
    end_date_es: string;
    start_time_es: string;
    end_time_es: string;
    break_start_date_es: string;
    break_end_date_es: string;
    break_start_time_es: string;
    break_end_time_es: string;
    is_rest_day: boolean;
    obs: string;
    attendances: Attendance[];
}