"""Convert the Nepal gift JSON dataset into a SQLite database.

Run from the project root:
    python scripts/json_to_sqlite.py
"""

import json
import sqlite3
import sys
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
JSON_FILE = BASE_DIR / "data" / "database.json"
DATABASE_FILE = BASE_DIR / "database" / "gifts.db"

TABLE_SCHEMA = """
CREATE TABLE IF NOT EXISTS gifts (
    id INTEGER PRIMARY KEY,
    item_name TEXT NOT NULL,
    category TEXT,
    recipient TEXT,
    price_npr INTEGER,
    occasion TEXT,
    description TEXT,
    availability TEXT,
    tags TEXT,
    image_url TEXT,
    daraz_search_link TEXT
);
"""

INSERT_GIFT_SQL = """
INSERT OR REPLACE INTO gifts (
    id,
    item_name,
    category,
    recipient,
    price_npr,
    occasion,
    description,
    availability,
    tags,
    image_url,
    daraz_search_link
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
"""


def normalize_text(value):
    """Turn strings, numbers, or lists into clean text for SQLite."""
    if value is None:
        return None
    if isinstance(value, list):
        return ", ".join(str(item).strip() for item in value if item is not None)
    return str(value).strip()


def normalize_price(value):
    """Convert a price value to an integer when possible."""
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError) as error:
        raise ValueError(f"Invalid price value: {value}") from error


def get_field(record, display_key, clean_key, required=False):
    """Read either the uploaded JSON keys or already-clean project keys."""
    value = record.get(display_key, record.get(clean_key))

    if required and (value is None or value == ""):
        record_id = record.get("id", "unknown")
        raise KeyError(f"Missing required field '{display_key}' for record id {record_id}")

    return value


def load_gift_records():
    """Load gift records from data/database.json."""
    if not JSON_FILE.exists():
        raise FileNotFoundError(f"Missing JSON file: {JSON_FILE}")

    try:
        with JSON_FILE.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except json.JSONDecodeError as error:
        raise ValueError(f"Invalid JSON format in {JSON_FILE}: {error}") from error

    records = data.get("nepal_gift_database", data.get("gifts"))
    if not isinstance(records, list):
        raise KeyError("JSON must contain a list under 'nepal_gift_database'")

    return records


def convert_record(record):
    """Convert one JSON gift record into the gifts table column order."""
    gift_id = get_field(record, "id", "id", required=True)
    item_name = get_field(record, "Item Name", "item_name", required=True)

    return (
        int(gift_id),
        normalize_text(item_name),
        normalize_text(get_field(record, "Category", "category")),
        normalize_text(get_field(record, "Recipient", "recipient")),
        normalize_price(get_field(record, "Price (NPR)", "price_npr")),
        normalize_text(get_field(record, "Occasion", "occasion")),
        normalize_text(get_field(record, "Description", "description")),
        normalize_text(get_field(record, "Availability", "availability")),
        normalize_text(get_field(record, "Tags", "tags")),
        normalize_text(get_field(record, "image_url", "image_url")),
        normalize_text(get_field(record, "daraz_search_link", "daraz_search_link")),
    )


def create_database(records):
    """Create database/gifts.db and insert all gift records."""
    DATABASE_FILE.parent.mkdir(parents=True, exist_ok=True)

    try:
        with sqlite3.connect(DATABASE_FILE) as connection:
            cursor = connection.cursor()
            cursor.execute(TABLE_SCHEMA)
            cursor.executemany(INSERT_GIFT_SQL, [convert_record(record) for record in records])
            connection.commit()
    except sqlite3.Error as error:
        raise RuntimeError(f"Database creation failure: {error}") from error


def main():
    """Run the JSON to SQLite conversion."""
    try:
        records = load_gift_records()
        create_database(records)
    except (FileNotFoundError, ValueError, KeyError, RuntimeError) as error:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(1)

    print("SQLite database created successfully at database/gifts.db")


if __name__ == "__main__":
    main()
