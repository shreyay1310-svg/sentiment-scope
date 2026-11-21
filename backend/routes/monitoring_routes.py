import asyncio
import json
import random
import datetime
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from pydantic import BaseModel
from auth import get_current_user
from database import db
from nlp_engine import analyze_sentiment

router = APIRouter(prefix="/monitoring", tags=["Real-Time Monitoring"])

DEMO_MESSAGES_POOL = [
    "Customer support answered in 30 seconds and solved my billing query seamlessly!",
    "App crashes every time I export larger datasets. Please fix this bug asap.",
    "The UI redesign is stunning, clean colors and very fast rendering.",
    "Delivery took 4 days longer than estimated. Package arrived slightly damaged.",
    "Sentiment Scope is by far the best NLP toolkit we have deployed this quarter.",
    "Prices are quite high compared to competitors, though feature set is decent.",
    "Smooth onboarding process, loved the interactive guide!",
    "Checkout page failed with 500 internal server error during payment authorization.",
    "Very responsive design on iPad and Android tablet, works like a charm.",
    "Neutral about the latest update, haven't noticed any significant changes."
]

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

class InjectMessageRequest(BaseModel):
    text: str
    source: str = "External Stream"

@router.get("/feed")
def get_monitoring_feed(limit: int = 40):
    items = db.get_live_feed(limit=limit)
    if not items:
        # Prepopulate demo feed items
        for msg in DEMO_MESSAGES_POOL[:6]:
            res = analyze_sentiment(msg)
            db.insert_live_feed({
                "text": msg,
                "sentiment": res["sentiment"],
                "confidence": res["confidence"],
                "source": "Simulated Live Feed",
                "created_at": datetime.datetime.now().isoformat()
            })
        items = db.get_live_feed(limit=limit)
    return {"status": "success", "feed": items}

@router.post("/inject")
async def inject_monitoring_message(req: InjectMessageRequest):
    res = analyze_sentiment(req.text)
    record = {
        "text": req.text,
        "sentiment": res["sentiment"],
        "confidence": res["confidence"],
        "source": req.source,
        "created_at": datetime.datetime.now().isoformat()
    }
    saved = db.insert_live_feed(record)
    await manager.broadcast({"type": "NEW_FEED_ITEM", "data": saved})
    return {"status": "success", "item": saved}

@router.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    demo_active = False
    demo_task = None

    async def demo_stream():
        while True:
            await asyncio.sleep(random.uniform(4.0, 7.0))
            text = random.choice(DEMO_MESSAGES_POOL)
            res = analyze_sentiment(text)
            feed_doc = {
                "text": text,
                "sentiment": res["sentiment"],
                "confidence": res["confidence"],
                "source": "Demo Stream (Simulated)",
                "created_at": datetime.datetime.now().isoformat()
            }
            saved = db.insert_live_feed(feed_doc)
            await manager.broadcast({"type": "NEW_FEED_ITEM", "data": saved})

    try:
        # Send initial confirmation
        await websocket.send_text(json.dumps({
            "type": "CONNECTION_ESTABLISHED",
            "message": "Connected to Sentiment Scope Real-Time Monitoring WebSocket"
        }))

        while True:
            data_text = await websocket.receive_text()
            try:
                data = json.loads(data_text)
                action = data.get("action")
                if action == "START_DEMO":
                    if not demo_task or demo_task.done():
                        demo_task = asyncio.create_task(demo_stream())
                        await websocket.send_text(json.dumps({
                            "type": "STATUS_UPDATE",
                            "demo_mode": True,
                            "message": "Demo simulated stream started"
                        }))
                elif action == "STOP_DEMO":
                    if demo_task and not demo_task.done():
                        demo_task.cancel()
                    await websocket.send_text(json.dumps({
                        "type": "STATUS_UPDATE",
                        "demo_mode": False,
                        "message": "Demo stream paused. Waiting for live events."
                    }))
                elif action == "INJECT":
                    t = data.get("text", "")
                    if t:
                        res = analyze_sentiment(t)
                        feed_doc = {
                            "text": t,
                            "sentiment": res["sentiment"],
                            "confidence": res["confidence"],
                            "source": data.get("source", "Live WebSocket Client"),
                            "created_at": datetime.datetime.now().isoformat()
                        }
                        saved = db.insert_live_feed(feed_doc)
                        await manager.broadcast({"type": "NEW_FEED_ITEM", "data": saved})
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        if demo_task and not demo_task.done():
            demo_task.cancel()
    except Exception:
        manager.disconnect(websocket)
        if demo_task and not demo_task.done():
            demo_task.cancel()
