from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.projects.model import Project
from src.entities.user import User
from src.auth.dependencies import get_current_user
from src.ai.service import (
    get_job_match_score,
    estimate_project_budget,
    recommend_freelancers,
    rank_proposals,
    generate_cover_letter,
    generate_project_description,
    predict_contract_risk,
    generate_contract_summary,
    chat_assistant
)

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/match-score/{project_id}")
def match_score(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    candidate = { "skills": current_user.skills, "experience": current_user.experience, "location": current_user.location, "bio": current_user.bio }
    job = { "title": project.title, "required_skills": project.skills, "description": project.description, "budget": project.budget }
    return get_job_match_score(candidate, job)


@router.get("/match-score-client/{project_id}/{freelancer_id}")
def match_score_client(project_id: int, freelancer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    freelancer = db.query(User).filter(User.id == freelancer_id).first()
    if not freelancer:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    candidate = { "skills": freelancer.skills, "experience": freelancer.experience, "location": freelancer.location, "bio": freelancer.bio }
    job = { "title": project.title, "required_skills": project.skills, "description": project.description, "budget": project.budget }
    return get_job_match_score(candidate, job)


@router.post("/estimate-budget")
def estimate_budget(data: dict, current_user: User = Depends(get_current_user)):
    return estimate_project_budget(data)


@router.post("/generate-description")
def generate_description(data: dict, current_user: User = Depends(get_current_user)):
    if not data.get("title"):
        raise HTTPException(status_code=400, detail="Project title is required")
    return generate_project_description(data)


@router.post("/contract-risk")
def contract_risk(data: dict, current_user: User = Depends(get_current_user)):
    if not data.get("title"):
        raise HTTPException(status_code=400, detail="Project title is required")
    return predict_contract_risk(data)


@router.post("/contract-summary")
def contract_summary(data: dict, current_user: User = Depends(get_current_user)):
    if not data.get("title"):
        raise HTTPException(status_code=400, detail="Project title is required")
    return generate_contract_summary(data)


@router.get("/recommend-freelancers/{project_id}")
def get_freelancer_recommendations(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    freelancers = db.query(User).filter(User.role == "freelancer").all()
    if not freelancers:
        raise HTTPException(status_code=404, detail="No freelancers found")
    project_data = { "title": project.title, "skills": project.skills, "description": project.description, "budget": project.budget }
    freelancer_list = [{ "id": f.id, "name": f.name, "skills": f.skills or "N/A", "experience": f.experience or "N/A", "bio": f.bio or "N/A", "location": f.location or "N/A" } for f in freelancers]
    recommendations = recommend_freelancers(project_data, freelancer_list)
    result = []
    for rec in recommendations:
        user = db.query(User).filter(User.id == rec["id"]).first()
        if user:
            result.append({ **rec, "name": user.name, "skills": user.skills, "experience": user.experience, "location": user.location, "bio": user.bio })
    return result


@router.get("/rank-proposals/{project_id}")
def get_proposal_rankings(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from src.proposals.model import Proposal
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    proposals = db.query(Proposal).filter(Proposal.project_id == project_id).all()
    if not proposals:
        raise HTTPException(status_code=404, detail="No proposals found")
    project_data = { "title": project.title, "skills": project.skills, "description": project.description, "budget": project.budget }
    freelancer_map = {}
    for p in proposals:
        user = db.query(User).filter(User.id == p.freelancer_id).first()
        freelancer_map[p.id] = user.name if user else f"Freelancer #{p.freelancer_id}"
    proposal_list = [{ "id": p.id, "freelancer_name": freelancer_map[p.id], "proposed_budget": float(p.proposed_budget) if p.proposed_budget else 0, "delivery_time": p.delivery_time or "N/A", "cover_letter": p.cover_letter or "N/A", "status": p.status } for p in proposals]
    rankings = rank_proposals(project_data, proposal_list)
    result = []
    for rank in rankings:
        proposal = next((p for p in proposal_list if p["id"] == rank["id"]), None)
        if proposal:
            result.append({**proposal, **rank})
    result.sort(key=lambda x: x.get("rank", 99))
    return result


@router.post("/generate-cover-letter")
def get_cover_letter(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project_id = data.get("project_id")
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    freelancer = { "name": current_user.name, "skills": current_user.skills or "N/A", "experience": current_user.experience or "N/A", "bio": current_user.bio or "N/A", "location": current_user.location or "N/A" }
    project_data = { "title": project.title, "skills": project.skills, "description": project.description, "budget": project.budget }
    return generate_cover_letter(freelancer, project_data)


@router.post("/chat")
def ai_chat(data: dict, current_user: User = Depends(get_current_user)):
    message = data.get("message", "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    history = data.get("history", [])
    user_context = { "name": current_user.name, "role": current_user.role, "skills": current_user.skills or "N/A" }
    return chat_assistant(message, history, user_context)