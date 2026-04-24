from groq import Groq
import json
import re
import os
from dotenv import load_dotenv

load_dotenv(override=True)

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

def get_job_match_score(candidate_profile: dict, job: dict) -> dict:
    prompt = f"""
    You are a recruitment AI. Analyze how well this candidate matches the job.

    CANDIDATE:
    - Skills: {candidate_profile.get('skills', 'N/A')}
    - Experience: {candidate_profile.get('experience', 'N/A')}
    - Location: {candidate_profile.get('location', 'N/A')}
    - Bio: {candidate_profile.get('bio', 'N/A')}

    JOB:
    - Title: {job.get('title', 'N/A')}
    - Required Skills: {job.get('required_skills', 'N/A')}
    - Description: {job.get('description', 'N/A')}
    - Budget: {job.get('budget', 'N/A')}

    Respond ONLY in this JSON format, nothing else:
    {{
        "score": <number 0-100>,
        "matching_skills": ["skill1", "skill2"],
        "missing_skills": ["skill1", "skill2"],
        "summary": "2 line summary"
    }}
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


def estimate_project_budget(data: dict) -> dict:
    prompt = f"""
    You are a freelancing platform AI. Estimate a fair budget for this project.

    PROJECT:
    - Title: {data.get('title', 'N/A')}
    - Description: {data.get('description', 'N/A')}
    - Skills Required: {data.get('skills', 'N/A')}

    Respond ONLY in this JSON format, nothing else:
    {{
        "min": <minimum budget number>,
        "max": <maximum budget number>,
        "recommended": <recommended budget number>,
        "reason": "1 sentence explanation"
    }}
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


def recommend_freelancers(project: dict, freelancers: list) -> list:
    freelancer_list = "\n".join([
        f"ID:{f['id']} | Name:{f['name']} | Skills:{f['skills']} | Experience:{f['experience']} | Bio:{f['bio']} | Location:{f['location']}"
        for f in freelancers
    ])
    prompt = f"""
    You are a recruitment AI. Rank these freelancers for the given project.

    PROJECT:
    - Title: {project.get('title', 'N/A')}
    - Required Skills: {project.get('skills', 'N/A')}
    - Description: {project.get('description', 'N/A')}
    - Budget: {project.get('budget', 'N/A')}

    FREELANCERS:
    {freelancer_list}

    Return ONLY a JSON array of top 5 freelancers in this format, nothing else:
    [
        {{
            "id": <freelancer id>,
            "score": <match score 0-100>,
            "matching_skills": ["skill1", "skill2"],
            "missing_skills": ["skill1", "skill2"],
            "summary": "1 line reason why this freelancer is a good fit"
        }}
    ]
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


def rank_proposals(project: dict, proposals: list) -> list:
    proposal_list = "\n".join([
        f"ID:{p['id']} | Freelancer:{p['freelancer_name']} | Budget:${p['proposed_budget']} | Delivery:{p['delivery_time']} | Cover Letter:{p['cover_letter']}"
        for p in proposals
    ])
    prompt = f"""
    You are a recruitment AI. Rank these proposals for the given project from best to worst.

    PROJECT:
    - Title: {project.get('title', 'N/A')}
    - Required Skills: {project.get('skills', 'N/A')}
    - Description: {project.get('description', 'N/A')}
    - Budget: ${project.get('budget', 'N/A')}

    PROPOSALS:
    {proposal_list}

    Rank ALL proposals. Return ONLY a JSON array in this format, nothing else:
    [
        {{
            "id": <proposal id>,
            "rank": <rank number starting from 1>,
            "score": <score 0-100>,
            "reason": "1 sentence why this proposal is ranked here",
            "budget_fit": "good/fair/poor",
            "delivery_fit": "good/fair/poor"
        }}
    ]
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


