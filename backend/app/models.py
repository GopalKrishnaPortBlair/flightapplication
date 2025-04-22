from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime, Boolean,
    MetaData, Table, inspect
)
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from typing import Type, Dict, Any, Optional
from decimal import Decimal

from .database import engine  # Assuming database.py has engine setup

# SQLAlchemy base
Base = declarative_base()
metadata = MetaData()

# ---------------------------------------
# Example Static SQLAlchemy Models
# ---------------------------------------

class FileUploadLog(Base):
    __tablename__ = 'file_upload_log'
    
    id = Column(Integer, primary_key=True, index=True)
    file_reference = Column(String, index=True)
    file_name = Column(String)
    upload_timestamp = Column(String)


class Test(Base):
    __tablename__ = 'test'
    
    id = Column(Integer, primary_key=True, index=True)
    file_reference = Column(String)
    quarter = Column(String)
    year = Column(Integer)
    marketing_airline = Column(String)

# ---------------------------------------
# Dynamic SQLAlchemy Model Generator
# ---------------------------------------

def generate_sqlalchemy_model(table_name: str, engine) -> Type[Base]:
    """
    Dynamically creates a SQLAlchemy ORM model from a given table name.
    """
    metadata.reflect(bind=engine, only=[table_name])
    table = Table(table_name, metadata, autoload_with=engine)
    
    model_class = type(
        table_name.capitalize(),
        (Base,),
        {'__table__': table}
    )
    return model_class

# ---------------------------------------
# Helper for Type Mapping (with nullable support)
# ---------------------------------------

def get_pydantic_field_type(column) -> tuple:
    """
    Map SQLAlchemy column to Pydantic field type, supporting nullables.
    """
    col_type = column.type
    is_nullable = column.nullable

    if isinstance(col_type, Integer):
        py_type = int
    elif isinstance(col_type, String):
        py_type = str
    elif isinstance(col_type, Float):
        py_type = float
    elif isinstance(col_type, (Date, DateTime)):
        py_type = str  # Or use datetime for strict typing
    elif isinstance(col_type, Boolean):
        py_type = bool
    elif isinstance(col_type, Decimal):
        py_type = float  # Convert Decimal to float (or str if needed)
    else:
        py_type = str

    if is_nullable:
        return (Optional[py_type], None)
    else:
        return (py_type, ...)

# ---------------------------------------
# Dynamic Pydantic Model Generator
# ---------------------------------------

def generate_pydantic_model(table_name: str) -> Type[BaseModel]:
    """
    Dynamically creates a Pydantic model for a given table.
    """
    table = Table(table_name, metadata, autoload_with=engine)

    annotations: Dict[str, Any] = {}
    defaults: Dict[str, Any] = {}

    for column in table.columns:
        field_type, default = get_pydantic_field_type(column)
        annotations[column.name] = field_type
        defaults[column.name] = default

    model_dict = {
        '__annotations__': annotations,
        **defaults
    }

    # Add the Config class dynamically to handle `from_orm` properly
    model_dict['Config'] = type(
        'Config',
        (object,),
        {'from_attributes': True}  # Enable from_orm()
    )

    # Dynamically set __module__ to prevent the KeyError
    pydantic_model = type(
        f"{table_name.capitalize()}Response",
        (BaseModel,),
        model_dict
    )

    pydantic_model.__module__ = __name__  # Set the module explicitly to avoid KeyError

    return pydantic_model

# ---------------------------------------
# Expose only relevant functions/classes
# ---------------------------------------

__all__ = [
    "Base",
    "FileUploadLog",
    "Test",
    "generate_sqlalchemy_model",
    "generate_pydantic_model"
]
