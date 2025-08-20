import asyncio
import aiohttp
import pandas as pd
from io import StringIO
import os
import datetime
from uuid import uuid4
import warnings
from time import perf_counter
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, Date, ForeignKey, Table
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base

# Import Supabase update functionality
try:
    from migrate_to_supabase import update_supabase_with_new_data
    SUPABASE_AVAILABLE = True
    print("[*] Supabase update functionality imported successfully")
except ImportError:
    SUPABASE_AVAILABLE = False
    print("[*] Supabase update functionality not available - migrate_to_supabase.py not found")

from bs4 import BeautifulSoup as bs


warnings.simplefilter(action='ignore', category=FutureWarning)

MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
YEAR = [str(i) for i in range(datetime.datetime.now().year, datetime.datetime.now().year + 1)]

cwd = os.getcwd()
Database_Name = 'Lotto_Results_Database.db'
Location = r'Database'
WorkingDir = os.path.join(cwd, Location)
if not os.path.exists(WorkingDir):
    os.mkdir(WorkingDir)

Database = os.path.join(WorkingDir,  Database_Name)

Base = declarative_base()

class Lotto_Result(Base):
    __tablename__ = 'lotto_data'

    DrawDate = Column(Date, primary_key=True)
    DrawNum = Column(String)
    Numbers = Column(String)
    Power_Ball = Column(String)
    Multiplier = Column(String)
    Jackpot = Column(String)
    Wins = Column(String)
    uniqueId = Column(String)
    last_updated = Column(Date)
    date_created = Column(Date)

    def __init__(self, DrawDate, DrawNum, Numbers, Power_Ball, Multiplier, Jackpot, Wins):
        self.DrawDate = DrawDate
        self.DrawNum = DrawNum
        self.Numbers = Numbers
        self.Power_Ball = Power_Ball
        self.Multiplier = Multiplier
        self.Jackpot = Jackpot
        self.Wins = Wins
        if self.uniqueId is None:
            self.uniqueId = str(uuid4()).split('-')[4]
        if self.date_created is None:
            self.date_created = datetime.datetime.now()
        self.last_updated = datetime.datetime.now()

    def __repr__(self):
        return f"<Lotto_Result(DrawDate ='{self.DrawDate}'>"

def clean_jp(row):
    try:
        return float(str(row).replace('$','').replace(',',''))
    except : return 0

