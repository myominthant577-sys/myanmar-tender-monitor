#!/usr/bin/env python3
"""Collect official issue PDF links and extract REVIEW-ONLY tender candidates."""
import datetime as dt, json, re, urllib.parse, requests
from bs4 import BeautifulSoup
import fitz
from pathlib import Path

SOURCES = {"mal": "https://www.moi.gov.mm/mal/", "km": "https://www.moi.gov.mm/km/", "gnlm": "https://www.moi.gov.mm/nlm/"}
KEYWORDS = ("တင်ဒါ", "လေလံ", "tender", "auction", "invitation for bid", "invitation to bid")
HEADERS = {"User-Agent": "MyanmarTenderMonitor/0.1 (+personal research; contact via repository)"}
session = requests.Session()
session.headers.update(HEADERS)

def fetch(url, limit=25_000_000):
    response = session.get(url, timeout=35)
    response.raise_for_status()
    if len(response.content) > limit:
        raise ValueError("Response exceeds size limit")
    return response

def candidates(home, today):
    soup = BeautifulSoup(fetch(home).text, "html.parser")
    urls = []
    for a in soup.find_all("a", href=True):
        url = urllib.parse.urljoin(home, a["href"])
        if not url.startswith("https://www.moi.gov.mm/"):
            continue
        label = a.get_text(" ", strip=True).lower()
        context = (label + " " + url).lower()
        if (today.strftime("%d %b %y").lower() in context or
            today.strftime("%d-%b-%y").lower() in context or
            today.strftime("%d/%m/%Y") in context or
            "download" in context or ".pdf" in context):
            urls.append(url)
    return list(dict.fromkeys(urls))[:15]

def inspect_pdf(url, source, issue_date):
    r = fetch(url)
    if not (r.content.startswith(b"%PDF") or "pdf" in r.headers.get("Content-Type", "").lower()):
        return None
    doc = fitz.open(stream=r.content, filetype="pdf")
    if len(doc) > 80:
        raise ValueError("Unexpected PDF page count")
    matches = []
    for i, page in enumerate(doc):
        text = page.get_text("text")
        if any(term in text.lower() for term in KEYWORDS):
            matches.append({"source":source,"issue_date":issue_date,"page":i+1,
                            "pdf_url":url,"status":"needs_review",
                            "excerpt":text[:400].strip()})
    return {"pages":len(doc),"matches":matches}

def main():
    today = dt.datetime.now(dt.timezone(dt.timedelta(hours=6,minutes=30))).date()
    out = {"updated_at":dt.datetime.now(dt.timezone.utc).isoformat(),
           "issues":[],"tenders":[],"candidates":[],"errors":[]}
    for key,home in SOURCES.items():
        try:
            urls = candidates(home,today)
            checked = 0
            for url in urls:
                if checked >= 3:
                    break
                try:
                    result = inspect_pdf(url,key,today.isoformat())
                    if result:
                        checked += 1
                        out["issues"].append({"source":key,"issue_date":today.isoformat(),
                                              "pdf_url":url,"pages":result["pages"],
                                              "status":"date_unverified"})
                        out["candidates"].extend(result["matches"])
                except (requests.RequestException, ValueError, RuntimeError) as e:
                    out["errors"].append({"source":key,"url":url,"error":str(e)[:180]})
        except (requests.RequestException, ValueError) as e:
            out["errors"].append({"source":key,"url":home,"error":str(e)[:180]})
    # Critical: never claim a PDF is the current issue merely because it is linked.
    # Candidate pages require human review of date, title, department and deadline.
    path=Path("data/tenders.json")
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Issues (unverified date): {len(out['issues'])}; review candidates: {len(out['candidates'])}; errors: {len(out['errors'])}")

if __name__ == "__main__":
    main()
