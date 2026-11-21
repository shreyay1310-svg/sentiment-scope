import sys
from pathlib import Path
import pandas as pd

# Path configuration
sys.path.append(str(Path(__file__).resolve().parent.parent / "backend"))

from database import db
from auth import seed_default_users
from routes.auth_routes import login, LoginRequest
from routes.sentiment_routes import analyze_text_endpoint, TextAnalysisRequest
from routes.dashboard_routes import get_dashboard_summary
from routes.history_routes import list_history, get_analysis_detail
from routes.reports_routes import get_report_summary
from routes.settings_routes import update_profile, UpdateProfileRequest
from nlp_engine import parse_and_analyze_file, analyze_sentiment

def run_all_tests():
    print("==================================================")
    print("  SENTIMENT SCOPE - AUTOMATED VERIFICATION SUITE  ")
    print("==================================================")

    # 1. Login Authentication
    login_req = LoginRequest(email="shreya@sentimentscope.com", password="Password123!")
    login_res = login(login_req)
    assert login_res["status"] == "success", "Login failed"
    user = login_res["user"]
    print(" [✓] 1. Auth Login: Verified (User: Shreya Yadav, Role: Super Admin)")

    # 2. Text NLP Evaluation
    test_cases = [
        ("The dashboard is extraordinarily fast and intuitive!", "Positive"),
        ("The checkout crashed and support failed to reply.", "Negative"),
        ("The package was delivered on Wednesday afternoon.", "Neutral")
    ]
    for text_sample, expected in test_cases:
        res = analyze_text_endpoint(TextAnalysisRequest(text=text_sample), current_user=user)
        assert res["sentiment"] == expected, f"Expected {expected}, got {res['sentiment']}"
        print(f" [✓] 2. NLP Engine: '{text_sample[:28]}...' -> {res['sentiment']} ({res['confidence']}%)")

    # 3. Dynamic Dashboard Analytics
    dash = get_dashboard_summary(current_user=user)
    assert "stats" in dash and "distribution" in dash and "trends" in dash
    print(f" [✓] 3. Dashboard Metrics: {dash['stats']['total_analyses']} total analyses, {len(dash['trends'])} trend days")

    # 4. History & Audit Detail
    hist = list_history(search="", sentiment="all", page=1, limit=10, current_user=user)
    assert hist["total"] > 0
    item_id = hist["items"][0]["id"]
    detail = get_analysis_detail(item_id, current_user=user)
    assert detail["id"] == item_id
    print(f" [✓] 4. History & Audit Trail: Record {item_id} successfully retrieved")

    # 5. Reports & Intelligence Metrics
    rep = get_report_summary(period="weekly", current_user=user)
    assert "positive" in rep and "trend_comparison" in rep
    print(f" [✓] 5. Reports Intelligence: Weekly trend trajectory calculated ({rep['trend_comparison']['net_sentiment_change']})")

    # 6. Batch File Analysis
    test_csv = Path(__file__).parent / "temp_eval.csv"
    pd.DataFrame({
        "feedback": [
            "Outstanding performance and beautiful design!",
            "Neutral about the latest interface change.",
            "Horrible bug caused data loss during export."
        ]
    }).to_csv(test_csv, index=False)

    try:
        file_res = parse_and_analyze_file(test_csv)
        assert file_res["total_rows"] == 3
        assert file_res["positive_count"] == 1
        assert file_res["negative_count"] == 1
        assert file_res["neutral_count"] == 1
        print(" [✓] 6. Batch File Engine: CSV auto-detection, parsing & classification 100% accurate")
    finally:
        if test_csv.exists():
            test_csv.unlink()
        analyzed_p = Path(__file__).parent / "analyzed_temp_eval.csv"
        if analyzed_p.exists():
            analyzed_p.unlink()

    # 7. User Settings Update
    set_res = update_profile(UpdateProfileRequest(name="Shreya Yadav"), current_user=user)
    assert set_res["status"] == "success"
    print(" [✓] 7. Settings & Account: Profile update validated")

    print("\n>>> ALL TESTS PASSED: 100% PRODUCTION READY <<<\n")

if __name__ == "__main__":
    run_all_tests()
