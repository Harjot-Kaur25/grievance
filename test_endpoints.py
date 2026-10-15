import urllib.request
import urllib.error
import json
import time

def test_endpoint(url, method='GET', data=None, headers=None):
    req = urllib.request.Request(url, method=method, data=data, headers=headers or {})
    try:
        t0 = time.time()
        with urllib.request.urlopen(req) as resp:
            elapsed = round((time.time() - t0) * 1000, 1)
            raw = resp.read()
            return resp.status, raw, elapsed
    except urllib.error.HTTPError as e:
        return e.code, e.read(), 0

print("=== TESTING BACKEND HTTP ENDPOINTS ===")

status, body, ms = test_endpoint("http://127.0.0.1:8000/health")
print(f"/health: {status} in {ms}ms -> {json.loads(body)}")

status, body, ms = test_endpoint("http://127.0.0.1:8000/options")
opts = json.loads(body)
print(f"/options: {status} in {ms}ms -> sub_categories: {len(opts['sub_categories'])}, wards: {len(opts['wards'])}, statuses: {len(opts['statuses'])}")

status, body, ms = test_endpoint("http://127.0.0.1:8000/stats")
st = json.loads(body)
print(f"/stats: {status} in {ms}ms -> total: {st.get('total')}, open: {st.get('open')}, priorities: {st.get('by_priority')}")

status, body, ms = test_endpoint("http://127.0.0.1:8000/hotspots?limit=3&min_complaints=1")
hs = json.loads(body)
print(f"/hotspots: {status} in {ms}ms -> count: {len(hs)}, top ward: {hs[0]['ward']}, hotspot_score: {hs[0]['hotspot_score']}")

status, body, ms = test_endpoint("http://127.0.0.1:8000/complaints?limit=3&offset=0")
comps = json.loads(body)
print(f"/complaints: {status} in {ms}ms -> count: {len(comps)}, first_id: {comps[0]['id']}")

# Test POST /predict with save=False
payload = json.dumps({
    "sub_category": "Garbage dump",
    "ward": "Horamavu",
    "status": "Registered",
    "staff_remarks": "1st Assigned",
    "designation": "AE",
    "age_hours": 24,
    "save": False
}).encode("utf-8")
status, body, ms = test_endpoint("http://127.0.0.1:8000/predict", method="POST", data=payload, headers={"Content-Type": "application/json"})
pred = json.loads(body)
print(f"/predict (save=False): {status} in {ms}ms -> id: {pred.get('id')} (should be None since save=False), priority: {pred.get('priority')}, conf: {pred.get('confidence')}, reason: {pred.get('reason')}")

# Test POST /predict/batch with valid small CSV
boundary = "----WebKitFormBoundaryCIVICTest"
csv_lines = [
    "sub_category,ward,status,staff_remarks,designation,age_hours",
    "Garbage dump,Horamavu,Registered,1st Assigned,AE,24",
    "Drainage Overflow,Thanisandra,Registered,Field inspection,AEE,48",
    "Street Light Not Working,Domlur,Registered,Pending line repair,Lineman,12"
]
csv_body = "\r\n".join(csv_lines)
body_bytes = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="test.csv"\r\n'
    f"Content-Type: text/csv\r\n\r\n"
    f"{csv_body}\r\n"
    f"--{boundary}--\r\n"
).encode("utf-8")
headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
status, body, ms = test_endpoint("http://127.0.0.1:8000/predict/batch?explain=true&save=false", method="POST", data=body_bytes, headers=headers)
batch_res = json.loads(body)
print(f"/predict/batch: {status} in {ms}ms -> count: {batch_res.get('count')}, summary: {batch_res.get('summary')}")

print("\n=== TESTING FRONTEND HTTP ===")
status, body, ms = test_endpoint("http://127.0.0.1:5173/")
html = body.decode("utf-8")
print(f"Frontend index: {status} in {ms}ms, contains CIVIC: {'CIVIC' in html}")
