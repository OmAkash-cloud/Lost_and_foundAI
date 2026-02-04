# Firebase Setup Guide - Fixing Permission Errors

## 🔴 Common Error: "Permission Denied"

If you're seeing errors like:
- "Error: Failed to save your report"
- "Permission denied"
- "Failed to report lost item"

This is usually caused by **Firestore Security Rules** blocking writes.

---

## ✅ Solution: Update Firestore Security Rules

### Also Update Firebase Storage Rules

Since the app now uploads images to Firebase Storage, you also need to configure Storage security rules:

1. Go to Firebase Console → **Storage** (in left sidebar)
2. Click on **Rules** tab
3. Update rules to allow uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read/write access to found-items folder
    match /found-items/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

4. Click **Publish**

⚠️ **Note:** The above rule allows anyone to read/write. For production, add authentication checks.

---

## ✅ Solution: Update Firestore Security Rules

### Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **lostandfound-ai**
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update Security Rules

Replace the existing rules with one of these options:

#### Option A: Allow All Reads/Writes (FOR DEVELOPMENT ONLY)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **WARNING:** This allows anyone to read/write your database. Only use for development/testing!

#### Option B: Allow Reads/Writes for Specific Collections (RECOMMENDED)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to items collection
    match /items/{itemId} {
      allow read, write: if true;
    }
    
    // Allow read/write access to claims collection
    match /claims/{claimId} {
      allow read, write: if true;
    }
    
    // Allow read access to features collection
    match /features/{featureId} {
      allow read: if true;
      allow write: if false; // Only admins should write
    }
  }
}
```

#### Option C: Production-Ready Rules (WITH AUTHENTICATION)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write items
    match /items/{itemId} {
      allow read: if true; // Anyone can read
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    match /claims/{claimId} {
      allow read, write: if request.auth != null;
    }
    
    match /features/{featureId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Step 3: Publish Rules

1. Click **Publish** button
2. Wait for confirmation that rules are published
3. Try submitting the form again

---

## 🔍 Verify Firebase Connection

### Check Browser Console

1. Open your app in the browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for:
   - ✅ `Firebase DB Object:` - Should show Firestore object
   - ✅ `Attempting to save to Firebase:` - Should show your data
   - ❌ Any red error messages

### Test Connection

The app now logs detailed error messages. Check the console for:
- `Error code:` - Will show the specific Firebase error code
- `Error message:` - Will show the detailed error message

---

## 🛠️ Other Common Issues

### Issue 1: Firebase Not Initialized

**Error:** "Firebase database is not initialized"

**Solution:**
1. Check `client/src/firebase.js` has correct config
2. Make sure Firebase is installed: `npm install firebase`
3. Restart your dev server

### Issue 2: Network Issues

**Error:** "Firebase service is unavailable"

**Solution:**
1. Check your internet connection
2. Check if Firebase services are down: [Firebase Status](https://status.firebase.google.com/)
3. Try again in a few minutes

### Issue 3: Wrong Project ID

**Error:** Various connection errors

**Solution:**
1. Verify project ID in `firebase.js` matches Firebase Console
2. Check API key is correct
3. Ensure Firestore is enabled in Firebase Console

---

## 📋 Quick Checklist

- [ ] Firestore Database is enabled in Firebase Console
- [ ] Security rules allow writes to `items` collection
- [ ] Security rules allow writes to `claims` collection
- [ ] Rules are published (not just saved)
- [ ] Firebase package is installed: `npm install firebase`
- [ ] Browser console shows no Firebase initialization errors
- [ ] Internet connection is working

---

## 🆘 Still Having Issues?

1. **Check Browser Console:**
   - Open F12 → Console tab
   - Look for specific error codes and messages
   - Share the error details

2. **Verify Firebase Project:**
   - Go to Firebase Console
   - Check that Firestore Database exists
   - Verify project ID matches your config

3. **Test with Simple Write:**
   - Try the ReportFound form (simpler, might work)
   - Compare error messages between forms

4. **Check Network Tab:**
   - F12 → Network tab
   - Look for failed requests to `firestore.googleapis.com`
   - Check response status codes

---

## 📝 Current Firebase Configuration

Your current config in `client/src/firebase.js`:
- **Project ID:** `lostandfound-ai`
- **API Key:** `AIzaSyDvwC_6LrpmgklG4uLwcW_mAr3IhUMKOQo`
- **Database:** Firestore

Make sure these match your Firebase Console project!
