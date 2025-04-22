from pydantic import BaseModel, create_model
from datetime import datetime
from typing import Optional, List
from sqlalchemy import MetaData, Table
from sqlalchemy.engine import Engine
from .database import engine


# Static schema for FileUploadLog
class FileUploadLogSchema(BaseModel):
    id: int
    file_reference: str
    file_name: str
    upload_timestamp: datetime

    class Config:
        orm_mode = True  # Ensure ORM objects can be handled
        from_attributes = True  # Allow from_orm to work correctly

# Static schema for TestRecord
class TestRecordSchema(BaseModel):
    id: int
    file_reference: str
    quarter: str
    year: int
    marketing_airline: str

    class Config:
        orm_mode = True  # Ensure ORM objects can be handled
        from_attributes = True  # Allow from_orm to work correctly


# FileDetails schema that contains file and records
class FileDetailsSchema(BaseModel):
    file: FileUploadLogSchema
    records: List[TestRecordSchema]

    class Config:
        orm_mode = True  # Ensure ORM objects can be handled


# Function to dynamically generate Pydantic model from SQLAlchemy table
def table_to_pydantic(table_name: str, engine: Engine):
    metadata = MetaData()
    metadata.reflect(bind=engine)
    table = Table(table_name, metadata, autoload_with=engine)

    fields = {}
    for col in table.columns:
        try:
            col_type = col.type.python_type
        except NotImplementedError:
            col_type = str  # Default to string if the column type is not recognized
        default = None if col.nullable else ...
        fields[col.name] = (Optional[col_type] if col.nullable else col_type, default)

    # Create dynamic Pydantic model with ORM support
    class Config:
        from_attributes = True  # To use from_orm() properly

    return create_model(
        f"{table_name.capitalize()}Schema",
        __config__=Config,
        **fields
    )

