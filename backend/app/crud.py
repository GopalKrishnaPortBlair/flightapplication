from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from . import models, schemas, database



# Flag to control row insertion behavior
UPLOAD_ALL_ROWS = False  # Set to True to upload all rows, False to upload only first 10 rows

def insert_rows_into_test_table(db: Session, data: list):
    # Insert rows into the 'test' table (up to 10 rows depending on the flag)
    rows_to_insert = data[:10] if not UPLOAD_ALL_ROWS else data  # Only take first 10 rows if flag is False
    
    for row in rows_to_insert:
        query = text("""
            INSERT INTO test (File_Reference, Quarter, Year, Marketing_Airline) 
            VALUES (:File_Reference, :Quarter, :Year, :Marketing_Airline)
        """)
        db.execute(query, row)
    db.commit()


def insert_rows_into_test_table_v2(db: Session, data: list):
    rows_to_insert = data[:10] if not UPLOAD_ALL_ROWS else data

    if not rows_to_insert:
        return  # No data to insert

    # Dynamically get column names from keys of first row
    columns = list(rows_to_insert[0].keys())
    
    # Prepare placeholders like :File_Reference, :Quarter, etc.
    placeholders = [f":{col}" for col in columns]

    # Construct the SQL query
    query_str = f"""
        INSERT INTO flight_data ({', '.join(columns)})
        VALUES ({', '.join(placeholders)})
    """
    query = text(query_str)

    # Execute for each row
    for row in rows_to_insert:
        db.execute(query, row)

    db.commit()

def insert_upload_log(db: Session, log_data: dict):
    # Insert a log entry for the uploaded file
    query = text("""
        INSERT INTO file_upload_log (File_Reference, File_Name, Upload_Timestamp)
        VALUES (:File_Reference, :File_Name, :Upload_Timestamp)
    """)
    db.execute(query, log_data)
    db.commit()

def get_uploaded_files(db: Session):
    return db.query(models.FileUploadLog).order_by(models.FileUploadLog.upload_timestamp.desc()).all()



def get_file_by_id(db: Session, file_id: int):
    query = db.query(models.FileUploadLog).filter(models.FileUploadLog.file_reference == file_id)
    print("📌 SQL Query:", str(query))  # Debug: Print SQLAlchemy query string
    return query.first()

FlightDataModel = models.generate_sqlalchemy_model("flight_data", database.engine)


def get_test_records_by_file_reference(db: Session, file_reference: str):
    #return db.query(FlightDataModel).filter(FlightDataModel.__table__.columns.get('File_Reference')   == file_reference).all()
    # In the crud.py file, change this line:
    # Ensure File_Reference exists as part of the model
    #records = db.query(FlightDataModel).filter("File_Reference" == file_reference).all()
    records = db.query(FlightDataModel).all()
    return records


# ✅ NEW FUNCTION to return full file details + test records

def get_file_details_with_records(file_id: int, db: Session) -> schemas.FileDetailsSchema | None:
    file = get_file_by_id(db, file_id)
    if not file:
        return None

    records = get_test_records_by_file_reference(db, file.file_reference)
    return schemas.FileDetailsSchema(
        file=file,
        records=records
    )
