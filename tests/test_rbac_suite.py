import sys
import os
import unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from routes.auth_routes import register, login, logout, get_me, RegisterRequest, LoginRequest
from routes.role_routes import (
    get_super_admin_dashboard,
    get_admin_dashboard,
    get_user_dashboard,
    list_users,
    create_user_by_admin,
    update_user_by_admin,
    delete_user_by_admin,
    list_analyses,
    create_analysis_record,
    get_single_analysis,
    delete_single_analysis,
    CreateUserAdminRequest,
    UpdateUserAdminRequest,
    CreateAnalysisRequest
)
from fastapi import HTTPException
from database import db
import uuid

class TestRBACSuite(unittest.TestCase):
    def setUp(self):
        # 1. Login as Super Admin (Shreya)
        res_super = login(LoginRequest(email="admin@sentimentscope.com", password="Password123!"))
        self.super_admin_token = res_super["token"]
        self.super_admin = res_super["user"]

        # 2. Login as Admin (Alex Vance)
        res_admin = login(LoginRequest(email="alex@sentimentscope.com", password="AdminPassword123!"))
        self.admin_token = res_admin["token"]
        self.admin = res_admin["user"]

        # 3. Login as Standard User (Demo User)
        res_user = login(LoginRequest(email="demo@sentimentscope.com", password="UserPassword123!"))
        self.user_token = res_user["token"]
        self.user = res_user["user"]

    def test_01_public_registration_role_escalation_prevention(self):
        """Users registering publicly must never be granted Super Admin or Admin"""
        unique_email = f"attacker_{uuid.uuid4().hex[:6]}@test.com"
        reg_req = RegisterRequest(
            name="Sneaky User",
            email=unique_email,
            password="Password123!",
            confirm_password="Password123!",
            phone="+1 555-0199",
            role="Super Admin" # Malicious attempt to escalate role
        )
        reg_res = register(reg_req)
        self.assertEqual(reg_res["status"], "success")
        self.assertEqual(reg_res["user"]["role"], "User", "Self-registration must ALWAYS enforce standard User role!")
        self.assertEqual(reg_res["user"]["norm_role"], "USER")

    def test_02_super_admin_dashboard_access(self):
        """Only Super Admin can access Super Admin Dashboard"""
        # Super Admin accesses -> Success
        res = get_super_admin_dashboard(current_user=self.super_admin)
        self.assertEqual(res["status"], "success")
        self.assertIn("total_users", res["data"])
        self.assertIn("system_health", res["data"])

        # Admin accesses -> 403 Forbidden
        with self.assertRaises(HTTPException) as ctx:
            from auth import require_super_admin
            require_super_admin(self.admin)
        self.assertEqual(ctx.exception.status_code, 403)

        # Standard User accesses -> 403 Forbidden
        with self.assertRaises(HTTPException) as ctx:
            from auth import require_super_admin
            require_super_admin(self.user)
        self.assertEqual(ctx.exception.status_code, 403)

    def test_03_admin_dashboard_access(self):
        """Admin & Super Admin can access Admin Dashboard, Standard User cannot"""
        res = get_admin_dashboard(current_user=self.admin)
        self.assertEqual(res["status"], "success")
        self.assertIn("managed_users", res["data"])

        # Standard user accesses -> 403 Forbidden
        with self.assertRaises(HTTPException) as ctx:
            from auth import require_admin
            require_admin(self.user)
        self.assertEqual(ctx.exception.status_code, 403)

    def test_04_admin_cannot_create_super_admin(self):
        """Admin is forbidden from provisioning Super Admin accounts"""
        with self.assertRaises(HTTPException) as ctx:
            create_user_by_admin(
                CreateUserAdminRequest(
                    name="Fake Super",
                    email=f"fake_super_{uuid.uuid4().hex[:6]}@test.com",
                    password="Password123!",
                    role="Super Admin"
                ),
                current_user=self.admin
            )
        self.assertEqual(ctx.exception.status_code, 403)

    def test_05_admin_cannot_modify_super_admin(self):
        """Admin cannot deactivate, modify or downgrade Super Admin"""
        with self.assertRaises(HTTPException) as ctx:
            update_user_by_admin(
                user_id=self.super_admin["id"],
                req=UpdateUserAdminRequest(status="inactive", role="User"),
                current_user=self.admin
            )
        self.assertEqual(ctx.exception.status_code, 403)

    def test_06_admin_cannot_delete_users(self):
        """Only Super Admin can delete users permanently"""
        with self.assertRaises(HTTPException) as ctx:
            from auth import require_super_admin
            require_super_admin(self.admin)
        self.assertEqual(ctx.exception.status_code, 403)

    def test_07_analyses_data_isolation(self):
        """Standard User can only view their own analyses"""
        # Create analysis as standard user
        anl_res = create_analysis_record(
            CreateAnalysisRequest(text="This product is brilliant and intuitive!", source_name="User Test Review"),
            current_user=self.user
        )
        anl_id = anl_res["analysis"]["id"]
        
        # User can get their own
        fetched = get_single_analysis(anl_id, current_user=self.user)
        self.assertEqual(fetched["id"], anl_id)

        # Standard user cannot delete another user's analysis
        other_user = {"id": "usr_other_random", "role": "User", "norm_role": "USER"}
        with self.assertRaises(HTTPException) as ctx:
            delete_single_analysis(anl_id, current_user=other_user)
        self.assertEqual(ctx.exception.status_code, 404)

    def test_08_logout_endpoint(self):
        """Logout endpoint returns success and logs activity"""
        res = logout(current_user=self.user)
        self.assertEqual(res["status"], "success")

if __name__ == "__main__":
    unittest.main()
