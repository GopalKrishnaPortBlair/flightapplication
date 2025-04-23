import decimal
from http.client import HTTPException


from pydantic import BaseModel

from typing import List, Dict, Any, Union
from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import MetaData, Table, select, text

from sqlalchemy.engine import Engine
from .database import engine  # Assuming you have this already

from .pydantic_utils import table_to_pydantic



from . import crud, models, services, database
from .database import get_db
from .schemas import FileUploadLogSchema ,  FileDetailsSchema, table_to_pydantic

from .models import FileUploadLog, MathRule, generate_sqlalchemy_model








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
    print(record_data)
    return {
        "file": FileUploadLogSchema.from_orm(file),  # Convert ORM object to Pydantic
        "records": record_data
    }



# Map Python types to frontend types
def map_python_type_to_frontend(python_type: type) -> str:
    if python_type in [int, float , decimal.Decimal]:
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

class ConditionItem(BaseModel):
    id: int
    column: str
    operator: str
    value: str


class EquationItem(BaseModel):
    id: str
    type: str
    value: Union[str, float]
    display: str


class EquationData(BaseModel):
    columns: List[str]
    equation: List[EquationItem]


class SaveRuleRequest(BaseModel):
    rule_name: str
    rule_description: str
    target_column: str
    conditions: str   # Now a plain string (e.g., JSON.stringify object)
    equation: str     # Now a plain string (e.g., "Total_Passengers + 100")
    selcols: str

@app.post("/save-rule/")
def save_rule(rule: SaveRuleRequest, db: Session = Depends(get_db)):
    print("Came Here")

    new_rule = MathRule(
        rule_name=rule.rule_name,
        rule_description=rule.rule_description,
        target_column=rule.target_column,
        conditions=rule.conditions,   # Just storing as plain string
        equation=rule.equation,        # Just storing as plain string
        selcols=rule.selcols
    )

    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)

    return {"message": "Rule saved successfully", "id": new_rule.id}


@app.get("/execute-rule/{rule_name}")
def execute_rule(rule_name: str, db: Session = Depends(get_db)):
    rule = db.query(MathRule).filter(MathRule.rule_name == rule_name).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    try:
        # Parse conditions if they're in stringified JSON format
        parsed_conditions = json.loads(rule.conditions)
    except Exception as e:
        parsed_conditions = f"Error parsing conditions: {e}"

    try:
        # Equation is typically a string like: Total_Passengers + Seats + 100
        parsed_equation = rule.equation
    except Exception as e:
        parsed_conditions = None

    parsed_conditions = None
    # Return nicely formatted details
    return {
        "Rule Name": rule.rule_name,
        "Description": rule.rule_description,
        "Target Column": rule.target_column,
        #"Conditions": parsed_conditions,
        "Equation": parsed_equation,
        "selcols":rule.selcols
    }




@app.get("/rules")
def get_all_rules(db: Session = Depends(get_db)):
        rules = db.query(MathRule).all()
        return [{"id": rule.id, "name": rule.rule_name, "equation": rule.equation, "tcolumn" : rule.target_column, "selcols":rule.selcols} for rule in rules]

class ExecuteRuleRequest(BaseModel):
    rule_id: int
    file_id: int


@app.post("/execute-rule")
def execute_rule_on_all_data(data: ExecuteRuleRequest, db: Session = Depends(get_db)):
    # Step 1: Fetch the rule
    rule = db.query(MathRule).filter(MathRule.id == data.rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    try:
        selcols = selcols = rule.selcols.strip('|').split('||')
        equation = rule.equation
        target_col = rule.target_column

       
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid rule format: {e}")
    


    # 2. Get the filereference from upload log
    file_reference = db.query(FileUploadLog).filter(FileUploadLog.id == data.file_id).first()
    if not file_reference:
        raise HTTPException(status_code=404, detail="Upload log not found")
   

    # Step 2: Fetch all rows with id and selected columns
   # Step 1: Build the column query string
    col_query = ", ".join(["id"] + selcols)

    # Step 2: Extract the file reference value
    file_ref_value = file_reference.file_reference  # assuming `file_reference` is a SQLAlchemy model object

    # Step 3: Prepare the SQL query
    query = text(f"SELECT {col_query} FROM flight_data WHERE File_Reference = :file_ref_value")

    # Step 4: Execute and get dictionary-like results using .mappings()
    rows = db.execute(query, {"file_ref_value": file_ref_value}).mappings().all()
    

    if not rows:
        raise HTTPException(status_code=404, detail="No rows in flight_data")

    results = []

    # Step 3: Loop through all rows and compute
    for row in rows:
        row_dict = dict(row)
        row_id = row_dict.pop("id")

        try:
            result = eval(equation, {"__builtins__": {}}, row_dict)
        
           
        except Exception as e:
            result = None  # Or log error
            continue

        # Step 4: Update target column
        update_query = text(f"UPDATE flight_data SET {target_col} = :result WHERE id = :id")
        # Print the SQL query for debugging purposes
        print(f"SQL Query: {str(update_query)}")
        print(f"Parameters: result = {result}, id = {row_id}")
        db.execute(update_query, {"result": result, "id": row_id})

        results.append({
            "row_id": row_id,
            "used_values": row_dict,
            "result": result
        })

    db.commit()

    # Step 5: Return the result
    return {
        "message": f"Rule '{rule.rule_name}' executed for {len(results)} rows",
        "results": results[:10],  # Return top 10 results for preview
        "target_column": target_col
    }