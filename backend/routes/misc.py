from fastapi import APIRouter
from Models import FAQListModel
from Query import getFAQ
from db_session import engine

router = APIRouter()

@router.get("/faq/", response_model=FAQListModel)
def faq_get():
    return getFAQ(engine=engine) 