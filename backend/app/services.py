import os
from datetime import datetime
from fastapi import UploadFile
import pandas as pd
from sqlalchemy.orm import Session
from . import database, models, crud

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

UPLOAD_ALL_ROWS = False  # Set this to True to upload all rows, False to upload first 10 rows

def process_file_upload(file: UploadFile,db):
    # Step 1: Generate file reference and save the file to disk
    
    file_reference = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = file.filename  # original uploaded filename
    ext = os.path.splitext(filename)[1]  # gets the extension, like .xlsx
    file_location = os.path.join(UPLOAD_FOLDER, f"{file_reference}{ext}")
   

    with open(file_location, "wb") as f:
        f.write(file.file.read())

    # Step 2: Process the Excel file
    try:
        # Read the Excel file into a DataFrame
        df = pd.read_excel(file_location)
        # Replace all spaces in column names with underscores
        df.columns = df.columns.str.replace(r'[ \-\/\(\)=&]', '_', regex=True)

        #os.system('cls')
        #print("Uploaded file columns:", df.columns.tolist())
        df = df.where(pd.notnull(df), None)  # Replace NaN with None (NULL)

        # Assuming the Excel file contains columns 'Quarter' and 'Year' and renaming them
        #df = df[['Quarter', 'Year','Marketing_Airline']]  # Select only required columns
        df['File_Reference'] = file_reference  # Add file reference to DataFrame
        
    except Exception as e:
        raise ValueError(f"Error processing the Excel file: {str(e)}")

    # Step 3: Insert rows into the 'test' table and file upload log
    #db = database.SessionLocal()

    # Convert DataFrame to list of dictionaries
    data = df.to_dict(orient='records')  # Convert each row to a dictionary

    # Insert rows into the 'test' table (up to 10 rows depending on the flag)
    crud.insert_rows_into_test_table_v2(db, data)

   

    # Insert file upload log
    upload_timestamp = datetime.now()
    log_data = {
        'File_Reference': file_reference,
        'File_Name': f"{file_reference}{ext}",
        'Upload_Timestamp': upload_timestamp
    }
    crud.insert_upload_log(db, log_data)

    return file_reference
