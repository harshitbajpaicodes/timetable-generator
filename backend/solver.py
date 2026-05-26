from typing import List, Dict, Optional


def solve(courses: List[Dict], constraints: Dict) -> List[Dict]:
    avoid_before = constraints.get("avoid_before", "00:00")
    avoid_back_to_back = constraints.get("avoid_back_to_back", False)

    def time_to_minutes(t: str) -> int:
        h, m = map(int, t.split(":"))
        return h * 60 + m

    avoid_before_mins = time_to_minutes(avoid_before)

    def slots_for_course(course):
        valid = []
        for slot in course["slots"]:
            if time_to_minutes(slot["start_time"]) >= avoid_before_mins:
                valid.append(slot)
        return valid

    def conflicts(slot_a, slot_b):
        if slot_a["day"] != slot_b["day"]:
            return False
        a_start = time_to_minutes(slot_a["start_time"])
        a_end = time_to_minutes(slot_a["end_time"])
        b_start = time_to_minutes(slot_b["start_time"])
        b_end = time_to_minutes(slot_b["end_time"])
        return not (a_end <= b_start or b_end <= a_start)

    def is_back_to_back(slot_a, slot_b):
        if slot_a["day"] != slot_b["day"]:
            return False
        a_end = time_to_minutes(slot_a["end_time"])
        b_start = time_to_minutes(slot_b["start_time"])
        b_end = time_to_minutes(slot_b["end_time"])
        a_start = time_to_minutes(slot_a["start_time"])
        return a_end == b_start or b_end == a_start

    results = []

    def backtrack(idx, assignment):
        if len(results) >= 5:
            return
        if idx == len(courses):
            results.append({c["name"]: dict(assignment[c["name"]]) for c in courses})
            return

        course = courses[idx]
        valid_slots = slots_for_course(course)

        for slot in valid_slots:
            ok = True
            for assigned_name, assigned_slot in assignment.items():
                if conflicts(slot, assigned_slot):
                    ok = False
                    break
                if avoid_back_to_back and is_back_to_back(slot, assigned_slot):
                    ok = False
                    break
            if ok:
                assignment[course["name"]] = slot
                backtrack(idx + 1, assignment)
                del assignment[course["name"]]
                if len(results) >= 5:
                    return

    backtrack(0, {})
    return results
