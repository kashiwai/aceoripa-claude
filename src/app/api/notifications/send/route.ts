import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

// Configure VAPID keys from environment variables
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
}

webpush.setVapidDetails(
  'mailto:support@aceoripa.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

export async function POST(request: NextRequest) {
  try {
    // VAPID keysチェック
    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      console.error('VAPID keys not configured');
      return NextResponse.json(
        { error: 'Push notification service not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { subscription, title, message, icon, url, sendToAll = false } = body

    const supabase = createAdminClient()

    if (sendToAll) {
      // Send to all active subscriptions
      const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('is_active', true)

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch subscriptions' },
          { status: 500 }
        )
      }

      const payload = JSON.stringify({
        title,
        body: message,
        icon: icon || '/icon-192x192.png',
        url: url || '/',
        requireInteraction: true,
        tag: 'gacha-campaign'
      })

      const promises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh_key,
                auth: sub.auth_key
              }
            },
            payload
          )
          return { success: true, endpoint: sub.endpoint }
        } catch (error) {
          console.error(`Failed to send to ${sub.endpoint}:`, error)
          return { success: false, endpoint: sub.endpoint, error }
        }
      })

      const results = await Promise.all(promises)
      const successful = results.filter(r => r.success).length
      
      return NextResponse.json({
        success: true,
        message: `Sent to ${successful}/${results.length} subscriptions`,
        results
      })

    } else if (subscription) {
      // Send to specific subscription
      const payload = JSON.stringify({
        title,
        body: message,
        icon: icon || '/icon-192x192.png',
        url: url || '/',
        requireInteraction: false,
        tag: 'gacha-notification'
      })

      await webpush.sendNotification(subscription, payload)

      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully'
      })

    } else {
      return NextResponse.json(
        { error: 'Missing subscription data' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Send notification API error:', error)
    
    if (error.statusCode === 410) {
      // Subscription is no longer valid, remove from database
      const supabase = createAdminClient()
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('endpoint', error.endpoint)
    }

    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}