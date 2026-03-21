import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from database.core import SessionLocal
from entities.project import Project

db = SessionLocal()

# clear existing projects
db.query(Project).delete()
db.commit()

projects = [

    Project(
        title="E-commerce Website Development",
        description="Build modern e-commerce platform with React and Node.js",
        budget=4000,
        duration="2-3 months",
        skills_required="React,Node.js,MongoDB,Stripe",
        client_id=1,
        status="open"
    ),

    Project(
        title="Mobile App UI/UX Design",
        description="Design modern mobile UI for iOS and Android",
        budget=2000,
        duration="3-4 weeks",
        skills_required="Figma,UI/UX,Prototyping",
        client_id=1,
        status="open"
    ),

    Project(
        title="Python Backend Developer",
        description="Develop REST APIs using FastAPI",
        budget=5000,
        duration="2-3 months",
        skills_required="Python,FastAPI,PostgreSQL",
        client_id=1,
        status="open"
    ),

    Project(
        title="Content Writer for Tech Blog",
        description="Seeking experienced tech writer to create engaging articles about software development, AI, and emerging technologies",
        budget=800,
        duration="1 month",
        skills_required="Content Writing,SEO,Research,Tech Knowledge",
        client_id=1,
        status="open"
    ),

    Project(
        title="Social Media Marketing Campaign",
        description="Looking for social media expert to manage and grow our Instagram and TikTok presence",
        budget=1500,
        duration="1-2 months",
        skills_required="Social Media,Content Strategy,Analytics,Instagram",
        client_id=1,
        status="open"
    ),

    Project(
        title="WordPress Plugin Development",
        description="Need WordPress expert to develop custom plugin for e-commerce functionality",
        budget=2500,
        duration="1 month",
        skills_required="WordPress,PHP,MySQL,JavaScript",
        client_id=1,
        status="open"
    )

]

for project in projects:
    db.add(project)

db.commit()
db.close()

print("Projects inserted successfully")