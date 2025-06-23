from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated
from Query import getName, getNameFromUserId, getEmail, getTitle, getSemester, getDegreeId
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
    return {"email": getEmail(engine=engine, role=current_user.role, role_id=current_user.role_id)}

@router.get("/title")
async def get_email(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return {"title": getTitle(engine=engine, role=current_user.role, role_id=current_user.role_id)}

@router.get("/semester")
async def get_email(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return {"semester": getSemester(engine=engine, role=current_user.role, role_id=current_user.role_id)}

@router.get("/degreeId")
async def get_email(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return {"degreeId": getDegreeId(engine=engine, role=current_user.role, role_id=current_user.role_id)}

@router.get("/profile")
async def get_profile(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    try:
        # Get user profile data using individual functions
        name = getName(engine=engine, role=current_user.role, role_id=current_user.role_id)
        email = getEmail(engine=engine, role=current_user.role, role_id=current_user.role_id)
        title = getTitle(engine=engine, role=current_user.role, role_id=current_user.role_id)
        semester = getSemester(engine=engine, role=current_user.role, role_id=current_user.role_id)
        degreeId = getDegreeId(engine=engine, role=current_user.role, role_id=current_user.role_id)
        
        return {
            "name": name,
            "email": email,
            "roleId": current_user.role_id,
            "role": current_user.role,
            "title": title,
            "semester": semester,
            "degreeId": degreeId
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching profile: {str(e)}"
        ) 