# Nestora — Real Estate Portal

A complete full-stack project created for the **3Skill final project: Real Estate Portal**.

## Included Requirements

- Property listings with responsive property cards
- Search and advanced filters
- Sale and rent properties
- Property details page
- Contact-owner enquiry form
- Favourite properties saved per browser
- Admin login and dashboard
- Add, edit, and delete properties
- Change property status to Available, Sold, or Rented
- View and update enquiry status
- SQLite database with sample property data
- FastAPI interactive API documentation

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Python FastAPI
- **Database:** SQLite
- **API:** REST API

## Run on Windows

### Easy method

Double-click:

```text
run.bat
```

The script creates a virtual environment, installs dependencies, and starts the project.

### Manual method

Open Command Prompt or PowerShell inside the project folder:

```powershell
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Then open:

- Website: `http://127.0.0.1:8000`
- Admin Panel: `http://127.0.0.1:8000/admin`
- API Documentation: `http://127.0.0.1:8000/docs`

## Admin Login

```text
Email: admin@nestora.com
Password: Admin@123
```

You can change these using environment variables:

```powershell
$env:ADMIN_EMAIL="your-email@example.com"
$env:ADMIN_PASSWORD="YourStrongPassword"
python -m uvicorn main:app --reload
```

## Main API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/properties` | List and filter properties |
| GET | `/api/properties/{id}` | View one property |
| POST | `/api/enquiries` | Contact a property owner |
| GET | `/api/favourites` | List favourite properties |
| POST | `/api/favourites/{id}` | Add favourite |
| DELETE | `/api/favourites/{id}` | Remove favourite |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/stats` | Dashboard counts |
| POST | `/api/admin/properties` | Add property |
| PUT | `/api/admin/properties/{id}` | Edit property |
| DELETE | `/api/admin/properties/{id}` | Delete property |
| GET | `/api/admin/enquiries` | View enquiries |

## Database

The SQLite database is automatically created at:

```text
data/real_estate.db
```

On the first run, eight demonstration properties are inserted automatically.

## Project Structure

```text
real_estate_portal/
├── main.py
├── requirements.txt
├── run.bat
├── run.sh
├── README.md
├── data/
└── static/
    ├── index.html
    ├── property.html
    ├── favorites.html
    ├── admin.html
    ├── css/styles.css
    ├── js/
    └── images/
```

## Notes for Demonstration

1. Open the properties page and apply filters.
2. Save two properties as favourites.
3. Open a property and submit a contact-owner enquiry.
4. Log in to the admin panel.
5. Show the dashboard counts and the submitted enquiry.
6. Add or edit a property and confirm it appears on the website.
