export interface Attendance {
    api_email: string;
    date: string;
    check_in: string;
    check_out: string;
    status: string;

    time_aux_productive: number;
    time_aux_no_productive: number;
    adherence: number;


    left_early: boolean
    early_leave_minutes: number

    early_login: boolean
    early_login_minutes: number;

    late_logout: boolean
    late_logout_minutes: number

    late_login: boolean
    late_login_minutes: number
}