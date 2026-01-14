# Definir las variables para los nombres de las columnas
DOCUMENT = "document"
NAME = "name"
ROLE = "role"
STATUS = "status"
CAMPAIGN = "campaign"
TEAM = "team"
MANAGER = "manager"
SUPERVISOR = "supervisor"
COORDINATOR = "coordinator"
WORK_TYPE = "work_type"
START_DATE = "start_date"
TERMINATION_DATE = "termination_date"
CONTRACT_TYPE = "contract_type"
REQUIREMENT_ID = "requirement_id"
API_ID = "api_id"
API_NAME = "api_name"
API_EMAIL = "api_email"
TENURE = "tenure"
TRAINEE = 'trainee'
OBSERVATION_1 = 'observation_1'
OBSERVATION_2 = 'observation_2'
PRODUCTIVE = 'productive'

#DATA PEOPLE
EMPLOYEE_NAME = "employee_name"
FATHER_LAST_NAME = "father_last_name"
MOTHER_LAST_NAME = "mother_last_name"

#TEAMS
CHAT_CUSTOMER = "CUSTOMER"
CHAT_RIDER = "RIDER"
MAIL_CUSTOMER = "CUSTOMER"
MAIL_RIDER = "RIDER"
MAIL_VENDORS = "VENDOR"
UPDATE = "UPDATE"
CALL_VENDORS = "VENDOR"
GLOVO_SPAIN = "GLOVO ESPAÑA"
GERENCIA = "GERENCIA"

#! HORARIOS
START_DATE_PE = 'start_date_pe'
END_DATE_PE = 'end_date_pe'
START_TIME_PE = 'start_time_pe'
END_TIME_PE = 'end_time_pe'
BREAK_START_DATE_PE = 'break_start_date_pe'
BREAK_START_TIME_PE = 'break_start_time_pe'
BREAK_END_DATE_PE = 'break_end_date_pe'
BREAK_END_TIME_PE = 'break_end_time_pe'

START_DATE_ES = 'start_date_es'
END_DATE_ES = 'end_date_es'
START_TIME_ES = 'start_time_es'
END_TIME_ES = 'end_time_es'
BREAK_START_DATE_ES = 'break_start_date_es'
BREAK_START_TIME_ES = 'break_start_time_es'
BREAK_END_DATE_ES = 'break_end_date_es'
BREAK_END_TIME_ES = 'break_end_time_es'

REST_DAY = 'is_rest_day'
OBS = 'obs'

LIST_SCHEDULE = [START_DATE_PE, END_DATE_PE,START_TIME_PE, END_TIME_PE, BREAK_START_DATE_PE, BREAK_END_DATE_PE,
    BREAK_START_TIME_PE, BREAK_END_TIME_PE, START_DATE_ES, END_DATE_ES, START_TIME_ES, END_TIME_ES,
    BREAK_START_DATE_ES, BREAK_END_DATE_ES, BREAK_START_TIME_ES, BREAK_END_TIME_ES, REST_DAY, OBS
]

# ! ATTENDANCE
TIME_ONLINE = ['ONLINE']
TIME_PRODUCTIVE = ['TRAINING/QA/MEETING','ASSIGNED TASK']
TIME_NON_PRODUCTIVE = ['UNAVAILABLE', 'BUSY', 'ON HOLD CASE','SHORT BREAK']
TIME_OFFLINE = ['OFFLINE']