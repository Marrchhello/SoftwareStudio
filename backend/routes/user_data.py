from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated
from Query import getName, getNameFromUserId, getUserProfile
from db_session import get_db, getEngine
from auth import get_current_active_user, UserAuth

router = APIRouter()

db = get_db()
engine = getEngine()

@router.get("/role")
async def get_role(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return {"role": current_user.role}

@router.get("/role_id")
async def get_role_id(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return {"role_id": current_user.role_id}

@router.get("/name")
async def get_name(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    role = current_user.role
    return {"name": getName(engine=engine, role=role, role_id=current_user.role_id)}

@router.get("/name/{user_id}")
async def get_name_by_id(
    user_id: int
):
    return {"name": getNameFromUserId(engine=engine, user_id=user_id)}

@router.get("/email")
async def get_email(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    profile = getUserProfile(engine=engine, user_id=current_user.user_id)
    return {"email": profile.get("email", "") if profile else ""}

@router.get("/title")
async def get_title(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    profile = getUserProfile(engine=engine, user_id=current_user.user_id)
    return {"title": profile.get("title", "") if profile else ""}

@router.get("/semester")
async def get_semester(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    profile = getUserProfile(engine=engine, user_id=current_user.user_id)
    return {"semester": profile.get("semester", "") if profile else ""}

@router.get("/degreeId")
async def get_degree_id(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    profile = getUserProfile(engine=engine, user_id=current_user.user_id)
    return {"degreeId": profile.get("degreeId", "") if profile else ""}

@router.get("/profile")
async def get_profile(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    try:
        profile_data = getUserProfile(engine=engine, user_id=current_user.user_id)
        if not profile_data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching profile: {str(e)}"
        ) 