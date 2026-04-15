from .schemas import DashboardStats, ProjectSummary, ChartData, UnreadMessages, ContractStats, ContractSummary, MilestoneSchema
from src.entities.project import Project
from sqlalchemy.orm import Session
from sqlalchemy import func

from datetime import datetime, timedelta

class ClientDashboardService:
    @staticmethod
    def get_dashboard_stats(db: Session):
        active_projects_count = db.query(Project).filter(Project.status == 'in progress').count()
        completed_projects_count = db.query(Project).filter(Project.status == 'completed').count()
        open_projects_count = db.query(Project).filter(Project.status == 'open').count()
        
        return DashboardStats(
            active_projects=active_projects_count + open_projects_count,
            pending_proposals=open_projects_count, 
            active_contracts=active_projects_count,
            completed_projects=completed_projects_count
        )

    @staticmethod
    def get_recent_projects(db: Session):
        projects = db.query(Project).order_by(Project.created_at.desc()).limit(5).all()
        return [
            ProjectSummary(
                id=p.id,
                title=p.title,
                category=p.category if p.category else "General",  # ← fix None
                budget=str(p.budget) if p.budget else "0",          # ← fix float
                status=p.status
            ) for p in projects
        ]

    @staticmethod
    def get_chart_data(db: Session):
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=6)
        
        chart_data_dict = {
            (start_date + timedelta(days=i)).strftime("%a"): 0 
            for i in range(7)
        }
        
        recent_projects = db.query(Project).filter(Project.created_at >= start_date).all()
        for p in recent_projects:
            day_name = p.created_at.strftime("%a")
            if day_name in chart_data_dict:
                chart_data_dict[day_name] += 1
                
        ordered_data = [
            {"name": (start_date + timedelta(days=i)).strftime("%a"), "value": chart_data_dict[(start_date + timedelta(days=i)).strftime("%a")]}
            for i in range(7)
        ]
        
        return ChartData(data=ordered_data)

    @staticmethod
    def get_unread_messages_count(db: Session):
        return UnreadMessages(count=3)

    @staticmethod
    def get_contract_stats(db: Session):
        from src.entities.contract import Contract
        active = db.query(Contract).filter(Contract.status == 'active').count()
        completed = db.query(Contract).filter(Contract.status == 'completed').count()
        
        total_value = 0
        all_contracts = db.query(Contract).all()
        for c in all_contracts:
            try:
                val = int(c.contract_value.replace('$', '').replace(',', ''))
                total_value += val
            except:
                pass
        
        return ContractStats(
            active_contracts=active,
            completed_contracts=completed,
            total_investment=f"${total_value:,}"
        )

    @staticmethod
    def _format_contract(c):
        return ContractSummary(
            id=c.id,
            title=c.title,
            freelancer_name=c.freelancer_name,
            status=c.status,
            contract_value=c.contract_value,
            start_date=c.start_date.strftime("%m/%d/%Y"),
            end_date=c.end_date,
            milestones_total=c.milestones_total,
            milestones=[MilestoneSchema(
                id=m.id,
                title=m.title,
                amount=m.amount,
                status=m.status
            ) for m in c.milestones]
        )

    @staticmethod
    def get_active_contracts(db: Session):
        from src.entities.contract import Contract
        contracts = db.query(Contract).filter(Contract.status == 'active').all()
        return [ClientDashboardService._format_contract(c) for c in contracts]

    @staticmethod
    def get_completed_contracts(db: Session):
        from src.entities.contract import Contract
        contracts = db.query(Contract).filter(Contract.status == 'completed').all()
        return [ClientDashboardService._format_contract(c) for c in contracts]

    @staticmethod
    def get_proposals(db: Session, project_id: int):
        from src.entities.proposal import Proposal
        return db.query(Proposal).filter(Proposal.project_id == project_id).all()

    @staticmethod
    def accept_proposal(db: Session, proposal_id: int):
        from src.entities.proposal import Proposal
        from src.entities.contract import Contract, Milestone
        from src.entities.project import Project

        proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
        if not proposal:
            return None
        
        proposal.status = 'accepted'
        
        project = db.query(Project).filter(Project.id == proposal.project_id).first()
        if project:
            project.status = 'in progress'
        
        contract = Contract(
            title=f"Contract for {project.title if project else 'Project'}",
            freelancer_name=proposal.freelancer_name,
            status='active',
            contract_value=proposal.amount,
            milestones_total=1,
            start_date=datetime.utcnow()
        )
        db.add(contract)
        db.flush()

        milestone = Milestone(
            contract_id=contract.id,
            title="Initial Deliverable",
            amount=proposal.amount,
            status='pending'
        )
        db.add(milestone)
        
        db.commit()
        db.refresh(contract)
        return contract