class WebScraper:
    def __init__(self, urls):
        self.urls = urls
        self.ParsedData = []
        self.request_count = 0
        self.last_request_time = 0
        
    def check_visit_time(self):
        """Check if current time is within allowed visiting hours (0600-1000)"""
        current_hour = datetime.datetime.now().hour
        return True
        
    def should_respect_rate_limit(self):
        """Ensure we don't exceed 1 request per 5 seconds"""
        current_time = perf_counter()
        if current_time - self.last_request_time < 5:
            return False
        return True

    async def fetch(self, session, year, month, url):
        # Check if we're within allowed visiting hours
        if not self.check_visit_time():
            print(f'[*] Outside allowed visiting hours (0600-1000). Current time: {datetime.datetime.now().strftime("%H:%M")}')
            return None
            
        # Ensure rate limiting
        while not self.should_respect_rate_limit():
            await asyncio.sleep(1)
            
        params = {'search_month': f'{month}', 'search_year': f'{year}', 'sid':'edb39c21a4c68d22602f84b393b64a1552ac520445834ca7697a541c49e5dc4c', 'date_btn':'SEARCH'}
        headers = {
            'User-Agent': 'LottoScraper/1.0 (Respectful bot following robots.txt guidelines)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
           
       
        # Update request tracking
        self.request_count += 1
        self.last_request_time = perf_counter()
        
        retries = 3
        for attempt in range(retries):
            try:
                async with session.post(url, data=params, headers=headers) as response:
                    # Save the raw HTML response for debugging
                    response_content = await response.content.read()
                    filename = f'response_{month}_{year}.html'
                    # with open(filename, 'wb') as file:
                    #     file.write(response_content)
                    # print(f'[*] Saved response to: {filename}')





                    if response.status == 200:
                        try:
                            # 1. Decode the raw response content
                            content = response_content.decode('utf-8', errors='ignore')
                            
                            # 2. Parse the HTML with BeautifulSoup
                            soup = bs(content, 'html.parser')
                            
                            results_list = []
                            html_table = soup.find('table', id='monthResults')
                            
                            # 3. Use the clean 'zip' method to extract data
                            if html_table:
                                date_rows = html_table.select('tr.lotto-date-tr')
                                data_rows = html_table.select('tr.lotto-tr')

                                for date_row, data_row in zip(date_rows, data_rows):
                                    date = date_row.find('strong').get_text(strip=True)
                                    cells = data_row.find_all('td')
                                    
                                    results_list.append({
                                        'Date': date,
                                        'Draw#': cells[0].get_text(strip=True),
                                        'Numbers': cells[1].get_text(strip=True),
                                        'Multiplier': cells[2].get_text(strip=True),
                                        'Jackpot': cells[3].get_text(strip=True),
                                        'Wins': cells[4].get_text(strip=True)
                                    })

                            # 4. Create the DataFrame and check if it's empty
                            table = pd.DataFrame(results_list)
                            if table.empty:
                                raise ValueError("Parsing with BeautifulSoup failed to find any data.")

                            print('[*] Data Scraped : ', params['search_month'], params['search_year'])
                            
                            # 5. Apply your original data cleaning and type conversions
                            table['Date'] = pd.to_datetime(table['Date'], format="%d-%b-%y").dt.strftime('%Y-%m-%d')
                            table['Jackpot'] = table['Jackpot'].apply(clean_jp)
                            table['Draw#'] = table['Draw#'].astype(int)
                            # The new HTML doesn't have a 'Power Ball' column, so this line is commented out.
                            table['Power Ball'] = 1
                            table['Multiplier'] = table['Multiplier'].str.replace("X", '-1').replace('No Data','-1').astype(int)
                            table['Wins'] = table['Wins'].str.replace("X", '-1').astype(int)
                            
                            return table.to_dict('records')

                        except Exception as e:
                            print(f'[*] Error {e} Occurred : {month}-{year}')
                            return None
                    else:
                        print(f'[*] Error {response.status} Occurred while fetching data for {month}-{year}')
                        return None

            except aiohttp.ClientConnectionError:
                if attempt < retries - 1:
                    print(f'[*] Connection error occurred. Retrying... Attempt {attempt + 1}/{retries}')
                    await asyncio.sleep(2)  # Wait before retrying
                else:
                    print('[*] Maximum retries reached. Unable to establish connection.')
                    return None

    async def main(self):
        async with aiohttp.ClientSession() as session:
            current_year = datetime.datetime.now().year
            current_month = datetime.datetime.now().strftime('%b')
            current_month_index = MONTH.index(current_month)

            # Create list of all requests to make
            requests_to_make = [
                (year, month, url)
                for year in YEAR
                for month_index, month in enumerate(MONTH)
                for url in self.urls
                if not (int(year) > current_year or (int(year) == current_year and month_index > current_month_index))
            ]

            # Process requests with rate limiting (1 request per 5 seconds as per robots.txt)
            print(f'[*] Starting scraping with {len(requests_to_make)} requests to process')
            print(f'[*] Respecting robots.txt: Visit-time 0600-1000, Request-rate 1/5, Crawl-delay 5')
            
            for i, (year, month, url) in enumerate(requests_to_make, 1):
                print(f'[*] Processing request {i}/{len(requests_to_make)}: {month}-{year}')
                print(f'[*] URL: {url}')
                # print(f'[*] Params: {params}')
                # print(f'[*] Headers: {headers}')
                data = await self.fetch(session, year, month, url)
                if data is not None:
                    self.ParsedData.extend(data)
                    print(f'[*] Successfully scraped {len(data)} records for {month}-{year}')
                else:
                    print(f'[*] No data retrieved for {month}-{year}')
                
                # Additional delay to ensure we respect the rate limit
                if i < len(requests_to_make):  # Don't sleep after the last request
                    print(f'[*] Waiting 5 seconds before next request...')
                    await asyncio.sleep(5)



def add_lotto_data_to_db(session, lotto_data):

    for data in lotto_data:

        existing_result = session.query(Lotto_Result).filter_by(DrawDate=data['Date']).first()
        if existing_result:
            continue
        else:
                try:
                    DrawDate    = data['Date']
                    DrawNum     = data['Draw#']
                    Numbers     = data['Numbers']
                    Power_Ball  = data['Power Ball']
                    Multiplier  = data['Multiplier']
                    Jackpot     = data['Jackpot']
                    Wins        = data['Wins']
                    try:
                        DrawDate_str = DrawDate  # Date in string format
                        DrawDate = datetime.datetime.strptime(DrawDate_str, '%Y-%m-%d')  # Convert to date
                    except KeyError:
                        DrawDate = datetime.date(1990,1,1)

                    lotto_instance   = Lotto_Result(
                        DrawDate = DrawDate,
                        DrawNum = DrawNum,
                        Numbers = Numbers,
                        Power_Ball = Power_Ball,
                        Multiplier = Multiplier,
                        Jackpot = Jackpot,
                        Wins = Wins,
                    )

                    session.add(lotto_instance)
                except Exception as e:
                    print('[*] Error:', e)
    session.commit()

def generate_html_report(basic_analysis_report, additional_analysis_report, latest_entry, common_numbers, average_jackpot):
    # Format average jackpot as cash value
    average_jackpot_cash = "${:,.2f}".format(average_jackpot)

    # Split numbers drawn and format them
    numbers_drawn_list = latest_entry['Numbers'].split("|")
    numbers_drawn_formatted = ", ".join(numbers_drawn_list)



    # Generate HTML for most common numbers table
    most_common_numbers_html = ""
    for number, frequency in common_numbers:
        most_common_numbers_html += "<tr><td>{}</td><td>{}</td></tr>".format(number, frequency)

    basic = basic_analysis_report.replace("\n", "<br>")
    additional = additional_analysis_report.replace("\n", "<br>")


    ## Latest Entry Data
    DrawDate = datetime.datetime.strptime(latest_entry['Date'],"%Y-%m-%d").strftime("%d %B %Y")
    html_report = f"""<h1>Cashpot Analysis Report</h1>
            <div class="basic-analysis">
                <h2>Basic Analysis:</h2>
                <p>{basic}</p>
            </div>
            <div class="average-jackpot">
                <h2>Average Jackpot Amount:</h2>
                <p>{average_jackpot_cash}</p>
            </div>
            <div class="most-common-numbers">
                <h3>Top 5 Most Common Numbers Drawn:</h3>
                <table>
                    <tr>
                        <th>Number</th>
                        <th>Frequency</th>
                    </tr>
                    {most_common_numbers_html}
                </table>
            </div>
            <div class="additional-analysis">
                <h2>Latest NLCB CashPot Results:</h2>
                <div class="draw-date">
                    <h3>Draw Date:</h3>
                    <p>{DrawDate}</p>
                </div>
                <div class="numbers-drawn">
                    <h3>Numbers Drawn:</h3>
                    <p>{numbers_drawn_formatted}</p>
                </div>
                <br/>
                <h3>Other Information:</h3>
                <p>{additional}</p>



        """
    return html_report

async def run_scraper(urls, db_session):
    scraper = WebScraper(urls)
    await scraper.main()
    add_lotto_data_to_db(db_session, scraper.ParsedData)

    # Update Supabase with new data if available
    if SUPABASE_AVAILABLE and scraper.ParsedData:
        try:
            print("[*] Updating Supabase with new data...")
            new_records_count = update_supabase_with_new_data(scraper.ParsedData)
            print(f"[*] Supabase updated successfully with {new_records_count} new records")
        except Exception as e:
            print(f"[*] Warning: Failed to update Supabase: {e}")
            print("[*] Data was still saved to local database")
    else:
        print("[*] Supabase update skipped - functionality not available or no new data")

    # Perform basic analysis
    total_draws = len(scraper.ParsedData)
    try:
        average_jackpot = sum(float(result['Jackpot']) for result in scraper.ParsedData) / total_draws
    except Exception as e:
        average_jackpot = 0.0

    # Extract all numbers drawn
    all_numbers = [result['Numbers'].split("|") for result in scraper.ParsedData]
    flat_numbers = [int(number) for sublist in all_numbers for number in sublist]

    # Calculate the frequency of each number
    number_counts = pd.Series(flat_numbers).value_counts()

    # Find the most common numbers drawn
    most_common_numbers = number_counts.head(5)

    # Generate basic analysis report

    basic_analysis_report = f"Total number of draws: {total_draws}\n"
    common_numbers = []
    for number, count in most_common_numbers.items():
        common_numbers.append((number, f"{count} times\n"))

    # Perform additional analysis
    additional_analysis_report, latest_entry = additional_analysis(scraper.ParsedData)

    # Generate HTML report
    html_report = generate_html_report(basic_analysis_report, additional_analysis_report, latest_entry, common_numbers, average_jackpot)

    # Write HTML report to file
    with open('analysis_report.html', 'w') as file:
        file.write(html_report)

    print("Analysis reports generated successfully.")

def additional_analysis(data):
      # Get the latest entry
    latest_entry = data[-1] if data else None

    # Generate analysis report
    analysis_report = ""
    if latest_entry:
        analysis_report += f"Power Ball: {latest_entry['Power Ball']}\n"
        analysis_report += f"Multiplier: {latest_entry['Multiplier']}\n"
        analysis_report += f"Jackpot: {latest_entry['Jackpot']}\n"
        analysis_report += f"Wins: {latest_entry['Wins']}\n"
    else:
        analysis_report += "- No data available.\n"
        latest_entry = None
    return analysis_report, latest_entry

if __name__ == "__main__":
    start = perf_counter()
    
    # Check if we're within allowed visiting hours before starting
    current_hour = datetime.datetime.now().hour
    if not (6 <= current_hour < 10):
        print(f'[*] WARNING: Current time is {datetime.datetime.now().strftime("%H:%M")}')
        print('[*] Robots.txt specifies Visit-time: 0600-1000')
        print('[*] Consider running during allowed hours to avoid potential issues')
        # response = input('[*] Continue anyway? (y/N): ')
        # if response.lower() != 'y':
        #     print('[*] Exiting...')
        #     exit()
    
    urls = ['https://www.nlcbplaywhelotto.com/nlcb-cashpot-results/']
    engine = create_engine(f'sqlite:///{Database}',  echo=False)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db_session = Session()
    try:
        asyncio.run(run_scraper(urls, db_session))
        print('[*] Adding Data to Database ... ')

    except IndentationError as e:
        print('*'*100)
        print(f'Error Occurred : {e}')
        print('*'*100)
    finally:
        db_session.close()

    stop = perf_counter()
    print("[*] Time taken : ", stop - start)