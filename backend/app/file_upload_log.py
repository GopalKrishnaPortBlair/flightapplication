from sqlalchemy import Column, Integer, String, DateTime
from .database import Base

class FileUploadLog(Base):
    __tablename__ = 'file_upload_log'
    
    id = Column(Integer, primary_key=True, index=True)
    file_reference = Column(String, index=True)
    file_name = Column(String)
    upload_timestamp = Column(DateTime)
