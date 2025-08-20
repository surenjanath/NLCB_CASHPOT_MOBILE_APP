#!/usr/bin/env python3
"""
Standalone script to migrate lottery data from SQLite database to Supabase.
This script reads from the local SQLite database and pushes the data to Supabase.
"""

import os
import sqlite3
import requests
import json
from datetime import datetime
from typing import List, Dict, Any
import sys

# Add the parent directory to the path to access .env
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables from .env file
def load_env():
    """Load environment variables from system environment or .env file"""
    # Check system environment first (GitHub Actions)
    supabase_url = os.environ.get('EXPO_PUBLIC_SUPABASE_URL')
    supabase_key = os.environ.get('EXPO_PUBLIC_SUPABASE_ANON_KEY')
    
    if supabase_url and supabase_key:
        return {
            'EXPO_PUBLIC_SUPABASE_URL': supabase_url,
            'EXPO_PUBLIC_SUPABASE_ANON_KEY': supabase_key
        }
    
    # Fallback to .env file for local development
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(env_path):
        env_vars = {}
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value
        return env_vars
    
    print("❌ No Supabase credentials found")
    sys.exit(1)


def update_supabase_with_new_data(scraped_data: List[Dict[str, Any]]) -> int:
    """
    Update Supabase with new data from the scraper.
    This function is designed to be imported and used by the scraper.
    
    Args:
        scraped_data: List of dictionaries containing scraped lottery data
        
    Returns:
        int: Number of new records added to Supabase
    """
    try:
        # Load environment variables
        env_vars = load_env()
        
        supabase_url = env_vars.get('EXPO_PUBLIC_SUPABASE_URL')
        supabase_key = env_vars.get('EXPO_PUBLIC_SUPABASE_ANON_KEY')
        
        if not supabase_url or not supabase_key:
            print("❌ Missing required environment variables for Supabase update")
            return 0
        
        # Initialize migrator
        migrator = SupabaseMigrator(supabase_url, supabase_key)
        
        # Test connection
        if not migrator.test_connection():
            print("❌ Failed to connect to Supabase")
            return 0
        
        # Check if table exists
        if not migrator.check_table_exists():
            print("❌ Table 'lotto_results' does not exist in Supabase")
            return 0
        
        # Get latest date from Supabase to determine what's new
        latest_date = migrator.get_latest_date_in_supabase()
        
        # Transform scraped data to match Supabase schema
        transformed_data = migrator.transform_scraped_data(scraped_data)
        
        if not transformed_data:
            print("❌ No valid data after transformation")
            return 0
        
        # Filter out data that already exists in Supabase
        if latest_date:
            # Only keep records newer than the latest date in Supabase
            filtered_data = []
            for record in transformed_data:
                if record['date'] > latest_date:
                    filtered_data.append(record)
            
            if not filtered_data:
                print("✅ No new data to add - Supabase is already up to date")
                return 0
            
            print(f"📥 Found {len(filtered_data)} new records to add to Supabase")
            transformed_data = filtered_data
        else:
            print(f"📥 No existing data in Supabase - adding all {len(transformed_data)} records")
        
        # Upload new data to Supabase
        success = migrator.upload_to_supabase(transformed_data)
        
        if success:
            print(f"✅ Successfully added {len(transformed_data)} new records to Supabase")
            return len(transformed_data)
        else:
            print("❌ Failed to upload data to Supabase")
            return 0
            
    except Exception as e:
        print(f"❌ Error updating Supabase: {e}")
        return 0

