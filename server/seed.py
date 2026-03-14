from src.database.core import SessionLocal, engine, Base
from src.proposals import models

# 1. Build the tables in the database
Base.metadata.create_all(bind=engine)
db = SessionLocal()

# 2. Check if it's empty, then inject the data
if not db.query(models.Project).first():
    print("Injecting dummy data...")
    db.add_all([
        models.Project(title='Full Stack Web Application', company='TechCorp Solutions', budget='$3,000 - $6,000', type='Fixed Price', match='90%', tags=['React', 'Node.js', 'AWS']),
        models.Project(title='Mobile App UI/UX Design', company='DesignHub Inc.', budget='$4,000 - $8,000', type='Hourly', match='89%', tags=['Figma', 'UI Design', 'Mobile']),
        models.Project(title='E-commerce Platform Development', company='ShopMaster', budget='$5,000 - $10,000', type='Fixed Price', match='88%', tags=['PHP', 'MySQL', 'Payment APIs'])
    ])
    
    db.add_all([
        models.Contract(id='CT-2024-001', title='Website Redesign Project', client='Emma Creight', budget='$12,000', status='Active', color='#28A745'),
        models.Contract(id='CT-2024-002', title='Mobile App Development', client='Alexander Roy', budget='$25,000', status='Pending Sign', color='#FF7A1A'),
        models.Contract(id='CT-2024-003', title='Brand Identity Design', client='Evelyn Stanley', budget='$9,500', status='Draft', color='#6C757D')
    ])
    db.commit()
    print("✅ Database successfully seeded!")
else:
    print("⚠️ Data already exists. Skipping.")

db.close()