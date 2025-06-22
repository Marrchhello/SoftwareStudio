from fastapi import APIRouter
from Models import UniEventScheduleModel, FAQListModel
from Query import getUniversityEvents, getFAQ
from Util import convert_str_to_datetime
from db_session import engine

router = APIRouter()

@router.get("/events/", response_model=UniEventScheduleModel)
def university_events_get():
    return getUniversityEvents(engine=engine)

@router.get("/events/{date}", response_model=UniEventScheduleModel)
def university_events_get_date(date: str):
    return getUniversityEvents(engine=engine, start_date=convert_str_to_datetime(date))

@router.get("/faq/", response_model=FAQListModel)
def faq_get():
    return getFAQ(engine=engine) 