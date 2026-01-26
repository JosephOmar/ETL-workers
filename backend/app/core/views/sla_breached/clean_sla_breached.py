import pandas as pd
from app.core.utils.utils_for_date_and_time import convert_timezone_columns

def clean_sla_breached(data: pd.DataFrame):

    data = data[data['status'] == 'CLOSED'].copy()
    data = data[data['channel'] != 'case'].copy()

    data['creation_timestamp_local'] = pd.to_datetime(
        data['creation_timestamp_local'], 
        format='%B %d, %Y, %I:%M %p'
    )
    print(data)
    data['date_es'] = data['creation_timestamp_local'].dt.date
    data['interval_es'] = data['creation_timestamp_local'].dt.strftime('%H:00')

    data = data.rename(columns={'agent_email': 'api_email'})

    TEAM_MAPPING = {
        ('customer', 'chat'): 'Customer Tier1',
        ('rider', 'chat'): 'Rider Tier1',
        ('vendor', 'chat'): 'Vendor Chat',
        ('vendor', 'call'): 'Vendor Call',
    }
    print(data)
    data['team'] = data.apply(
        lambda r: TEAM_MAPPING.get((r['stakeholder'], r['channel']), r['stakeholder']),
        axis=1
    )

    data_grouped = data.groupby(
        ['team', 'date_es', 'interval_es', 'api_email'],
        as_index=False
    ).size()
    print(data_grouped)
    data_grouped = data_grouped.rename(columns={'size': 'chat_breached'})

    links_grouped = (
        data.groupby(['team', 'date_es', 'interval_es', 'api_email'])['Contact Link']
        .apply(lambda x: list(x.unique()))
        .reset_index()
        .rename(columns={'Contact Link': 'link'})
    )
    print(links_grouped)
    final = data_grouped.merge(
        links_grouped,
        on=['team', 'date_es', 'interval_es', 'api_email'],
        how='left'
    )
    print(final)
    final = convert_timezone_columns(final, 'date_es', 'interval_es', 'date_pe', 'interval_pe',tz_src="Europe/Madrid", tz_dst="America/Lima")

    final['interval_pe'] = final['interval_pe'].apply(
        lambda t: t.strftime('%H:00') if pd.notna(t) else None
    )
    return final