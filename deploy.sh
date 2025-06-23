#!/bin/bash

# プロジェクトとリージョンの設定
PROJECT_ID="aceoripa"
REGION="asia-northeast1"
SERVICE_NAME="aceoripa-app"

# Dockerイメージのビルドとプッシュ
IMAGE_URL="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Building Docker image..."
docker build -t ${IMAGE_URL} .

echo "Pushing to Google Container Registry..."
docker push ${IMAGE_URL}

echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_URL} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --concurrency 80 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=https://vshkekffhjbvszzpagjt.supabase.co" \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDI2MjcsImV4cCI6MjA2NTk3ODYyN30.O0PKHvtxruYaspm56kjhY9sxDFmQX4gTAhmV3VPUAYY" \
  --set-env-vars "NEXT_PUBLIC_FINCODE_PUBLIC_KEY=p_prod_OWIwZjE1YjUtMzJjMS00MWY3LTgyMzYtYWYzOGMzYzc1Njg5MGM4ZDVkYmQtYTNjMy00NDEwLThlMDgtMDQ5ZmRlYTBlZGIzc18yNTA0MDg4MTA0OQ" \
  --set-env-vars "NEXT_PUBLIC_FINCODE_ENV=prod" \
  --set-env-vars "NEXT_PUBLIC_APP_URL=https://aceoripa-app-xxxxx.a.run.app"

echo "Deployment complete!"