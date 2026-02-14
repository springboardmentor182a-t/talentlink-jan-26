from src.database.core import SessionLocal, engine, Base
from src.entities.project import Project

# Create tables
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # Check if data exists
    if db.query(Project).count() > 0:
        print("Data already seeded.")
        return

    projects = [
        Project(
            title="Build a React E-commerce Platform",
            category="React, TypeScript, Node.js, Stripe",
            budget="$8,000",
            status="open"
        ),
        Project(
            title="Mobile App UI/UX Design",
            category="Figma, UI Design, UX Research, Mobile Design",
            budget="$3,500",
            status="in progress"
        ),
        Project(
            title="WordPress Blog Development",
            category="WordPress, PHP, SEO, CSS",
            budget="$2,000",
            status="completed"
        ),
         Project(
            title="Python Data Scraping Script",
            category="Python, BeautifulSoup, Selenium",
            budget="$500",
            status="open"
        ),
         Project(
            title="Corporate Branding Identity",
            category="Graphic Design, Branding, Illustrator",
            budget="$4,000",
            status="in progress"
        )
    ]

    for project in projects:
        db.add(project)
    
    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_data()
