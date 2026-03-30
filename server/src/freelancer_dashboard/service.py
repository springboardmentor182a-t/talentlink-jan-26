from sqlalchemy.orm import Session
from src.entities.contract import Contract
from src.client_dashboard.schemas import ContractStats, ContractSummary, MilestoneSchema

class FreelancerDashboardService:
    @staticmethod
    def _format_contract(c):
        return ContractSummary(
            id=c.id,
            title=c.title,
            freelancer_name=c.freelancer_name,
            status=c.status,
            contract_value=c.contract_value,
            start_date=c.start_date.strftime("%m/%d/%Y") if c.start_date else "",
            end_date=c.end_date if c.end_date else "",
            milestones_total=c.milestones_total,
            milestones=[MilestoneSchema(
                id=m.id,
                title=m.title,
                amount=m.amount,
                status=m.status
            ) for m in c.milestones]
        )

    @staticmethod
    def get_contract_stats(db: Session, freelancer_name: str):
        active = db.query(Contract).filter(Contract.status == 'active', Contract.freelancer_name == freelancer_name).count()
        completed = db.query(Contract).filter(Contract.status == 'completed', Contract.freelancer_name == freelancer_name).count()
        
        # Simple summation for earnings
        total_value = 0
        all_contracts = db.query(Contract).filter(Contract.freelancer_name == freelancer_name).all()
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
    def get_active_contracts(db: Session, freelancer_name: str):
        contracts = db.query(Contract).filter(Contract.status == 'active', Contract.freelancer_name == freelancer_name).all()
        return [FreelancerDashboardService._format_contract(c) for c in contracts]

    @staticmethod
    def get_completed_contracts(db: Session, freelancer_name: str):
        contracts = db.query(Contract).filter(Contract.status == 'completed', Contract.freelancer_name == freelancer_name).all()
        return [FreelancerDashboardService._format_contract(c) for c in contracts]

    @staticmethod
    def update_milestone_status(db: Session, contract_id: int, milestone_id: int, status: str, freelancer_name: str):
        from src.entities.contract import Milestone
        contract = db.query(Contract).filter(Contract.id == contract_id, Contract.freelancer_name == freelancer_name).first()
        if not contract:
            return None
            
        milestone = db.query(Milestone).filter(Milestone.id == milestone_id, Milestone.contract_id == contract.id).first()
        if not milestone:
            return None
            
        milestone.status = status
        db.commit()
        db.refresh(contract)
        return FreelancerDashboardService._format_contract(contract)