def generate_cover_letter(freelancer: dict, project: dict) -> dict:
    prompt = f"""
    You are a professional cover letter writer for freelancers.
    Write a compelling cover letter for this freelancer to apply for this project.

    FREELANCER:
    - Name: {freelancer.get('name', 'N/A')}
    - Skills: {freelancer.get('skills', 'N/A')}
    - Experience: {freelancer.get('experience', 'N/A')}
    - Bio: {freelancer.get('bio', 'N/A')}
    - Location: {freelancer.get('location', 'N/A')}

    PROJECT:
    - Title: {project.get('title', 'N/A')}
    - Required Skills: {project.get('skills', 'N/A')}
    - Description: {project.get('description', 'N/A')}
    - Budget: {project.get('budget', 'N/A')}

    Respond ONLY in this JSON format, nothing else.
    Do NOT use newlines inside string values. Use spaces instead.
    Do NOT use special characters or apostrophes inside strings.
    {{
        "cover_letter": "full professional cover letter text here 3-4 paragraphs all in one line",
        "key_points": ["point1", "point2", "point3"]
    }}
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = re.sub(r'[\x00-\x1f\x7f]', ' ', text)
    return json.loads(text.strip())


def generate_project_description(data: dict) -> dict:
    prompt = f"""
    You are a professional project description writer for a freelancing platform.
    Write a compelling and detailed project description based on the title and skills provided.

    PROJECT TITLE: {data.get('title', 'N/A')}
    SKILLS REQUIRED: {data.get('skills', 'N/A')}
    BUDGET: {data.get('budget', 'N/A')}

    Respond ONLY in this JSON format, nothing else:
    {{
        "description": "full detailed project description in 3-4 sentences"
    }}
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = re.sub(r'[\x00-\x1f\x7f]', ' ', text)
    return json.loads(text.strip())


def predict_contract_risk(data: dict) -> dict:
    prompt = f"""
    You are a contract risk analyst for a freelancing platform.
    Analyze this contract and predict the risk level.

    CONTRACT DETAILS:
    - Project Title: {data.get('title', 'N/A')}
    - Project Description: {data.get('description', 'N/A')}
    - Required Skills: {data.get('skills', 'N/A')}
    - Budget: ${data.get('budget', 'N/A')}
    - Deadline: {data.get('deadline', 'N/A')}
    - Freelancer Bid: ${data.get('proposed_budget', 'N/A')}
    - Delivery Time Offered: {data.get('delivery_time', 'N/A')}
    - Freelancer Experience: {data.get('freelancer_experience', 'N/A')}
    - Freelancer Skills: {data.get('freelancer_skills', 'N/A')}
    - Viewer Role: {data.get('role', 'client')}

    Analyze risk based on:
    1. Budget realism (is the bid too low or too high?)
    2. Deadline feasibility (is the delivery time realistic?)
    3. Skill match (does freelancer have the required skills?)
    4. Project complexity vs experience

    Respond ONLY in this JSON format, nothing else:
    {{
        "risk_level": "Low" or "Medium" or "High",
        "risk_score": <number 0-100 where 100 is highest risk>,
        "risk_factors": ["factor1", "factor2", "factor3"],
        "positive_factors": ["factor1", "factor2"],
        "recommendation": "1-2 sentence advice for the viewer"
    }}
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = re.sub(r'[\x00-\x1f\x7f]', ' ', text)
    return json.loads(text.strip())


def generate_contract_summary(data: dict) -> dict:
    prompt = f"""
    You are a project management AI for a freelancing platform.
    Analyze this contract and provide a smart summary with actionable advice.

    CONTRACT DETAILS:
    - Project Title: {data.get('title', 'N/A')}
    - Description: {data.get('description', 'N/A')}
    - Skills Required: {data.get('skills', 'N/A')}
    - Budget: ${data.get('budget', 'N/A')}
    - Deadline: {data.get('deadline', 'N/A')}
    - Status: {data.get('status', 'in-progress')}
    - Freelancer: {data.get('freelancer_name', 'N/A')}
    - Proposed Budget: ${data.get('proposed_budget', 'N/A')}
    - Delivery Time: {data.get('delivery_time', 'N/A')}
    - Viewer Role: {data.get('role', 'client')}

    Respond ONLY in this JSON format, nothing else:
    {{
        "summary": "2-3 sentence smart summary of the contract status",
        "next_steps": ["step1", "step2", "step3"],
        "tips": ["tip1", "tip2"]
    }}
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = re.sub(r'[\x00-\x1f\x7f]', ' ', text)
    return json.loads(text.strip())


def chat_assistant(message: str, history: list, user: dict) -> dict:
    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful AI assistant for TalentLink, a freelancing platform. "
                "Help users with questions about finding projects, writing proposals, "
                "setting budgets, improving their profile, and general freelancing advice. "
                "Be concise, friendly, and practical. "
                f"You are talking to: {user.get('name', 'a user')} "
                f"who is a {user.get('role', 'user')} "
                f"with skills: {user.get('skills', 'N/A')}."
            )
        }
    ]
    for msg in history[-10:]:
        messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })
    messages.append({"role": "user", "content": message})
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=1024
    )
    return {"reply": response.choices[0].message.content.strip()}