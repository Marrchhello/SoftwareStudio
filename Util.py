import datetime

# Function to convert string to datetime
def convert_str_to_datetime(date_time: str):
    format = '%Y-%m-%d'
    date = datetime.datetime.strptime(date_time, format).date()

    return date