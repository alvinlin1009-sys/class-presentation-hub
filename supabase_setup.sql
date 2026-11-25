-- 1. 建立儲存班級、科目、報告與名單資料的資料表
CREATE TABLE IF NOT EXISTS public.hub_state (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 建立公開儲存簡報檔案 (PDF / PPTX) 的 Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('presentations', 'presentations', true)
ON CONFLICT (id) DO UPDATE SET public = true;
