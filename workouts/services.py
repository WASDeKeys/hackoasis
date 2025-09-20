import datetime
from .models import WorkoutPlan, WorkoutSession

def generate_workout_plan(user, weeks=4):
    plan = WorkoutPlan.objects.create(user=user, start_date=datetime.date.today(), weeks=weeks, rationale="Initial plan generated")
    days = sorted(user.availability.keys())
    session_dates = []
    current_date = plan.start_date
    for week in range(weeks):
        for day in days:
            session_dates.append(current_date)
            current_date += datetime.timedelta(days=2)
    for date in session_dates:
        WorkoutSession.objects.create(
            user=user,
            plan=plan,
            date=date,
            exercises=[{"name": "Squat", "sets": 3, "reps": 10}],
            status='planned'
        )
    return plan
