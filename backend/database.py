import json
import sqlite3
import datetime
import uuid
import logging
from typing import Dict, Any, List, Optional
from config import settings

logger = logging.getLogger("sentiment_scope.database")

# Check if MongoDB is reachable
_use_mongo = False
_mongo_client = None
_mongo_db = None

if settings.MONGODB_URI:
    try:
        from pymongo import MongoClient
        _mongo_client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
        _mongo_client.server_info() # test connection
        _mongo_db = _mongo_client[settings.DATABASE_NAME]
        # Create Production Indexes
        _mongo_db.users.create_index("email", unique=True)
        _mongo_db.analyses.create_index([("user_id", 1), ("created_at", -1)])
        _mongo_db.analyses.create_index("sentiment")
        _mongo_db.datasets.create_index([("user_id", 1), ("created_at", -1)])
        _mongo_db.live_feed.create_index([("created_at", -1)])
        _use_mongo = True
        logger.info("Successfully connected to MongoDB: %s with indexes configured", settings.DATABASE_NAME)
    except Exception as e:
        logger.warning("MongoDB URI provided but connection failed (%s). Falling back to persistent SQLite/JSON store.", e)
        _use_mongo = False

# SQLite persistent document store fallback
SQLITE_DB_PATH = settings.STORAGE_DIR / "sentiment_scope.db"

