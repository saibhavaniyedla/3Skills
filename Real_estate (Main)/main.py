from __future__ import annotations

import os
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DB_PATH = BASE_DIR / "data" / "real_estate.db"

app = FastAPI(
    title="Nestora Real Estate Portal API",
    description="Property listings, filters, favourites, owner enquiries, and admin management.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@nestora.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@123")
ACTIVE_ADMIN_TOKENS: set[str] = set()


@contextmanager
def get_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def row_to_dict(row: sqlite3.Row) -> dict:
    return {key: row[key] for key in row.keys()}


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_db() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS properties (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                property_type TEXT NOT NULL,
                purpose TEXT NOT NULL,
                city TEXT NOT NULL,
                locality TEXT NOT NULL,
                address TEXT NOT NULL,
                price INTEGER NOT NULL,
                bedrooms INTEGER NOT NULL DEFAULT 0,
                bathrooms INTEGER NOT NULL DEFAULT 0,
                area_sqft INTEGER NOT NULL,
                furnishing TEXT NOT NULL,
                parking INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'Available',
                owner_name TEXT NOT NULL,
                owner_email TEXT NOT NULL,
                owner_phone TEXT NOT NULL,
                image_url TEXT NOT NULL,
                featured INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS favourites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                property_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                UNIQUE(session_id, property_id),
                FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS enquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                property_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                message TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'New',
                created_at TEXT NOT NULL,
                FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE
            );
            """
        )

        count = db.execute("SELECT COUNT(*) AS total FROM properties").fetchone()["total"]
        if count == 0:
            seed_properties(db)


def seed_properties(db: sqlite3.Connection) -> None:
    samples = [
        (
            "Skyline Luxury Apartment",
            "A bright, premium apartment with city views, a modular kitchen, clubhouse access, and excellent connectivity.",
            "Apartment",
            "Sale",
            "Hyderabad",
            "Gachibowli",
            "Financial District Road, Gachibowli, Hyderabad",
            12500000,
            3,
            3,
            1850,
            "Fully Furnished",
            2,
            "Available",
            "Rahul Mehta",
            "rahul.owner@example.com",
            "+91 98765 43210",
            "/static/images/property1.svg",
            1,
        ),
        (
            "Green Meadows Villa",
            "Spacious gated-community villa with a private garden, family lounge, servant room, and 24/7 security.",
            "Villa",
            "Sale",
            "Hyderabad",
            "Kokapet",
            "Golden Mile Extension, Kokapet, Hyderabad",
            28500000,
            4,
            4,
            3400,
            "Semi Furnished",
            3,
            "Available",
            "Sanjay Reddy",
            "sanjay.owner@example.com",
            "+91 98490 11223",
            "/static/images/property2.svg",
            1,
        ),
        (
            "Metro View Studio",
            "Compact studio apartment ideal for students and professionals, located close to metro and IT offices.",
            "Studio",
            "Rent",
            "Hyderabad",
            "Hitech City",
            "Madhapur Main Road, Hitech City, Hyderabad",
            24000,
            1,
            1,
            620,
            "Fully Furnished",
            1,
            "Available",
            "Anita Sharma",
            "anita.owner@example.com",
            "+91 99887 66554",
            "/static/images/property3.svg",
            0,
        ),
        (
            "Lakefront Family Home",
            "Peaceful independent home with lake-facing balcony, large bedrooms, terrace, and nearby schools.",
            "Independent House",
            "Sale",
            "Hyderabad",
            "Narsingi",
            "Lake View Colony, Narsingi, Hyderabad",
            16500000,
            3,
            3,
            2400,
            "Unfurnished",
            2,
            "Available",
            "Madhavi Rao",
            "madhavi.owner@example.com",
            "+91 97000 24680",
            "/static/images/property4.svg",
            0,
        ),
        (
            "Urban Nest 2BHK",
            "Well-maintained 2BHK in a secure community with gym, swimming pool, power backup, and supermarket.",
            "Apartment",
            "Rent",
            "Hyderabad",
            "Kondapur",
            "Botanical Garden Road, Kondapur, Hyderabad",
            36000,
            2,
            2,
            1280,
            "Semi Furnished",
            1,
            "Available",
            "Kiran Kumar",
            "kiran.owner@example.com",
            "+91 96180 13579",
            "/static/images/property5.svg",
            1,
        ),
        (
            "Commercial Office Hub",
            "Modern office floor with reception, meeting rooms, workstations, parking, and high-speed lift access.",
            "Commercial",
            "Rent",
            "Hyderabad",
            "Madhapur",
            "Ayyappa Society, Madhapur, Hyderabad",
            145000,
            0,
            2,
            2800,
            "Fully Furnished",
            4,
            "Available",
            "Vikram Jain",
            "vikram.owner@example.com",
            "+91 90001 23456",
            "/static/images/property6.svg",
            0,
        ),
        (
            "Serene County Plot",
            "East-facing residential plot in an HMDA-approved layout with clear title and nearby highway access.",
            "Plot",
            "Sale",
            "Hyderabad",
            "Shankarpally",
            "Serene County Layout, Shankarpally, Hyderabad",
            7200000,
            0,
            0,
            2400,
            "Not Applicable",
            0,
            "Available",
            "Deepak Varma",
            "deepak.owner@example.com",
            "+91 95555 77889",
            "/static/images/property7.svg",
            0,
        ),
        (
            "Premium Co-Living Suite",
            "Managed co-living room with housekeeping, Wi-Fi, meals, laundry, and community spaces included.",
            "Co-living",
            "Rent",
            "Hyderabad",
            "Manikonda",
            "Lanco Hills Road, Manikonda, Hyderabad",
            18000,
            1,
            1,
            450,
            "Fully Furnished",
            0,
            "Available",
            "Priya Nair",
            "priya.owner@example.com",
            "+91 91234 56780",
            "/static/images/property8.svg",
            0,
        ),
    ]

    db.executemany(
        """
        INSERT INTO properties (
            title, description, property_type, purpose, city, locality, address,
            price, bedrooms, bathrooms, area_sqft, furnishing, parking, status,
            owner_name, owner_email, owner_phone, image_url, featured, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [(*item, now_iso()) for item in samples],
    )


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class PropertyPayload(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=1200)
    property_type: str
    purpose: str
    city: str
    locality: str
    address: str
    price: int = Field(gt=0)
    bedrooms: int = Field(ge=0, le=20)
    bathrooms: int = Field(ge=0, le=20)
    area_sqft: int = Field(gt=0)
    furnishing: str
    parking: int = Field(ge=0, le=20)
    status: str = "Available"
    owner_name: str
    owner_email: EmailStr
    owner_phone: str
    image_url: str = "/static/images/property1.svg"
    featured: bool = False


