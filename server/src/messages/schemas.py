from pydantic import BaseModel
from typing import Optional, List


class ConversationStartRequest(BaseModel):
    other_user_id: Optional[int] = None
    proposal_id: Optional[int] = None


class MessageCreateRequest(BaseModel):
    content: str


class UserSummary(BaseModel):
    id: int
    full_name: str
    role: str


class ProposalSummary(BaseModel):
    id: int
    title: str
    status: str


class MessageResponse(BaseModel):
    id: int
    content: str
    created_at: str
    sender_id: int
    sender_name: str


class ConversationSummary(BaseModel):
    id: int
    created_at: str
    updated_at: str
    other_user: UserSummary
    proposal: Optional[ProposalSummary] = None
    last_message: Optional[MessageResponse] = None
    message_count: int


class ConversationListResponse(BaseModel):
    current_user: UserSummary
    conversations: List[ConversationSummary]


class ConversationDetailResponse(BaseModel):
    id: int
    created_at: str
    updated_at: str
    current_user: UserSummary
    other_user: UserSummary
    proposal: Optional[ProposalSummary] = None
    messages: List[MessageResponse]
