# Supabase Email Template Setup Guide

This guide provides step-by-step instructions for setting up a Japanese email template in Supabase for user registration confirmation.

## Prerequisites

- Access to your Supabase project dashboard
- Admin privileges for the project

## Step 1: Access Supabase Dashboard

1. Navigate to [https://app.supabase.com](https://app.supabase.com)
2. Log in with your credentials
3. Select your project from the project list

## Step 2: Navigate to Email Templates

1. In the left sidebar, click on **Authentication**
2. Click on **Email Templates** in the submenu
3. You'll see a list of available email templates

## Step 3: Configure the Confirmation Email Template

1. Find and click on **Confirm signup** template
2. You'll see the template editor with the default template

## Step 4: Replace with Japanese Template

Replace the entire template content with the following Japanese HTML template:

```html
<h2>アカウント登録ありがとうございます</h2>

<p>{{ .Email }} 様</p>

<p>ACEORIPAへのご登録ありがとうございます。</p>
<p>以下のボタンをクリックしてメールアドレスを確認してください：</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #FF0033; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
    メールアドレスを確認
  </a>
</p>

<p>このリンクは24時間有効です。</p>

<p>
  ボタンが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：<br/>
  {{ .ConfirmationURL }}
</p>

<p>
  ご不明な点がございましたら、サポートまでお問い合わせください。
</p>

<p>ACEORIPAチーム</p>
```

## Step 5: Save the Template

1. After pasting the template, click the **Save** button
2. You should see a success message confirming the template has been updated

## Available Template Variables

The following variables are available in Supabase email templates:

- `{{ .Email }}` - The user's email address
- `{{ .ConfirmationURL }}` - The confirmation link URL (valid for 24 hours)
- `{{ .Token }}` - The confirmation token (if needed separately)
- `{{ .TokenHash }}` - The hashed version of the token
- `{{ .SiteURL }}` - Your application's site URL

## Testing the Email Template

### Method 1: Test Send Feature

1. In the email template editor, look for the **Send test email** button
2. Enter a test email address
3. Click send to receive a test email

### Method 2: Manual Testing

1. Create a test user account in your application
2. Check the email inbox for the confirmation email
3. Verify:
   - The Japanese text displays correctly
   - The confirmation button styling appears as expected (red background, white text)
   - The confirmation link works properly

### Method 3: Using Supabase Local Development

If using Supabase locally:

```bash
# Start Supabase locally
supabase start

# Access Inbucket email testing interface
# Default URL: http://localhost:54324
```

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SMTP settings in Authentication > Settings
   - Verify email provider configuration

2. **Japanese characters showing as question marks**
   - Ensure the email template is saved with UTF-8 encoding
   - Check that the email client supports Japanese characters

3. **Confirmation link not working**
   - Verify Site URL is correctly configured in Authentication > URL Configuration
   - Check that redirect URLs are added to the allowed list

### Email Subject Line

To customize the email subject line:

1. Go to Authentication > Email Templates
2. Find the **Subject** field above the template editor
3. Enter a Japanese subject, for example: `ACEORIPAへようこそ - メールアドレスの確認`

## Additional Customization

### Styling the Email

The template uses inline CSS for the button. You can modify:

- `background-color: #FF0033` - Button background color (currently red)
- `padding: 12px 24px` - Button padding
- `border-radius: 4px` - Button corner rounding

### Adding Company Logo

To add a logo to the email:

```html
<div style="text-align: center; margin-bottom: 20px;">
  <img src="YOUR_LOGO_URL" alt="ACEORIPA" style="max-width: 200px;">
</div>
```

Place this at the beginning of the template, before the `<h2>` tag.

## Security Considerations

1. The confirmation URL expires after 24 hours for security
2. Each confirmation link can only be used once
3. Ensure your Site URL uses HTTPS in production

## Next Steps

After setting up the email template:

1. Configure other email templates (password reset, magic link, etc.) with Japanese translations
2. Set up custom SMTP provider if needed for better deliverability
3. Monitor email delivery rates in the Supabase dashboard

## Reference Links

- [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)