import os
import json
import sqlite3
import random
import string
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from solver import solve

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    conn = sqlite3.connect("timetables.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS timetables (
            share_code TEXT PRIMARY KEY,
            data TEXT,
            created_at TEXT
        )
    """)
    conn.commit()
    conn.close()


init_db()


def generate_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


class Slot(BaseModel):
    day: str
    start_time: str
    end_time: str


class Course(BaseModel):
    name: str
    slots: List[Slot]


class Constraints(BaseModel):
    avoid_before: str = "00:00"
    avoid_back_to_back: bool = False


class GenerateRequest(BaseModel):
    courses: List[Course]
    constraints: Constraints


class SaveRequest(BaseModel):
    timetable: dict


class OverlapRequest(BaseModel):
    code_a: str
    code_b: str


@app.post("/generate")
def generate(req: GenerateRequest):
    courses_data = [{"name": c.name, "slots": [s.dict() for s in c.slots]} for c in req.courses]
    constraints_data = req.constraints.dict()
    results = solve(courses_data, constraints_data)
    return {"timetables": results}


@app.post("/save")
def save(req: SaveRequest):
    code = generate_code()
    conn = get_db()
    from datetime import datetime
    conn.execute(
        "INSERT INTO timetables VALUES (?, ?, ?)",
        (code, json.dumps(req.timetable), datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return {"share_code": code}


@app.get("/timetable/{share_code}")
def get_timetable(share_code: str):
    conn = get_db()
    row = conn.execute("SELECT data FROM timetables WHERE share_code = ?", (share_code,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Timetable not found")
    return {"timetable": json.loads(row["data"]), "share_code": share_code}


@app.post("/overlap")
def overlap(req: OverlapRequest):
    conn = get_db()
    row_a = conn.execute("SELECT data FROM timetables WHERE share_code = ?", (req.code_a,)).fetchone()
    row_b = conn.execute("SELECT data FROM timetables WHERE share_code = ?", (req.code_b,)).fetchone()
    conn.close()

    if not row_a or not row_b:
        raise HTTPException(status_code=404, detail="One or both timetables not found")

    tt_a = json.loads(row_a["data"])
    tt_b = json.loads(row_b["data"])

    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    all_slots = []
    for slot in tt_a.values():
        all_slots.append(slot)
    for slot in tt_b.values():
        all_slots.append(slot)

    busy_by_day = {d: [] for d in days}
    for slot in all_slots:
        busy_by_day[slot["day"]].append(slot)

    free_slots = []
    hours = [(f"{h:02d}:00", f"{h+1:02d}:00") for h in range(8, 20)]

    def time_to_min(t):
        h, m = map(int, t.split(":"))
        return h * 60 + m

    def is_busy(day, start, end):
        for slot in busy_by_day.get(day, []):
            s = time_to_min(slot["start_time"])
            e = time_to_min(slot["end_time"])
            qs = time_to_min(start)
            qe = time_to_min(end)
            if not (qe <= s or qs >= e):
                return True
        return False

    for day in days:
        for start, end in hours:
            if not is_busy(day, start, end):
                free_slots.append({"day": day, "start_time": start, "end_time": end})

    return {"free_slots": free_slots}
