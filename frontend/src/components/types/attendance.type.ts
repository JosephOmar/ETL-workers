export interface Attendance {
    api_email: string;
    date: string;
    check_in: string;
    check_out: string;
    status: string;
    time_aux_productive: number;
    time_aux_non_productive: number;
    adherence: number;
    time_outside_scheduled: number
}