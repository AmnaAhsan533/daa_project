import os
import re
import math
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "datasets")

def natural_key(filename):
    return [int(num) for num in re.findall(r'\d+', filename)]


@app.get("/api/files")
def list_files():
    cp_path = os.path.join(DATASET_DIR, "closest_pair")
    im_path = os.path.join(DATASET_DIR, "integer_mul")
    
    cp_files = sorted([f for f in os.listdir(cp_path) if f.endswith(".txt")], key=natural_key) if os.path.exists(cp_path) else []
    im_files = sorted([f for f in os.listdir(im_path) if f.endswith(".txt")], key=natural_key) if os.path.exists(im_path) else []
    
    return {"closest_pair": cp_files, "integer_mul": im_files}


# =========================================================
# 1. YOUR CLOSEST PAIR ALGORITHM + STEP TRACING
# =========================================================
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def to_dict(self):
        return {"x": self.x, "y": self.y}

def dist(p1, p2):
    return math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2)

def closestPair(px, py, steps, depth=0):
    n = len(px)

    if n <= 1:
        return float('inf'), (None, None)

    if n == 2:
        d = dist(px[0], px[1])
        pair = (px[0], px[1])
        steps.append({
            "type": "base_case",
            "depth": depth,
            "mid_x": px[0].x,
            "d": d,
            "pair": [px[0].to_dict(), px[1].to_dict()],
            "desc": f"Base Case (n=2): Distance = {d:.4f}"
        })
        return d, pair

    if n == 3:
        pairs = [(px[0], px[1]), (px[0], px[2]), (px[1], px[2])]
        best_pair = min(pairs, key=lambda pair: dist(pair[0], pair[1]))
        d = dist(best_pair[0], best_pair[1])
        steps.append({
            "type": "base_case",
            "depth": depth,
            "mid_x": px[1].x,
            "d": d,
            "pair": [best_pair[0].to_dict(), best_pair[1].to_dict()],
            "desc": f"Base Case (n=3): Min distance = {d:.4f}"
        })
        return d, best_pair

    mid = n // 2
    mid_p = px[mid]

    steps.append({
        "type": "split",
        "depth": depth,
        "mid_x": mid_p.x,
        "desc": f"Divide Step (Depth {depth}): Split at vertical line x = {mid_p.x:.2f}"
    })

    left_set = set(px[0:mid])
    py_left = [p for p in py if p in left_set]
    py_right = [p for p in py if p not in left_set]

    dl, pair_l = closestPair(px[0:mid], py_left, steps, depth + 1)
    dr, pair_r = closestPair(px[mid:n], py_right, steps, depth + 1)

    if dl < dr:
        d, best_pair = dl, pair_l
    else:
        d, best_pair = dr, pair_r

    S = [p for p in py if abs(p.x - mid_p.x) < d]
    steps.append({
        "type": "strip",
        "depth": depth,
        "mid_x": mid_p.x,
        "d": d,
        "pair": [best_pair[0].to_dict(), best_pair[1].to_dict()] if best_pair[0] else None,
        "desc": f"Combine Step (Depth {depth}): Check strip |x - {mid_p.x:.2f}| < {d:.4f} ({len(S)} points)"
    })

    for i in range(len(S)):
        for j in range(i + 1, min(i + 8, len(S))):
            curr_d = dist(S[i], S[j])
            if curr_d < d:
                d = curr_d
                best_pair = (S[i], S[j])
                steps.append({
                    "type": "update",
                    "depth": depth,
                    "mid_x": mid_p.x,
                    "d": d,
                    "pair": [best_pair[0].to_dict(), best_pair[1].to_dict()],
                    "desc": f"New Closest Pair Found in Strip! Distance = {d:.4f}"
                })

    return d, best_pair

def helper(points):
    steps = []
    px = sorted(points, key=lambda p: p.x)
    py = sorted(points, key=lambda p: p.y)
    min_d, best_pair = closestPair(px, py, steps)
    return min_d, best_pair, steps


@app.get("/api/closest-pair/{filename}")
def get_closest_pair_trace(filename: str):
    filepath = os.path.join(DATASET_DIR, "closest_pair", filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")

    with open(filepath, "r") as f:
        lines = [line.strip() for line in f if line.strip()]
        first_parts = lines[0].split()
        start_idx = 1 if len(first_parts) == 1 else 0
        points = [Point(*map(float, line.split())) for line in lines[start_idx:]]

    min_d, best_pair, steps = helper(points)

    return {
        "points": [p.to_dict() for p in points],
        "steps": steps,
        "final_d": min_d,
        "best_pair": [best_pair[0].to_dict(), best_pair[1].to_dict()] if best_pair[0] else []
    }


# =========================================================
# 2. YOUR KARATSUBA ALGORITHM + STEP TRACING
# =========================================================
def integerMul(x, y, steps, depth=0):
    if x < 10 or y < 10:
        return x * y
    else:
        n = max(len(str(x)), len(str(y)))
        half = n // 2
        a = x // (10**(half))
        b = x % (10**(half))
        c = y // (10**(half))
        d = y % (10**(half))

        ac = integerMul(a, c, steps, depth + 1)
        bd = integerMul(b, d, steps, depth + 1)
        adbc = integerMul(a + b, c + d, steps, depth + 1) - ac - bd

        term1 = ac * (10**(2 * half))
        term2 = adbc * (10**(half))
        result = term1 + term2 + bd

        # Record top recursion levels so the stepper stays clean & concise
        if depth <= 3:
            steps.append({
                "type": "combine",
                "depth": depth,
                "x": str(x),
                "y": str(y),
                "n": n,
                "half": half,
                "a": str(a), "b": str(b),
                "c": str(c), "d": str(d),
                "ac": str(ac),
                "bd": str(bd),
                "ad_plus_bc": str(adbc),
                "term1": str(term1),
                "term2": str(term2),
                "term3": str(bd),
                "result": str(result),
                "title": f"Recursion Level {depth}: Multiply ({n}-digit numbers)",
                "desc": f"Split at {half} digits → Compute 3 sub-products → Combine result."
            })

        return result


@app.get("/api/integer-mul/{filename}")
def get_karatsuba_trace(filename: str):
    filepath = os.path.join(DATASET_DIR, "integer_mul", filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")

    with open(filepath, "r") as f:
        lines = [line.strip() for line in f if line.strip()]
        x = int(lines[0])
        y = int(lines[1])

    steps = []
    final_product = integerMul(x, y, steps)
    steps.reverse()  # Show top-level splits first

    return {
        "num1": str(x),
        "num2": str(y),
        "steps": steps,
        "final_product": str(final_product)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)