# How to Check if Form was Submitted to Meritto

This guide explains multiple methods to verify if your form was successfully submitted and data was sent to Meritto.

## Method 1: Browser Console (Easiest)

### Step 1: Open Browser Developer Tools
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

### Step 2: Check Console Logs
The form tracking script automatically logs all events. Look for messages prefixed with `[Meritto Form Debug]`:

```
[Meritto Form Debug] Initializing form tracking...
[Meritto Form Debug] Message received from: https://...
[Meritto Form Debug] Form submission SUCCESS detected via message event!
[Meritto Form Debug] Form Submission Detected! {timestamp, method, data, status}
```

### Step 3: Use Console Commands
Type these commands in the browser console:

```javascript
// Check current form submission status
checkMerittoFormStatus()

// Get detailed submission data
getFormSubmissionData()
```

## Method 2: Network Tab (Most Reliable)

### Step 1: Open Network Tab
1. Open Developer Tools (`F12`)
2. Click on the **Network** tab
3. Clear existing requests (click the 🚫 icon)

### Step 2: Submit the Form
1. Fill out and submit the form
2. Watch the Network tab for new requests

### Step 3: Filter for Meritto Requests
1. In the Network tab filter box, type: `nopaperforms`
2. Look for requests to:
   - `https://widgets.in6.nopaperforms.com`
   - `https://track.nopaperforms.com`
   - `https://timekidspreschools.in6.nopaperforms.com`

### Step 4: Check Request Details
- Click on a request that looks like a form submission
- Check the **Headers** tab for:
  - Request URL
  - Request Method (usually POST)
  - Form Data (in Payload or Request Payload section)
- Check the **Response** tab:
  - Look for `"success": true` or `"status": "success"`
  - Check Status Code (200 = success)

## Method 3: Meritto Dashboard

### Step 1: Login to Meritto Dashboard
1. Go to your Meritto/nopaperforms dashboard
2. Login with your credentials

### Step 2: Check Form Submissions
1. Navigate to your form (Form ID: `0d11ace91eda0a504dbaeba8e27fcf83`)
2. Check the submissions/leads section
3. Look for new entries with timestamps matching your test submission

## Method 4: localStorage Check

### In Browser Console:
```javascript
// Check if submission data was stored
JSON.parse(localStorage.getItem('meritto_form_submission'))
```

This will show:
- Timestamp of submission
- Detection method used
- Submission status

## Method 5: Monitor Network Requests Programmatically

The script automatically intercepts and logs:
- `fetch()` API requests to Meritto
- `XMLHttpRequest` requests to Meritto
- All responses are logged to console in debug mode

## Troubleshooting

### If form doesn't redirect:
1. **Check Console**: Look for errors or debug messages
2. **Check Network**: Verify if request was sent successfully
3. **Check Response**: Ensure Meritto returned success status
4. **Verify Form Widget**: Run `checkMerittoFormStatus()` in console

### If no console logs appear:
1. Make sure `DEBUG_MODE` is set to `true` in the script (line ~1340)
2. Refresh the page
3. Submit the form again

### Common Issues:

**Issue**: "Form Widget NOT Found!"
- **Solution**: Wait for page to fully load, the widget loads asynchronously

**Issue**: "No network requests to nopaperforms"
- **Solution**: 
  - Check if form widget is properly loaded
  - Verify form ID is correct: `0d11ace91eda0a504dbaeba8e27fcf83`
  - Check browser console for JavaScript errors

**Issue**: "Request sent but no success response"
- **Solution**: 
  - Check Meritto dashboard for the submission
  - Verify form validation passed
  - Check Network tab response for error messages

## Test Form Submission

To test form submission tracking:

1. Open browser console (`F12`)
2. Clear console logs
3. Fill out the form with test data
4. Submit the form
5. Watch for:
   - Console debug messages
   - Network requests in Network tab
   - Automatic redirect to `thank-you.html`

## Quick Verification Checklist

- [ ] Console shows `[Meritto Form Debug]` messages
- [ ] Network tab shows POST request to nopaperforms.com
- [ ] Request response contains `"success": true`
- [ ] `checkMerittoFormStatus()` shows `submitted: true`
- [ ] Redirect to thank-you.html happens
- [ ] Entry appears in Meritto dashboard

## Disable Debug Mode

To disable console logging in production, change this line in `index.html`:

```javascript
var DEBUG_MODE = false;  // Change from true to false
```

---

**Note**: The form tracking script uses multiple detection methods to ensure reliability. If one method doesn't work, others will catch the submission.

