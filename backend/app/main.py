from http.client import HTTPException
from pydantic import BaseModel

from typing import List
from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import MetaData, Table, select

from sqlalchemy.engine import Engine
from .database import engine  # Assuming you have this already

from .pydantic_utils import table_to_pydantic



from . import crud, models, services, database
from .database import get_db
from .schemas import FileUploadLogSchema ,  FileDetailsSchema, table_to_pydantic

from .models import generate_sqlalchemy_model




app = FastAPI()

# CORS settings


app.add_middleware(
    CORSMiddleware,
    #allow_origins=origins,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_reference = services.process_file_upload(file, db)
    return {
        "message": "File uploaded successfully",
        "file_reference": file_reference
    }

@app.get("/files/", response_model=list[FileUploadLogSchema])
async def get_files(db: Session = Depends(get_db)):
    return crud.get_uploaded_files(db)

#FlightDataSchema = table_to_pydantic("flight_data")
@app.get("/files/{file_id}")
def get_file_details(file_id: int, db: Session = Depends(get_db)):
    file = crud.get_file_by_id(db, file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    records = crud.get_test_records_by_file_reference(db, file.file_reference)

    if not records:
        return {
            "file": FileUploadLogSchema.from_orm(file),
            "records": []
        }

    # Generate dynamic Pydantic model for `flight_data` table
    FlightDataSchema = table_to_pydantic("flight_data", database.engine)

    # Convert records to list of Pydantic instances
    record_data = [FlightDataSchema.from_orm(record).dict() for record in records]

    return {
        "file": FileUploadLogSchema.from_orm(file),
        "records": record_data
    }


def table_to_pydantic_fixed(table_name: str, engine):
    # Reflect the table
    from sqlalchemy import MetaData, Table
    metadata = MetaData()
    metadata.reflect(bind=engine)

    if table_name not in metadata.tables:
        raise ValueError(f"Table '{table_name}' not found in the database.")

    table = metadata.tables[table_name]
    
    # Dynamically create a Pydantic model
    Model = sqlalchemy_to_pydantic(table)

    class Config:
        from_attributes = True

    Model.Config = Config
    return Model

@app.get("/filesv1/{file_id}")
def get_file_details(file_id: int, db: Session = Depends(database.get_db)):
    file = crud.get_file_by_id(db, file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    records = crud.get_test_records_by_file_reference(db, file.file_reference)

    if not records:
        return {
            "file": FileUploadLogSchema.from_orm(file),  # Convert ORM object to Pydantic
            "records": []
        }

    # Generate dynamic Pydantic model for `flight_data` table
    FlightDataSchema = table_to_pydantic("flight_data", database.engine)

    # Convert records to list of Pydantic instances
    record_data = [FlightDataSchema.from_orm(record).dict() for record in records]

    return {
        "file": FileUploadLogSchema.from_orm(file),  # Convert ORM object to Pydantic
        "records": record_data
    }



# Map Python types to frontend types
def map_python_type_to_frontend(python_type: type) -> str:
    if python_type in [int, float]:
        return "number"
    elif python_type in [str]:
        return "string"
    elif "date" in str(python_type).lower():
        return "date"
    else:
        return "string"

@app.get("/get-columns/{table_name}")
def get_columns(table_name: str):
    metadata = MetaData()
    metadata.reflect(bind=engine)

    if table_name not in metadata.tables:
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")

    table: Table = metadata.tables[table_name]

    column_data = []
    for col in table.columns:
        
        try:
            py_type = col.type.python_type
        except NotImplementedError:
            py_type = str
        column_data.append({
            "name": col.name,
            "type": map_python_type_to_frontend(py_type)
        })
   
    return column_data



class ColumnsRequest(BaseModel):
    columns: List[str]

@app.post("/get-first-row/")
def get_first_row(data: ColumnsRequest, db: Session = Depends(get_db)):
    table_name = "flight_data"
    metadata = MetaData()
    metadata.reflect(bind=engine)
    table = metadata.tables[table_name]

    selected_columns = [table.c[col] for col in data.columns if col in table.c]
    query = select(*selected_columns).limit(1)
    result = db.execute(query).fetchone()

    if result:
        return dict(result._mapping)
    return {}