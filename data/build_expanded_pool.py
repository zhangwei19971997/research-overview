import json, openpyxl

base = "C:/Users/Administrator/WorkBuddy/zsxq-site/data/"

# 现有 08-26 池
wb = openpyxl.load_workbook(base + "stock_pool_2026-08-26.xlsx")
ws = wb.active
rows = list(ws.iter_rows(values_only=True))
hdr = rows[0]
pool = {}  # code -> (name, theme)
order = []
for r in rows[1:]:
    c = str(r[0]).strip()
    pool[c] = (r[1], (r[2] if len(r) > 2 and r[2] else ""))
    order.append(c)

existing_codes = set(pool.keys())

# 新池按日期顺序并入，重叠保留现有条目（保留历史评分可比性）
for d in ["2026-08-28", "2026-08-29", "2026-08-30"]:
    j = json.load(open(base + d + ".json", encoding="utf-8"))
    for s in j.get("stocks", []):
        c = str(s["code"]).strip()
        if c not in pool:
            pool[c] = (s["name"], s.get("theme", ""))
            order.append(c)

print("merged total =", len(order))

# 写新池
nw = openpyxl.Workbook()
nws = nw.active
nws.title = "股票池"
nws.append(list(hdr))
for c in order:
    nws.append([c, pool[c][0], pool[c][1]])
nw.save(base + "stock_pool_2026-08-30.xlsx")
print("saved stock_pool_2026-08-30.xlsx rows =", len(order))

# 统计
news = set()
for d in ["2026-08-28", "2026-08-29", "2026-08-30"]:
    j = json.load(open(base + d + ".json", encoding="utf-8"))
    for s in j.get("stocks", []):
        news.add(str(s["code"]).strip())
new_only = [c for c in order if c in news and c not in existing_codes]
print("纯新增(相对08-26池) =", len(new_only))
print("examples:", [(c, pool[c][0]) for c in new_only[:10]])
