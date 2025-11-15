#!/usr/bin/env python3
"""
Initialize RDS Database with Fresh Schema
Run this script to drop all existing tables and create fresh ones
"""

import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')

print(f"🔄 Connecting to RDS: {DB_HOST}")
print(f"   Database: {DB_NAME}")
print(f"   User: {DB_USER}")

try:
    import psycopg2
except ImportError:
    print("\n❌ psycopg2 not installed!")
    print("   Please install it using: pip install psycopg2-binary")
    exit(1)

try:
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    conn.autocommit = True
    cursor = conn.cursor()

    print('✅ Connected to RDS successfully!\n')

    # Read SQL file
    sql_file_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'drop_and_create_fresh.sql')

    print(f'📄 Reading SQL file: {sql_file_path}')
    with open(sql_file_path, 'r') as f:
        sql_script = f.read()

    print('🔄 Executing SQL script...\n')

    # Execute the entire script
    cursor.execute(sql_script)

    print('\n✅ Database schema created successfully!')
    print('\n📊 Created tables:')

    # List all tables
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)

    tables = cursor.fetchall()
    for table in tables:
        print(f'   - {table[0]}')

    print(f'\n✅ Total tables created: {len(tables)}')

    cursor.close()
    conn.close()

    print('\n🎉 Database initialization complete!')
    print('   You can now start the FastAPI backend.')

except FileNotFoundError:
    print(f'\n❌ SQL file not found at: {sql_file_path}')
    print('   Please make sure the file exists.')

except psycopg2.Error as e:
    print(f'\n❌ Database error: {str(e)}')
    print('   Please check your database credentials and connectivity.')

except Exception as e:
    print(f'\n❌ Unexpected error: {str(e)}')

print('\n' + '='*60)