class EnquiryPayload(BaseModel):
    property_id: int
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=20)
    message: str = Field(min_length=5, max_length=1000)


class EnquiryStatusPayload(BaseModel):
    status: str


def require_admin(authorization: Optional[str] = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Admin login required")
    token = authorization.removeprefix("Bearer ").strip()
    if token not in ACTIVE_ADMIN_TOKENS:
        raise HTTPException(status_code=401, detail="Invalid or expired admin session")
    return token


@app.on_event("startup")
def startup_event() -> None:
    init_db()


@app.get("/", include_in_schema=False)
def home_page():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/property", include_in_schema=False)
def property_page():
    return FileResponse(STATIC_DIR / "property.html")


@app.get("/favorites", include_in_schema=False)
def favorites_page():
    return FileResponse(STATIC_DIR / "favorites.html")


@app.get("/admin", include_in_schema=False)
def admin_page():
    return FileResponse(STATIC_DIR / "admin.html")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Nestora Real Estate Portal"}


@app.get("/api/properties")
def list_properties(
    search: Optional[str] = None,
    city: Optional[str] = None,
    locality: Optional[str] = None,
    property_type: Optional[str] = Query(default=None, alias="type"),
    purpose: Optional[str] = None,
    min_price: Optional[int] = Query(default=None, ge=0),
    max_price: Optional[int] = Query(default=None, ge=0),
    min_bedrooms: Optional[int] = Query(default=None, ge=0),
    furnishing: Optional[str] = None,
    featured: Optional[bool] = None,
    sort: str = "newest",
):
    clauses = ["1=1"]
    params: list[object] = []

    if search:
        clauses.append("(title LIKE ? OR locality LIKE ? OR city LIKE ? OR description LIKE ?)")
        term = f"%{search}%"
        params.extend([term, term, term, term])
    if city:
        clauses.append("city = ?")
        params.append(city)
    if locality:
        clauses.append("locality LIKE ?")
        params.append(f"%{locality}%")
    if property_type:
        clauses.append("property_type = ?")
        params.append(property_type)
    if purpose:
        clauses.append("purpose = ?")
        params.append(purpose)
    if min_price is not None:
        clauses.append("price >= ?")
        params.append(min_price)
    if max_price is not None:
        clauses.append("price <= ?")
        params.append(max_price)
    if min_bedrooms is not None:
        clauses.append("bedrooms >= ?")
        params.append(min_bedrooms)
    if furnishing:
        clauses.append("furnishing = ?")
        params.append(furnishing)
    if featured is not None:
        clauses.append("featured = ?")
        params.append(1 if featured else 0)

    ordering = {
        "newest": "id DESC",
        "price_asc": "price ASC",
        "price_desc": "price DESC",
        "area_desc": "area_sqft DESC",
    }.get(sort, "id DESC")

    query = f"SELECT * FROM properties WHERE {' AND '.join(clauses)} ORDER BY {ordering}"
    with get_db() as db:
        rows = db.execute(query, params).fetchall()
        return [row_to_dict(row) for row in rows]


@app.get("/api/properties/{property_id}")
def get_property(property_id: int):
    with get_db() as db:
        row = db.execute("SELECT * FROM properties WHERE id = ?", (property_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Property not found")
        return row_to_dict(row)


@app.post("/api/enquiries", status_code=201)
def create_enquiry(payload: EnquiryPayload):
    with get_db() as db:
        property_row = db.execute("SELECT id FROM properties WHERE id = ?", (payload.property_id,)).fetchone()
        if not property_row:
            raise HTTPException(status_code=404, detail="Property not found")
        cursor = db.execute(
            """
            INSERT INTO enquiries (property_id, name, email, phone, message, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'New', ?)
            """,
            (payload.property_id, payload.name, str(payload.email), payload.phone, payload.message, now_iso()),
        )
        return {"id": cursor.lastrowid, "message": "Your enquiry was sent to the property owner."}


@app.get("/api/favourites")
def get_favourites(session_id: str = Query(min_length=5, max_length=100)):
    with get_db() as db:
        rows = db.execute(
            """
            SELECT p.* FROM properties p
            INNER JOIN favourites f ON f.property_id = p.id
            WHERE f.session_id = ?
            ORDER BY f.id DESC
            """,
            (session_id,),
        ).fetchall()
        return [row_to_dict(row) for row in rows]


@app.post("/api/favourites/{property_id}", status_code=201)
def add_favourite(property_id: int, session_id: str = Query(min_length=5, max_length=100)):
    with get_db() as db:
        property_row = db.execute("SELECT id FROM properties WHERE id = ?", (property_id,)).fetchone()
        if not property_row:
            raise HTTPException(status_code=404, detail="Property not found")
        db.execute(
            "INSERT OR IGNORE INTO favourites (session_id, property_id, created_at) VALUES (?, ?, ?)",
            (session_id, property_id, now_iso()),
        )
        return {"message": "Property added to favourites"}


@app.delete("/api/favourites/{property_id}")
def remove_favourite(property_id: int, session_id: str = Query(min_length=5, max_length=100)):
    with get_db() as db:
        db.execute("DELETE FROM favourites WHERE session_id = ? AND property_id = ?", (session_id, property_id))
        return {"message": "Property removed from favourites"}


@app.post("/api/admin/login")
def admin_login(payload: AdminLogin):
    if str(payload.email).lower() != ADMIN_EMAIL.lower() or payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Incorrect admin email or password")
    token = secrets.token_urlsafe(32)
    ACTIVE_ADMIN_TOKENS.add(token)
    return {"token": token, "email": ADMIN_EMAIL}


@app.post("/api/admin/logout")
def admin_logout(token: str = Depends(require_admin)):
    ACTIVE_ADMIN_TOKENS.discard(token)
    return {"message": "Logged out"}


@app.get("/api/admin/stats")
def admin_stats(_: str = Depends(require_admin)):
    with get_db() as db:
        return {
            "properties": db.execute("SELECT COUNT(*) AS c FROM properties").fetchone()["c"],
            "available": db.execute("SELECT COUNT(*) AS c FROM properties WHERE status = 'Available'").fetchone()["c"],
            "favourites": db.execute("SELECT COUNT(*) AS c FROM favourites").fetchone()["c"],
            "new_enquiries": db.execute("SELECT COUNT(*) AS c FROM enquiries WHERE status = 'New'").fetchone()["c"],
        }


@app.get("/api/admin/properties")
def admin_properties(_: str = Depends(require_admin)):
    with get_db() as db:
        rows = db.execute("SELECT * FROM properties ORDER BY id DESC").fetchall()
        return [row_to_dict(row) for row in rows]


@app.post("/api/admin/properties", status_code=201)
def create_property(payload: PropertyPayload, _: str = Depends(require_admin)):
    data = payload.model_dump()
    data["owner_email"] = str(data["owner_email"])
    data["featured"] = 1 if data["featured"] else 0
    columns = ", ".join(data.keys()) + ", created_at"
    placeholders = ", ".join(["?"] * (len(data) + 1))
    with get_db() as db:
        cursor = db.execute(
            f"INSERT INTO properties ({columns}) VALUES ({placeholders})",
            (*data.values(), now_iso()),
        )
        return {"id": cursor.lastrowid, "message": "Property created successfully"}


@app.put("/api/admin/properties/{property_id}")
def update_property(property_id: int, payload: PropertyPayload, _: str = Depends(require_admin)):
    data = payload.model_dump()
    data["owner_email"] = str(data["owner_email"])
    data["featured"] = 1 if data["featured"] else 0
    assignments = ", ".join([f"{key} = ?" for key in data])
    with get_db() as db:
        exists = db.execute("SELECT id FROM properties WHERE id = ?", (property_id,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail="Property not found")
        db.execute(f"UPDATE properties SET {assignments} WHERE id = ?", (*data.values(), property_id))
        return {"message": "Property updated successfully"}


@app.delete("/api/admin/properties/{property_id}")
def delete_property(property_id: int, _: str = Depends(require_admin)):
    with get_db() as db:
        exists = db.execute("SELECT id FROM properties WHERE id = ?", (property_id,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail="Property not found")
        db.execute("DELETE FROM properties WHERE id = ?", (property_id,))
        return {"message": "Property deleted successfully"}


@app.get("/api/admin/enquiries")
def admin_enquiries(_: str = Depends(require_admin)):
    with get_db() as db:
        rows = db.execute(
            """
            SELECT e.*, p.title AS property_title, p.owner_name, p.owner_phone
            FROM enquiries e
            INNER JOIN properties p ON p.id = e.property_id
            ORDER BY e.id DESC
            """
        ).fetchall()
        return [row_to_dict(row) for row in rows]


@app.patch("/api/admin/enquiries/{enquiry_id}")
def update_enquiry_status(enquiry_id: int, payload: EnquiryStatusPayload, _: str = Depends(require_admin)):
    allowed = {"New", "Contacted", "Closed"}
    if payload.status not in allowed:
        raise HTTPException(status_code=400, detail="Status must be New, Contacted, or Closed")
    with get_db() as db:
        exists = db.execute("SELECT id FROM enquiries WHERE id = ?", (enquiry_id,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail="Enquiry not found")
        db.execute("UPDATE enquiries SET status = ? WHERE id = ?", (payload.status, enquiry_id))
        return {"message": "Enquiry status updated"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
