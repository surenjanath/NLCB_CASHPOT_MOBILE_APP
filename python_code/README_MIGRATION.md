# SQLite to Supabase Migration Script

This standalone Python script migrates lottery data from your local SQLite database to Supabase.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd python_code
pip install -r requirements.txt
```

### 2. Ensure Environment Variables
Make sure your `.env` file (in the project root) contains:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Run the Migration
```bash
python migrate_to_supabase.py
```

## 📋 Prerequisites

- **Python 3.7+** installed
- **Supabase project** set up with the `lotto_results` table
- **SQLite database** (`Lotto_Results_Database(3).db`) in the `database/` folder
- **Environment variables** configured in `.env`

## 🗄️ Database Schema

The script expects the following table structure in Supabase:

```sql
CREATE TABLE lotto_results (
  id BIGSERIAL PRIMARY KEY,
  draw_num INTEGER UNIQUE NOT NULL,
  date DATE NOT NULL,
  numbers TEXT NOT NULL,
  power_ball INTEGER NOT NULL,
  multiplier INTEGER NOT NULL,
  jackpot DECIMAL(15,2) NOT NULL,
  wins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 How It Works

1. **Connection Test**: Verifies Supabase credentials and connectivity
2. **Table Check**: Ensures the `lotto_results` table exists
3. **Data Extraction**: Reads all records from SQLite database
4. **Data Transformation**: Converts data to match Supabase schema
5. **Batch Upload**: Uploads data in batches of 100 records
6. **Progress Tracking**: Shows real-time progress and success rates

## ⚠️ Important Notes

- **Data Overwrite**: The script will clear existing data in Supabase before uploading
- **Batch Processing**: Large datasets are processed in batches to avoid timeouts
- **Error Handling**: Failed batches are logged with detailed error messages
- **Validation**: Records with missing data are skipped and logged

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check your Supabase URL and API key
   - Ensure your IP is not blocked by Supabase

2. **Table Not Found**
   - Run the SQL from `SUPABASE_SETUP.md` to create the table
   - Check table permissions in Supabase dashboard

3. **Permission Denied**
   - Verify your API key has write permissions
   - Check Row Level Security (RLS) policies

4. **Timeout Errors**
   - Reduce batch size in the script (currently 100)
   - Check your internet connection

### Debug Mode

To see more detailed output, you can modify the script to add debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📊 Migration Statistics

The script provides detailed statistics:
- Total records processed
- Success/failure counts
- Success rate percentage
- Batch-by-batch progress

## 🔒 Security

- API keys are loaded from environment variables
- No sensitive data is logged
- Connection uses HTTPS
- Batch processing prevents memory issues

## 📝 Customization

You can modify the script to:
- Change batch sizes
- Add data validation rules
- Modify the data transformation logic
- Add custom error handling
- Change the table schema

## 🆘 Support

If you encounter issues:
1. Check the error messages in the console
2. Verify your Supabase configuration
3. Ensure the SQLite database is accessible
4. Check your Python environment and dependencies
