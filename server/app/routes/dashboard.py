from fastapi import APIRouter, Depends, HTTPException
from app.main import get_current_user, security
from app.models.form import FormSubmission
from app.models.pdf import PDFUpload
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/summary", response_model=dict, dependencies=[Depends(security)])
async def dashboard_summary(user=Depends(get_current_user)):
    if user.get("role") not in ["admin", "analyst"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        # Calculate real data from MongoDB
        # Get all form submissions
        all_submissions = await FormSubmission.find_all().to_list()
        
        # Count unique students (by name)
        unique_students = len(set(sub.data.get('studentName', '') for sub in all_submissions if sub.data.get('studentName')))
        
        # Count teachers (assuming field workers are teachers)
        unique_teachers = len(set(sub.submitted_by for sub in all_submissions))
        
        # Calculate attendance rate
        total_attendance_records = len([sub for sub in all_submissions if 'attendance' in sub.data])
        present_records = len([sub for sub in all_submissions if sub.data.get('attendance') == 'present'])
        attendance_rate = (present_records / total_attendance_records * 100) if total_attendance_records > 0 else 0
        
        # Count alerts (students with poor health status)
        alerts = len([sub for sub in all_submissions if sub.data.get('healthStatus') in ['poor', 'needs_attention']])
        
        # Calculate growth (new submissions in last 30 days vs previous 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        sixty_days_ago = datetime.utcnow() - timedelta(days=60)
        
        recent_submissions = len([sub for sub in all_submissions if sub.created_at >= thirty_days_ago])
        previous_submissions = len([sub for sub in all_submissions if thirty_days_ago > sub.created_at >= sixty_days_ago])
        
        growth_rate = ((recent_submissions - previous_submissions) / previous_submissions * 100) if previous_submissions > 0 else 0
        
        return {
            "students": unique_students,
            "teachers": unique_teachers,
            "attendance": round(attendance_rate, 1),
            "alerts": alerts,
            "growth": round(growth_rate, 1)
        }
        
    except Exception as e:
        # Fallback to dummy data if there's an error
        return {
            "students": 0,
            "teachers": 0,
            "attendance": 0,
            "alerts": 0,
            "growth": 0
        } 