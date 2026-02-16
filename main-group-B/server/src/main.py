from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# -----------------------------
# CORS CONFIG (VERY IMPORTANT)
# -----------------------------
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# HOME ROUTE
# -----------------------------
@app.get("/")
def home():
    return {"message": "TalentLink API Running"}

# -----------------------------
# PROJECTS ROUTE
# -----------------------------
@app.get("/projects")
def get_projects():
    return [
        {
            "id": 1,
            "title": "E-commerce Website Development",
            "description": "Looking for an experienced developer to build a modern e-commerce platform with React and Node.js. Must have experience with payment integrations.",
            "skills": ["React", "Node.js", "MongoDB", "Stripe"],
            "budget": "$2,500 - $4,000",
            "duration": "2-3 months",
            "client": "TechCorp Solutions"
        },
        {
            "id": 2,
            "title": "Mobile App UI/UX Design",
            "description": "Need a creative designer to create modern, user-friendly mobile app designs for iOS and Android. Portfolio required.",
            "skills": ["Figma", "UI/UX", "Mobile Design", "Prototyping"],
            "budget": "$1,200 - $2,000",
            "duration": "3-4 weeks",
            "client": "StartupXYZ"
        },
        {
            "id": 3,
            "title": "Content Writer for Tech Blog",
            "description": "Seeking experienced tech writer to create engaging articles about software development, AI, and emerging technologies.",
            "skills": ["Content Writing", "SEO", "Research", "Tech Knowledge"],
            "budget": "$500 - $800",
            "duration": "1 month",
            "client": "Digital Media Co."
        },
        {
            "id": 4,
            "title": "Python Backend Developer",
            "description": "Need experienced Python developer for building RESTful APIs and microservices. Experience with FastAPI and PostgreSQL required.",
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            "budget": "$3,000 - $5,000",
            "duration": "2-3 months",
            "client": "DataFlow Inc."
        },
        {
            "id": 5,
            "title": "Social Media Marketing Campaign",
            "description": "Looking for social media expert to manage and grow our Instagram and TikTok presence. Must have proven track record.",
            "skills": ["Social Media", "Content Strategy", "Analytics", "Instagram"],
            "budget": "$800 - $1,500",
            "duration": "1-2 months",
            "client": "Fashion Brand Co."
        },
        {
            "id": 6,
            "title": "WordPress Plugin Development",
            "description": "Need WordPress expert to develop custom plugin for e-commerce functionality. Must follow WordPress coding standards.",
            "skills": ["WordPress", "PHP", "MySQL", "JavaScript"],
            "budget": "$1,500 - $2,500",
            "duration": "1 month",
            "client": "Web Agency Pro"
        }
    ]
