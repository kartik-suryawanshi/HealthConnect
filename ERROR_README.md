# Current Error: Health record upload fails (Cloudinary)

## Symptom

- `POST /api/health-records` returns **500**
- Backend logs show:
  - `Cloudinary upload failed: Invalid cloud_name HealthConnect`

## Confirmed root cause

The backend is attempting to upload the file to Cloudinary, but the configured Cloudinary **cloud name** is invalid.

In `Backend/.env` the current value is:

- `CLOUDINARY_CLOUD_NAME=HealthConnect`

Cloudinary **cloud_name must match the exact cloud name** from your Cloudinary Console (Dashboard). It is case-sensitive and is not the app name.

## Fix

1. Open Cloudinary Console → Dashboard and copy your **Cloud name**
2. Update `Backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=<your_real_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

3. Restart the backend server (nodemon restart is fine)
4. Retry uploading a document

## Notes / related issues

- **Auth requirement**: `/api/health-records` is protected. The frontend must send `Authorization: Bearer <token>`.
- **Download bug (separate issue)**: uploaded records store `filePath` as a **Cloudinary URL**, but `downloadHealthRecord` currently treats `filePath` as a local filesystem path (`fs.existsSync` + `res.download`). If download is needed, the route should redirect/stream from the URL instead of reading local disk.

## Security note

Never commit Cloudinary secrets to git. `Backend/.gitignore` already ignores `.env`, but if credentials were shared publicly, rotate them in Cloudinary and update `Backend/.env`.

