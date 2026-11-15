# Myanmar Tender Monitor

Personal, non-commercial proof of concept hosted on Vercel Hobby. Next.js dashboard with **zero fabricated tender records**.

## Deploy
1. Import this repository into Vercel and select Next.js framework.
2. Deploy without environment variables.
3. The dashboard reads `data/tenders.json` at build/runtime. The repository currently contains no verified tender notices.

## Verification policy
Only add records after inspecting the **actual official newspaper PDF** and verifying the issue date, page number, title, department, and source URL. Do not infer notices from snippets or OCR keyword hits alone. Format: `{source,title,department,issue_date,page,summary,pdf_url}`.

## Next steps
A collector and Burmese OCR verification pipeline are **not yet implemented**. Automatic scraping is not claimed. Vercel Hobby is for personal non-commercial use. Check publisher terms before storing or redistributing PDFs.