class SupabaseMigrator:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase_url = supabase_url.rstrip('/')
        self.supabase_key = supabase_key
        self.headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
    
    def test_connection(self) -> bool:
        """Test the Supabase connection"""
        try:
            # Test basic connectivity
            response = requests.get(
                f"{self.supabase_url}/rest/v1/",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                print("✅ Successfully connected to Supabase")
                return True
            elif response.status_code == 401:
                print("❌ Authentication failed - check your API key")
                print("Make sure you're using a valid Supabase API key")
                return False
            elif response.status_code == 403:
                print("❌ Access forbidden - check your API key permissions")
                return False
            else:
                print(f"❌ Failed to connect to Supabase: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection failed - check your internet connection and Supabase URL")
            return False
        except requests.exceptions.Timeout:
            print("❌ Connection timeout - check your internet connection")
            return False
        except Exception as e:
            print(f"❌ Error connecting to Supabase: {e}")
            return False
    
    def check_table_exists(self) -> bool:
        """Check if the lotto_results table exists and is accessible"""
        print("📋 Checking if lotto_results table exists...")
        
        try:
            response = requests.get(
                f"{self.supabase_url}/rest/v1/lotto_results?select=draw_num&limit=1",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                print("✅ Table 'lotto_results' exists and is accessible")
                return True
            elif response.status_code == 404:
                print("❌ Table 'lotto_results' does not exist")
                print("Please create the table first using the SQL in sql_in_supabase.sql")
                return False
            else:
                print(f"❌ Unexpected response: {response.status_code}")
                print(f"Response body: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error checking table: {e}")
            return False
    
    def get_latest_date_in_supabase(self) -> str | None:
        """Get the latest date from the existing data in Supabase"""
        print("🔍 Checking latest date in Supabase...")
        
        try:
            response = requests.get(
                f"{self.supabase_url}/rest/v1/lotto_results?select=date&order=date.desc&limit=1",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    latest_date = data[0]['date']
                    print(f"✅ Latest date in Supabase: {latest_date}")
                    return latest_date
                else:
                    print("✅ No existing data found in Supabase")
                    return None
            else:
                print(f"⚠️  Could not check latest date: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"⚠️  Error checking latest date: {e}")
            return None
    
    def transform_scraped_data(self, scraped_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transform scraped data to match Supabase schema"""
        transformed = []
        
        for record in scraped_data:
            # Map scraped data fields to Supabase fields
            # Scraped: Date, Draw#, Numbers, Power Ball, Multiplier, Jackpot, Wins
            # Supabase: date, draw_num, numbers, power_ball, multiplier, jackpot, wins
            
            # Clean and convert jackpot from string to numeric
            jackpot_str = str(record.get("Jackpot", "0"))
            jackpot_clean = jackpot_str.replace('$', '').replace(',', '')
            try:
                jackpot_value = float(jackpot_clean) if jackpot_clean else 0
            except ValueError:
                jackpot_value = 0
            
            # Clean and convert wins from string to integer
            wins_str = str(record.get("Wins", "0"))
            try:
                wins_value = int(wins_str) if wins_str and wins_str != "nan" else 0
            except ValueError:
                wins_value = 0
            
            # Clean and convert power_ball and multiplier
            power_ball_str = str(record.get("Power Ball", "0"))
            try:
                power_ball_value = int(power_ball_str) if power_ball_str and power_ball_str != "nan" else 0
            except ValueError:
                power_ball_value = 0
            
            multiplier_str = str(record.get("Multiplier", "0"))
            try:
                multiplier_value = int(multiplier_str) if multiplier_str and multiplier_str != "nan" else 0
            except ValueError:
                multiplier_value = 0
            
            # Clean and convert draw_num
            draw_num_str = str(record.get("Draw#", "0"))
            try:
                draw_num_value = int(draw_num_str) if draw_num_str and draw_num_str != "nan" else 0
            except ValueError:
                draw_num_value = 0
            
            transformed_record = {
                "date": record.get("Date"),
                "draw_num": draw_num_value,
                "numbers": record.get("Numbers", ""),
                "power_ball": power_ball_value,
                "multiplier": multiplier_value,
                "jackpot": jackpot_value,
                "wins": wins_value
            }
            
            # Validate required fields (date and numbers are required)
            if transformed_record["date"] and transformed_record["numbers"]:
                transformed.append(transformed_record)
            else:
                print(f"⚠️  Skipping record with missing required data: {record}")
        
        print(f"🔄 Transformed {len(transformed)} valid records")
        return transformed
    
    def get_sqlite_data(self, db_path: str, latest_date: str | None = None) -> List[Dict[str, Any]]:
        """Extract data from SQLite database, optionally filtering by latest date"""
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Get table schema
            cursor.execute("PRAGMA table_info(lotto_data)")
            columns = cursor.fetchall()
            print(f"📊 Found {len(columns)} columns in SQLite table")
            
            # Build query based on whether we need to filter by date
            if latest_date:
                print(f"🔍 Filtering SQLite data for dates newer than: {latest_date}")
                cursor.execute(
                    "SELECT * FROM lotto_data WHERE DrawDate > ? ORDER BY DrawDate DESC",
                    (latest_date,)
                )
            else:
                print("📥 Getting all data from SQLite (no date filter)")
                cursor.execute("SELECT * FROM lotto_data ORDER BY DrawDate DESC")
            
            rows = cursor.fetchall()
            
            # Convert to list of dictionaries
            data = []
            for row in rows:
                row_dict = {}
                for i, column in enumerate(columns):
                    row_dict[column[1]] = row[i]
                data.append(row_dict)
            
            conn.close()
            
            if latest_date:
                print(f"📥 Extracted {len(data)} new records from SQLite (after {latest_date})")
            else:
                print(f"📥 Extracted {len(data)} records from SQLite")
            
            return data
            
        except Exception as e:
            print(f"❌ Error reading SQLite database: {e}")
            return []
    
    def transform_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transform data to match Supabase schema"""
        transformed = []
        
        for record in data:
            # Map SQLite fields to Supabase fields
            # SQLite: DrawDate, DrawNum, Numbers, Power_Ball, Multiplier, Jackpot, Wins
            # Supabase: date, draw_num, numbers, power_ball, multiplier, jackpot, wins
            
            # Clean and convert jackpot from string to numeric
            jackpot_str = str(record.get("Jackpot", "0"))
            jackpot_clean = jackpot_str.replace('$', '').replace(',', '')
            try:
                jackpot_value = float(jackpot_clean) if jackpot_clean else 0
            except ValueError:
                jackpot_value = 0
            
            # Clean and convert wins from string to integer
            wins_str = str(record.get("Wins", "0"))
            try:
                wins_value = int(wins_str) if wins_str and wins_str != "nan" else 0
            except ValueError:
                wins_value = 0
            
            # Clean and convert power_ball and multiplier
            power_ball_str = str(record.get("Power_Ball", "0"))
            try:
                power_ball_value = int(power_ball_str) if power_ball_str and power_ball_str != "nan" else 0
            except ValueError:
                power_ball_value = 0
            
            multiplier_str = str(record.get("Multiplier", "0"))
            try:
                multiplier_value = int(multiplier_str) if multiplier_str and multiplier_str != "nan" else 0
            except ValueError:
                multiplier_value = 0
            
            # Clean and convert draw_num
            draw_num_str = str(record.get("DrawNum", "0"))
            try:
                draw_num_value = int(draw_num_str) if draw_num_str and draw_num_str != "nan" else 0
            except ValueError:
                draw_num_value = 0
            
            transformed_record = {
                "date": record.get("DrawDate"),
                "draw_num": draw_num_value,
                "numbers": record.get("Numbers", ""),
                "power_ball": power_ball_value,
                "multiplier": multiplier_value,
                "jackpot": jackpot_value,
                "wins": wins_value
            }
            
            # Validate required fields (date and numbers are required)
            if transformed_record["date"] and transformed_record["numbers"]:
                transformed.append(transformed_record)
            else:
                print(f"⚠️  Skipping record with missing required data: {record}")
        
        print(f"🔄 Transformed {len(transformed)} valid records")
        return transformed
    
    def upload_to_supabase(self, data: List[Dict[str, Any]]) -> bool:
        """Upload data to Supabase in batches"""
        if not data:
            print("❌ No data to upload")
            return False
        
        batch_size = 100
        total_batches = (len(data) + batch_size - 1) // batch_size
        
        print(f"📤 Uploading {len(data)} records in {total_batches} batches...")
        
        success_count = 0
        error_count = 0
        
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            
            print(f"📦 Processing batch {batch_num}/{total_batches} ({len(batch)} records)...")
            
            try:
                response = requests.post(
                    f"{self.supabase_url}/rest/v1/lotto_results",
                    headers=self.headers,
                    json=batch
                )
                
                if response.status_code == 201:
                    success_count += len(batch)
                    print(f"✅ Batch {batch_num} uploaded successfully")
                else:
                    error_count += len(batch)
                    print(f"❌ Batch {batch_num} failed: {response.status_code}")
                    print(f"Response: {response.text}")
                    
            except Exception as e:
                error_count += len(batch)
                print(f"❌ Batch {batch_num} error: {e}")
        
        print(f"\n📊 Upload Summary:")
        print(f"✅ Successful: {success_count}")
        print(f"❌ Failed: {error_count}")
        print(f"📈 Success Rate: {(success_count / len(data)) * 100:.1f}%")
        
        return error_count == 0
    

    
    def clear_existing_data(self) -> bool:
        """Clear existing data from Supabase table"""
        print("🗑️  Clearing existing data from Supabase...")
        
        try:
            # Delete all records from the table - service role key allows this
            response = requests.delete(
                f"{self.supabase_url}/rest/v1/lotto_results",
                headers=self.headers
            )
            
            if response.status_code == 204:
                print("✅ Existing data cleared successfully")
                return True
            else:
                print(f"⚠️  Could not clear data: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error clearing data: {e}")
            return False

def main():
    print("🚀 Starting SQLite to Supabase Smart Sync")
    print("=" * 50)
    
    # Load environment variables
    env_vars = load_env()
    
    supabase_url = env_vars.get('EXPO_PUBLIC_SUPABASE_URL')
    supabase_key = env_vars.get('EXPO_PUBLIC_SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing required environment variables:")
        print("   EXPO_PUBLIC_SUPABASE_URL")
        print("   EXPO_PUBLIC_SUPABASE_ANON_KEY")
        print("\n💡 Tip: For migration, use the service_role key for full access")
        sys.exit(1)
    
    print(f"🔗 Supabase URL: {supabase_url}")
    print(f"🔑 API Key: {supabase_key[:10]}...")
    
    # Initialize migrator
    migrator = SupabaseMigrator(supabase_url, supabase_key)
    
    # Test connection
    if not migrator.test_connection():
        sys.exit(1)
    
    # Check if table exists
    if not migrator.check_table_exists():
        print("\n❌ Table 'lotto_results' does not exist in Supabase.")
        print("Please create the table first using the SQL in sql_in_supabase.sql")
        sys.exit(1)
    
    # Get latest date from Supabase to determine what to sync
    latest_date = migrator.get_latest_date_in_supabase()
    
    # Get SQLite data
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'Lotto_Results_Database(3).db')
    
    if not os.path.exists(db_path):
        print(f"❌ SQLite database not found at: {db_path}")
        sys.exit(1)
    
    # Get data from SQLite, filtered by latest date if available
    data = migrator.get_sqlite_data(db_path, latest_date)
    if not data:
        if latest_date:
            print("✅ No new data to sync - Supabase is already up to date!")
            sys.exit(0)
        else:
            print("❌ No data found in SQLite database")
            sys.exit(1)
    
    # Transform data
    transformed_data = migrator.transform_data(data)
    if not transformed_data:
        print("❌ No valid data after transformation")
        sys.exit(1)
    
    # Show sync summary
    if latest_date:
        print(f"\n🔄 Sync Summary:")
        print(f"   📅 Latest date in Supabase: {latest_date}")
        print(f"   📥 New records to upload: {len(transformed_data)}")
        print(f"   🎯 This will add new records without affecting existing data")
    else:
        print(f"\n🆕 Initial Upload Summary:")
        print(f"   📥 Total records to upload: {len(transformed_data)}")
        print(f"   🎯 This will create the initial dataset")
    
    # Ask user to continue
    response = input("\nDo you want to continue? (yes/no): ").lower().strip()
    if response not in ['yes', 'y']:
        print("❌ Sync cancelled by user")
        sys.exit(0)
    
    # Upload data (no need to clear existing data for incremental sync)
    success = migrator.upload_to_supabase(transformed_data)
    
    if success:
        if latest_date:
            print("\n🎉 Sync completed successfully!")
            print(f"📊 New records added: {len(transformed_data)}")
            print(f"📅 Supabase now contains data up to the latest date")
        else:
            print("\n🎉 Initial upload completed successfully!")
            print(f"📊 Total records uploaded: {len(transformed_data)}")
            print(f"📅 Supabase now contains the complete dataset")
    else:
        print("\n⚠️  Sync completed with errors")
        print("Please check the logs above for details")
        sys.exit(1)

if __name__ == "__main__":
    main()
