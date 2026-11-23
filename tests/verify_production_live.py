import urllib.request
import urllib.error
import json

def test_login(base_url, email, password):
    url = f"{base_url}/auth/login"
    data = json.dumps({"email": email, "password": password}).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            res = json.loads(r.read().decode())
            u = res.get("user", {})
            role = u.get("role")
            norm_role = u.get("norm_role")
            token = res.get("token", "")[:20]
            print(f"  [PASS] 200 OK | {email} | Role: {role} ({norm_role}) | Token: {token}...")
            return res.get("token")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  [HTTP {e.code}] {email} -> {body}")
    except Exception as e:
        print(f"  [ERROR] {email} -> {e}")
    return None

def test_protected(base_url, endpoint, token, label):
    url = f"{base_url}/{endpoint}"
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {token}", "User-Agent": "Mozilla/5.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            res = json.loads(r.read().decode())
            print(f"  [PASS] {label} -> {url} -> 200 OK | status: {res.get('status')}")
    except urllib.error.HTTPError as e:
        print(f"  [HTTP {e.code}] {label} -> {url} -> {e.read().decode()[:100]}")
    except Exception as e:
        print(f"  [ERROR] {label} -> {url} -> {e}")

print("=================================================================")
print("  SENTIMENT SCOPE - LIVE PRODUCTION ENDPOINT VERIFICATION")
print("=================================================================")

backend_url = "https://backend-sentimentscope.vercel.app/api"
print(f"\n1. Testing Backend API: {backend_url}")
t_shreya = test_login(backend_url, "admin@sentimentscope.com", "Password123!")
t_alex = test_login(backend_url, "alex@sentimentscope.com", "AdminPassword123!")
t_demo = test_login(backend_url, "demo@sentimentscope.com", "UserPassword123!")
print("Testing invalid password rejection:")
test_login(backend_url, "admin@sentimentscope.com", "WrongPassword!")

if t_shreya:
    print("\n2. Testing Protected Role Dashboards on Backend:")
    test_protected(backend_url, "super-admin/dashboard", t_shreya, "Super Admin Token")
if t_alex:
    test_protected(backend_url, "admin/dashboard", t_alex, "Admin Token")
    test_protected(backend_url, "super-admin/dashboard", t_alex, "Admin Token trying Super Admin (Must be 403)")
if t_demo:
    test_protected(backend_url, "user/dashboard", t_demo, "Standard User Token")
    test_protected(backend_url, "admin/dashboard", t_demo, "Standard User Token trying Admin (Must be 403)")

frontend_url = "https://sentiment-scope-alpha.vercel.app/api"
print(f"\n3. Testing Frontend Vercel API Proxy: {frontend_url}")
test_login(frontend_url, "admin@sentimentscope.com", "Password123!")
test_login(frontend_url, "alex@sentimentscope.com", "AdminPassword123!")
test_login(frontend_url, "demo@sentimentscope.com", "UserPassword123!")
print("=================================================================")
