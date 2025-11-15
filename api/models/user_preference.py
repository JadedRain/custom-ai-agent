from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Enum as SQLEnum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import db
from .build_type import BuildType

if TYPE_CHECKING:
    from .user import User


class UserPreference(db.Model):
    __tablename__ = 'user_preferences'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(db.ForeignKey('users.id'), nullable=False, unique=True, index=True)
    build_type: Mapped[BuildType] = mapped_column(
        SQLEnum(BuildType),
        nullable=False,
        default=BuildType.GREEDY
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to user
    user: Mapped["User"] = relationship("User", back_populates="preference")
    
    def __repr__(self):
        return f"<UserPreference user_id={self.user_id} build_type={self.build_type.value}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'build_type': self.build_type.value,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
