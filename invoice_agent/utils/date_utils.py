from datetime import datetime, timedelta


def get_today_date():
    """Returns today's date in YYYY-MM-DD format"""
    return datetime.now().strftime("%Y-%m-%d")


def get_date_after_days(days: int):
    """Returns date after specified days in YYYY-MM-DD format"""
    future_date = datetime.now() + timedelta(days=days)
    return future_date.strftime("%Y-%m-%d")


def format_date(date_str: str):
    """Formats date string to YYYY-MM-DD"""
    try:
        # Try parsing common formats
        for fmt in ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"]:
            try:
                dt = datetime.strptime(date_str, fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue
        return date_str
    except:
        return get_today_date()


def get_quotation_validity_date():
    """Returns validity date for quotation (14 days from today)"""
    return get_date_after_days(14)