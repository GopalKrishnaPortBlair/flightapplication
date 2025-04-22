from pydantic import BaseModel, create_model
from sqlalchemy.orm import DeclarativeMeta
from typing import Any, Dict
import inflect

inflector = inflect.engine()

def table_to_pydantic(table_name: str, engine) -> type[BaseModel]:
    from sqlalchemy import MetaData, Table
    from sqlalchemy.orm import registry

    metadata = MetaData()
    metadata.reflect(bind=engine)

    if table_name not in metadata.tables:
        raise ValueError(f"Table '{table_name}' not found in database")

    table: Table = metadata.tables[table_name]
    model_name = inflector.camelize(table_name)

    fields: Dict[str, tuple[type, Any]] = {}

    for column in table.columns:
        col_type = column.type.python_type
        default = column.default.arg if column.default is not None else ...
        fields[column.name] = (col_type, default)

    return create_model(
        model_name,
        __config__=type("Config", (), {"from_attributes": True}),  # 🔥 THIS IS THE FIX
        **fields
    )
