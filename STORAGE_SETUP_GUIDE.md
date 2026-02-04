# Firebase Storage Setup Guide

## 🔴 Issue: CORS Error / Image Upload Failing

If you're seeing CORS errors or "Permission denied" when uploading images, you need to configure Firebase Storage security rules.

---

## ✅ Solution: Configure Firebase Storage Rules

### Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **lostandfound-ai**
3. Click on **Storage** in the left sidebar (if you don't see it, you may need to enable Storage first)
4. Click on the **Rules** tab

### Step 2: Enable Firebase Storage (if not enabled)

If you don't see Storage in the sidebar:

1. Click **Storage** in the left sidebar
2. Click **Get Started**
3. Choose **Start in test mode** (for development) or **Start in production mode**
4. Select a location for your storage bucket
5. Click **Done**

### Step 3: Update Storage Security Rules

Replace the existing rules with one of these options:

#### Option A: Allow All Reads/Writes (FOR DEVELOPMENT ONLY)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **WARNING:** This allows anyone to read/write. Only use for development/testing!

#### Option B: Allow Reads/Writes for Specific Folders (RECOMMENDED)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read/write access to found-items folder
    match /found-items/{allPaths=**} {
      allow read, write: if true;
    }
    
    // Allow read/write access to lost-items folder (if you add this later)
    match /lost-items/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

#### Option C: Production-Ready Rules (WITH AUTHENTICATION)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /found-items/{allPaths=**} {
      allow read: if true; // Anyone can read
      allow write: if request.auth != null; // Only authenticated users can write
    }
  }
}
```

### Step 4: Publish Rules

1. Click **Publish** button
2. Wait for confirmation that rules are published
3. Try uploading an image again

---

## 🔍 Verify Storage is Working

### Check Browser Console

1. Open your app in the browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try uploading an image
5. Look for:
   - ✅ `Uploading image to Firebase Storage...`
   - ✅ `Image uploaded successfully. URL: https://...`
   - ❌ Any red error messages

### Check Firebase Console

1. Go to Firebase Console → **Storage**
2. Click on **Files** tab
3. You should see a `found-items/` folder
4. Uploaded images should appear there

---

## 🛠️ Common Issues

### Issue 1: Storage Not Enabled

**Error:** "Storage is not initialized" or Storage doesn't appear in Firebase Console

**Solution:**
1. Go to Firebase Console
2. Click **Storage** in left sidebar
3. Click **Get Started** if prompted
4. Follow the setup wizard

### Issue 2: CORS Errors

**Error:** "CORS policy: Response to preflight request doesn't pass access control check"

**Solution:**
1. This is usually caused by Storage security rules blocking the request
2. Update Storage rules as shown above
3. Make sure rules are **published** (not just saved)
4. Wait a few seconds for rules to propagate

### Issue 3: Permission Denied

**Error:** "storage/unauthorized" or "Permission denied"

**Solution:**
1. Check Storage security rules allow writes
2. Make sure rules are published
3. Verify the path matches: `found-items/{allPaths=**}`

### Issue 4: Storage Bucket Not Found

**Error:** "Storage bucket not found"

**Solution:**
1. Check `firebase.js` has correct `storageBucket` value
2. Should be: `lostandfound-ai.firebasestorage.app`
3. Verify in Firebase Console → Project Settings → General

---

## 📋 Quick Checklist

- [ ] Firebase Storage is enabled in Firebase Console
- [ ] Storage security rules allow writes to `found-items/` folder
- [ ] Rules are published (not just saved)
- [ ] Storage bucket name matches in `firebase.js`
- [ ] Browser console shows no CORS errors
- [ ] Images appear in Firebase Console → Storage → Files

---

## 🆘 Still Having Issues?

1. **Check Browser Console:**
   - F12 → Console tab
   - Look for specific error codes
   - Share the error details

2. **Verify Storage Configuration:**
   - Go to Firebase Console → Project Settings
   - Check Storage bucket name matches `firebase.js`
   - Verify Storage is enabled

3. **Test Storage Rules:**
   - Go to Firebase Console → Storage → Rules
   - Use the Rules Playground to test your rules
   - Make sure writes are allowed

4. **Check Network Tab:**
   - F12 → Network tab
   - Look for failed requests to `firebasestorage.googleapis.com`
   - Check response status codes (should be 200, not 403 or 404)

---

## 📝 Current Storage Configuration

Your current config in `client/src/firebase.js`:
- **Storage Bucket:** `lostandfound-ai.firebasestorage.app`
- **Upload Path:** `found-items/{timestamp}_{filename}`

Make sure these match your Firebase Console project!

---

## 💡 Note

The app now saves items to Firestore **even if image upload fails**. This means:
- Item details will be saved
- Image URL will be null if upload fails
- You'll see a warning message about the image upload failure
- You can fix Storage rules and re-upload images later