def init_sqlite():
    conn = sqlite3.connect(SQLITE_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'User',
        avatar TEXT,
        is_verified INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        input_type TEXT NOT NULL, -- 'text' or 'file'
        source_name TEXT NOT NULL, -- 'Manual Input', 'product_review.txt', etc.
        text TEXT NOT NULL,
        sentiment TEXT NOT NULL, -- 'Positive', 'Negative', 'Neutral'
        confidence REAL NOT NULL,
        score REAL NOT NULL,
        emotions TEXT NOT NULL, -- JSON
        keywords TEXT NOT NULL, -- JSON
        explanation TEXT NOT NULL,
        classification_details TEXT NOT NULL, -- JSON
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        row_count INTEGER NOT NULL,
        positive_count INTEGER NOT NULL,
        negative_count INTEGER NOT NULL,
        neutral_count INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        analyzed_file_path TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS live_feed (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        text TEXT NOT NULL,
        sentiment TEXT NOT NULL,
        confidence REAL NOT NULL,
        source TEXT NOT NULL, -- 'WebSocket', 'Twitter/X Feed', 'Customer Stream', etc.
        created_at TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()

init_sqlite()

class DatabaseAdapter:
    def __init__(self):
        self.use_mongo = _use_mongo
        self.mongo_db = _mongo_db

    # --- USER METHODS ---
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        if self.use_mongo:
            user = self.mongo_db.users.find_one({"email": email.lower()})
            if user:
                user["id"] = str(user.get("_id", user.get("id")))
            return user
        
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.use_mongo:
            user = self.mongo_db.users.find_one({"id": user_id})
            return user
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in user_data:
            user_data["id"] = f"usr_{uuid.uuid4().hex[:12]}"
        user_data["created_at"] = user_data.get("created_at") or datetime.datetime.now().isoformat()
        user_data["email"] = user_data["email"].lower()
        
        if self.use_mongo:
            self.mongo_db.users.insert_one(user_data.copy())
            return user_data

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO users (id, email, name, password_hash, role, avatar, is_verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_data["id"],
            user_data["email"],
            user_data["name"],
            user_data["password_hash"],
            user_data.get("role", "User"),
            user_data.get("avatar", ""),
            1 if user_data.get("is_verified", True) else 0,
            user_data["created_at"]
        ))
        conn.commit()
        conn.close()
        return user_data

    def update_user_password(self, user_id: str, new_hash: str):
        if self.use_mongo:
            self.mongo_db.users.update_one({"id": user_id}, {"$set": {"password_hash": new_hash}})
            return
        conn = sqlite3.connect(SQLITE_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
        conn.commit()
        conn.close()

    def update_user_profile(self, user_id: str, updates: Dict[str, Any]):
        if self.use_mongo:
            self.mongo_db.users.update_one({"id": user_id}, {"$set": updates})
            return
        conn = sqlite3.connect(SQLITE_DB_PATH)
        cursor = conn.cursor()
        set_clauses = []
        vals = []
        for k, v in updates.items():
            set_clauses.append(f"{k} = ?")
            vals.append(v)
        vals.append(user_id)
        cursor.execute(f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ?", vals)
        conn.commit()
        conn.close()

    # --- ANALYSES METHODS ---
    def insert_analysis(self, record: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in record:
            record["id"] = f"ANL-{uuid.uuid4().hex[:8].upper()}"
        if "created_at" not in record:
            record["created_at"] = datetime.datetime.now().isoformat()
        
        if self.use_mongo:
            doc = record.copy()
            self.mongo_db.analyses.insert_one(doc)
            return record

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO analyses (id, user_id, input_type, source_name, text, sentiment, confidence, score, emotions, keywords, explanation, classification_details, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            record["id"],
            record["user_id"],
            record.get("input_type", "text"),
            record.get("source_name", "Manual Input"),
            record["text"],
            record["sentiment"],
            float(record.get("confidence", 0.0)),
            float(record.get("score", 0.0)),
            json.dumps(record.get("emotions", {})),
            json.dumps(record.get("keywords", [])),
            record.get("explanation", ""),
            json.dumps(record.get("classification_details", {})),
            record["created_at"]
        ))
        conn.commit()
        conn.close()
        return record

    def get_analyses(self, user_id: str, is_admin: bool = False, search: str = "", sentiment: str = "", limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        if self.use_mongo:
            query = {} if is_admin else {"user_id": user_id}
            if search:
                query["$or"] = [
                    {"text": {"$regex": search, "$options": "i"}},
                    {"source_name": {"$regex": search, "$options": "i"}},
                    {"id": {"$regex": search, "$options": "i"}}
                ]
            if sentiment and sentiment.lower() != "all":
                query["sentiment"] = sentiment.capitalize()
            
            total = self.mongo_db.analyses.count_documents(query)
            cursor = self.mongo_db.analyses.find(query).sort("created_at", -1).skip(offset).limit(limit)
            items = []
            for item in cursor:
                item["_id"] = str(item.get("_id", ""))
                items.append(item)
            return {"items": items, "total": total}

        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        where = []
        params = []
        if not is_admin:
            where.append("user_id = ?")
            params.append(user_id)
        if search:
            where.append("(text LIKE ? OR source_name LIKE ? OR id LIKE ?)")
            s = f"%{search}%"
            params.extend([s, s, s])
        if sentiment and sentiment.lower() != "all":
            where.append("LOWER(sentiment) = LOWER(?)")
            params.append(sentiment)
            
        where_clause = f"WHERE {' AND '.join(where)}" if where else ""
        
        count_query = f"SELECT COUNT(*) FROM analyses {where_clause}"
        cursor.execute(count_query, params)
        total = cursor.fetchone()[0]

        data_query = f"SELECT * FROM analyses {where_clause} ORDER BY created_at DESC LIMIT ? OFFSET ?"
        data_params = params + [limit, offset]
        cursor.execute(data_query, data_params)
        rows = cursor.fetchall()
        conn.close()

        items = []
        for r in rows:
            d = dict(r)
            try:
                d["emotions"] = json.loads(d["emotions"]) if isinstance(d["emotions"], str) else d["emotions"]
            except Exception:
                d["emotions"] = {}
            try:
                d["keywords"] = json.loads(d["keywords"]) if isinstance(d["keywords"], str) else d["keywords"]
            except Exception:
                d["keywords"] = []
            try:
                d["classification_details"] = json.loads(d["classification_details"]) if isinstance(d["classification_details"], str) else d["classification_details"]
            except Exception:
                d["classification_details"] = {}
            items.append(d)

        return {"items": items, "total": total}

    def get_analysis_by_id(self, analysis_id: str, user_id: str, is_admin: bool = False) -> Optional[Dict[str, Any]]:
        if self.use_mongo:
            query = {"id": analysis_id} if is_admin else {"id": analysis_id, "user_id": user_id}
            item = self.mongo_db.analyses.find_one(query)
            if item:
                item["_id"] = str(item.get("_id", ""))
            return item
        
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        if is_admin:
            cursor.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
        else:
            cursor.execute("SELECT * FROM analyses WHERE id = ? AND user_id = ?", (analysis_id, user_id))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        for k in ["emotions", "keywords", "classification_details"]:
            try:
                d[k] = json.loads(d[k]) if isinstance(d[k], str) else d[k]
            except Exception:
                pass
        return d

    def delete_analysis(self, analysis_id: str, user_id: str, is_admin: bool = False) -> bool:
        if self.use_mongo:
            query = {"id": analysis_id} if is_admin else {"id": analysis_id, "user_id": user_id}
            res = self.mongo_db.analyses.delete_one(query)
            return res.deleted_count > 0

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cursor = conn.cursor()
        if is_admin:
            cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
        else:
            cursor.execute("DELETE FROM analyses WHERE id = ? AND user_id = ?", (analysis_id, user_id))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted

    # --- DATASET METHODS ---
    def insert_dataset(self, dataset: Dict[str, Any]):
        if "id" not in dataset:
            dataset["id"] = f"DS-{uuid.uuid4().hex[:8].upper()}"
        if "created_at" not in dataset:
            dataset["created_at"] = datetime.datetime.now().isoformat()
        
        if self.use_mongo:
            self.mongo_db.datasets.insert_one(dataset.copy())
            return dataset

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO datasets (id, user_id, file_name, file_type, row_count, positive_count, negative_count, neutral_count, file_path, analyzed_file_path, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dataset["id"],
            dataset["user_id"],
            dataset["file_name"],
            dataset["file_type"],
            int(dataset.get("row_count", 0)),
            int(dataset.get("positive_count", 0)),
            int(dataset.get("negative_count", 0)),
            int(dataset.get("neutral_count", 0)),
            dataset.get("file_path", ""),
            dataset.get("analyzed_file_path", ""),
            dataset["created_at"]
        ))
        conn.commit()
        conn.close()
        return dataset

    def get_datasets(self, user_id: str, is_admin: bool = False) -> List[Dict[str, Any]]:
        if self.use_mongo:
            query = {} if is_admin else {"user_id": user_id}
            cursor = self.mongo_db.datasets.find(query).sort("created_at", -1)
            items = []
            for item in cursor:
                item["_id"] = str(item.get("_id", ""))
                items.append(item)
            return items

        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        if is_admin:
            cursor.execute("SELECT * FROM datasets ORDER BY created_at DESC")
        else:
            cursor.execute("SELECT * FROM datasets WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    # --- LIVE FEED METHODS ---
    def insert_live_feed(self, item: Dict[str, Any]):
        if "id" not in item:
            item["id"] = f"FEED-{uuid.uuid4().hex[:8]}"
        if "created_at" not in item:
            item["created_at"] = datetime.datetime.now().isoformat()
        
        if self.use_mongo:
            self.mongo_db.live_feed.insert_one(item.copy())
            return item

        conn = sqlite3.connect(SQLITE_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO live_feed (id, user_id, text, sentiment, confidence, source, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            item["id"],
            item.get("user_id", ""),
            item["text"],
            item["sentiment"],
            float(item.get("confidence", 0.0)),
            item.get("source", "Live Stream"),
            item["created_at"]
        ))
        conn.commit()
        conn.close()
        return item

    def get_live_feed(self, limit: int = 50) -> List[Dict[str, Any]]:
        if self.use_mongo:
            cursor = self.mongo_db.live_feed.find().sort("created_at", -1).limit(limit)
            items = []
            for item in cursor:
                item["_id"] = str(item.get("_id", ""))
                items.append(item)
            return items

        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM live_feed ORDER BY created_at DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

db = DatabaseAdapter()
