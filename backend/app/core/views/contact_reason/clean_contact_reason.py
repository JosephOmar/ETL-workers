import pandas as pd

QUEUE_NAMES = {
    'VS-case-inbox-spa-ES-tier2': 'Vendor Tier2',
    'VS-case-inbox-spa-ES-disputes': 'Vendor Tier2',
    'CS-case-inbox-spa-ES-tier2': 'Customer Tier2',
    'RS-case-inbox-spa-ES-tier2': 'Rider Tier2',
    'RS-chat-spa-ES-tier1': 'Rider Tier1',
    'VS-chat-spa-ES-tier1': 'Vendor Chat',
    'VS-call-default': 'Vendor Call',
    'CS-chat-spa-ES-live-order': 'Customer Live',
    'CS-chat-spa-ES-nonlive-order': 'Customer No Live'
}

COUNTRY = ['ES']

def clean_contact_reason(data: pd.DataFrame):

    data = data[data['queue_name'].isin(QUEUE_NAMES.keys())].copy()

    data = data[data['country'] == 'ES']

    data['creation_timestamp_utc'] = pd.to_datetime(data['creation_timestamp_local'],format='%B %d, %Y, %I:%M %p',utc=True)
    data['timestamp_pe'] = data['creation_timestamp_utc'].dt.tz_convert('America/Lima')
    data['timestamp_es'] = data['creation_timestamp_utc'].dt.tz_convert('Europe/Madrid')
    data['date_pe'] = data['timestamp_pe'].dt.date
    data['interval_pe'] = data['timestamp_pe'].dt.strftime('%H:00')
    data['date_es'] = data['timestamp_es'].dt.date
    data['interval_es'] = data['timestamp_es'].dt.strftime('%H:00')

    data['team'] = data['queue_name'].map(QUEUE_NAMES)

    data['contact_reason'] = data['cr_l1']
    data.loc[data['cr_l2'].notna(), 'contact_reason'] += '/' + data['cr_l2']
    data.loc[data['cr_l3'].notna(), 'contact_reason'] += '/' + data['cr_l3']
    # ─────────────────────
    # Tabla 1: métricas por intervalo
    # ─────────────────────
    df_contacts_received = (
        data.groupby(
            ['date_pe', 'interval_pe', 'date_es', 'interval_es', 'team'],
            as_index=False
        )
        .size()
        .rename(columns={'size': 'contacts_received'})
    )
    # ─────────────────────
    # Tabla 2: conteo por CR
    # ─────────────────────
    df_contact_reason = (
        data.groupby(
            ['date_pe', 'interval_pe', 'date_es', 'interval_es', 'team', 'contact_reason'],
            as_index=False
        )
        .size()
        .rename(columns={'size': 'count'})
    )
    # ─────────────────────
    # Tabla 3: THT > 600 por agente
    # ─────────────────────
    data["resolution_time"] = pd.to_numeric(data["resolution_time"], errors="coerce")
    df_high_tht_by_agent = (
        data[data['resolution_time'] > 1200]
        .groupby(
            ['date_pe', 'interval_pe', 'date_es', 'interval_es', 'team', 'agent_email'],
            as_index=False
        )
        .size()
        .rename(columns={
            'size': 'count',
            'agent_email': 'api_email'
        })
    )
    print('xd')
    print(df_high_tht_by_agent)
    print('xd')
    return df_contacts_received, df_contact_reason, df_high_tht_by_agent