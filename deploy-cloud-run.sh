#!/bin/bash

# Cloud Runにデプロイするスクリプト

gcloud run deploy aceoripa \
  --source . \
  --region=asia-northeast1 \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --timeout=3600 \
  --max-instances=10 \
  --port=8080 \
  --project=aceoripa \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=https://vshkekffhjbvszzpagjt.supabase.co" \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDI2MjcsImV4cCI6MjA2NTk3ODYyN30.O0PKHvtxruYaspm56kjhY9sxDFmQX4gTAhmV3VPUAYY" \
  --set-env-vars="SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE" \
  --set-env-vars="OPENAI_API_KEY=your_openai_api_key_here" \
  --set-env-vars="ADMIN_EMAIL=admin@aceoripa.com" \
  --set-env-vars="ADMIN_PASSWORD=AceoripaAdmin2024!" \
  --set-env-vars="NEXT_PUBLIC_FINCODE_PUBLIC_KEY=p_prod_OWIwZjE1YjUtMzJjMS00MWY3LTgyMzYtYWYzOGMzYzc1Njg5MGM4ZDVkYmQtYTNjMy00NDEwLThlMDgtMDQ5ZmRlYTBlZGIzc18yNTA0MDg4MTA0OQ" \
  --set-env-vars="FINCODE_SECRET_KEY=m_prod_MTgzZGI5MGItZmQ2ZC00NGUwLWIxYTctYjZmNTkwMzdhNjg1YzY2NjY0NmMtNmJjMC00ZGQ4LTkyMzQtZGQ5OWVjMDljNzQ5c18yNTA0MDg4MTA0OQ" \
  --set-env-vars="FINCODE_SHOP_ID=s_25040881049" \
  --set-env-vars="NEXT_PUBLIC_FINCODE_ENV=prod" \
  --set-env-vars="NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKd0k3eD1Qu3KHaP3yQ9MOHqzKmJlCcUMJYn9wDKXmBpnkGE9L0bwkUupwbQxYrh8hgHDqvDCCBPKLqPQp5cX-4" \
  --set-env-vars="VAPID_PRIVATE_KEY=4H_eyZXKcvCPJ6Rt4r5woCCb1zqEQ5p9j1KmYqV7DG0" \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=aceoripa" \
  --set-env-vars="GOOGLE_CLOUD_LOCATION=us-central1" \
  --set-env-vars="VERTEX_AI_API_KEY=AIzaSyA_TDmS43g_8_FvRHeZIiYjPgqlZEmJ5o4" \
  --set-env-vars="GOOGLE_CLOUD_AUTH_USER=kousuke@restill.biz" \
  --set-env-vars="LEONARDO_AI_API_KEY=c80b4e94-44bb-487d-8829-1725bf5ca714"