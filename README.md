# Smart Timetable Generator

Build conflict-free timetables using constraint satisfaction, then share with friends to find common free slots.

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## How it works

1. Add your courses and their available time slots
2. Set constraints (no classes before 9am, no back-to-back slots)
3. Generate up to 5 valid conflict-free timetables
4. Save one and get a share code
5. Enter your friend's share code to see overlapping free slots
