import os
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
import pandas as pd
from sqlalchemy.exc import SQLAlchemyError

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DATABASE_URL = "mysql+pymysql://root:root@localhost/flight"
engine = create_engine(DATABASE_URL, echo=True)  # This logs all SQL queries for debugging

# Flag to control whether to upload all rows or just the first 10
UPLOAD_ALL_ROWS = False  # Set to True to upload all rows, False to upload only first 10 rows

@app.post("/upload/")
async def upload_excel(file: UploadFile = File(...)):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only Excel files are supported.")

    # Generate a unique reference based on the current date and time (up to seconds)
    file_reference = datetime.now().strftime("%Y%m%d%H%M%S")  # Format: YYYYMMDDHHMMSS

    # Save the uploaded file with the new name (File_Reference)
    file_extension = file.filename.split('.')[-1]  # Extract the extension
    new_file_name = f"{file_reference}.{file_extension}"  # Rename to file_reference.extension
    file_location = os.path.join(UPLOAD_FOLDER, new_file_name)
    
    # Save the file with the new file reference name
    try:
        with open(file_location, "wb") as f:
            f.write(await file.read())
        print(f"File saved as: {new_file_name}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    try:
        # Read the Excel file into DataFrame
        df = pd.read_excel(file_location)
        df = df.where(pd.notnull(df), None)  # Replace NaN with None (NULL)
        df = df.iloc[:, :2]  # Only the first 2 columns (Quarter, Year)
        df.columns = ['Quarter', 'Year']  # Rename columns to match the database

        # Add the file reference as a new column in the DataFrame
        df['File_Reference'] = file_reference

        # Select the rows to upload based on the flag
        if UPLOAD_ALL_ROWS:
            rows_to_upload = df
        else:
            rows_to_upload = df.head(10)  # Only first 10 rows for testing

        print("✅ Preview of DataFrame with unique reference:")
        print(rows_to_upload.head())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading Excel file: {str(e)}")

    try:
        with engine.begin() as conn:
            # Insert data into the 'test' table
            for i, row in rows_to_upload.iterrows():
                data = row.to_dict()
                print(f"🔄 Inserting row {i + 1}: {data}")
                query = text("""
                    INSERT INTO test (File_Reference, Quarter, Year) 
                    VALUES (:File_Reference, :Quarter, :Year)
                """)
                conn.execute(query, data)

            print("✅ All selected rows inserted successfully with reference.")

            # Insert the file upload log into the 'file_upload_log' table
            upload_timestamp = datetime.now()
            log_query = text("""
                INSERT INTO file_upload_log (File_Reference, File_Name, Upload_Timestamp)
                VALUES (:File_Reference, :File_Name, :Upload_Timestamp)
            """)
            log_data = {
                'File_Reference': file_reference,
                'File_Name': new_file_name,  # Use the new file name with file reference
                'Upload_Timestamp': upload_timestamp
            }

            try:
                conn.execute(log_query, log_data)
                print(f"✅ File upload logged successfully with reference {file_reference}.")
            except SQLAlchemyError as e:
                print(f"❌ Error inserting file upload log: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error logging file upload: {str(e)}")

    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database insertion error: {str(e)}")

    return {"message": f"{file.filename} uploaded and inserted with reference {file_reference}."}
