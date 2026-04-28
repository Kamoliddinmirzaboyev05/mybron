# API Endpoints

Bu hujjat frontend tomonidan ishlatiladigan barcha backend API endpointlarni ko'rsatadi.

## Base URL
```
Base URL: https://gobronapi.webportfolio.uz/api
```

Environment variable: `VITE_API_URL` (optional, defaults to production)

## Authentication

### Register
```http
POST /auth/register/
Content-Type: application/json

{
  "username": "string",
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "password": "string",
  "password2": "string",
  "role": "user"
}

Response: {
  "user": { ... },
  "access": "string",
  "refresh": "string"
}
```

### Login
```http
POST /auth/login/
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: {
  "user": { ... },
  "access": "string",
  "refresh": "string"
}
```

### Logout
```http
POST /auth/logout/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "refresh": "string"
}
```

### Token Refresh
```http
POST /auth/token/refresh/
Content-Type: application/json

{
  "refresh": "string"
}

Response: {
  "access": "string"
}
```

### Get Profile
```http
GET /auth/profile/
Authorization: Bearer {access_token}

Response: {
  "id": number,
  "username": "string",
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "role": "user" | "admin",
  ...
}
```

## Fields (Maydonlar)

### Get All Fields
```http
GET /fields/

Response: {
  "count": number,
  "next": string | null,
  "previous": string | null,
  "results": [
    {
      "id": number,
      "name": "string",
      "address": "string",
      "city": "string",
      "location_url": "string" | null,
      "phone": "string",
      "price_per_hour": "string",
      "opening_time": "HH:MM:SS",
      "closing_time": "HH:MM:SS",
      "advance_booking_days": number,
      "is_active": boolean,
      "subscription_valid": boolean,
      "cover_image_url": "string" | null,
      "amenities": string[],
      "images_count": number,
      "rating": number,
      "review_count": number,
      "created_at": "ISO8601"
    }
  ]
}
```

### Get Field by ID
```http
GET /fields/{id}/

Response: {
  "id": number,
  "name": "string",
  ...
}
```

## Slots

### Get Field Slots
```http
GET /fields/{field_id}/slots/?date=YYYY-MM-DD

Response: {
  "field_id": number,
  "field_name": "string",
  "date": "YYYY-MM-DD",
  "price_per_hour": "string",
  "advance_booking_days": number,
  "available_dates": ["YYYY-MM-DD"],
  "slots": [
    {
      "id": number,
      "field": number,
      "field_id": number,
      "field_name": "string",
      "date": "YYYY-MM-DD",
      "start_time": "HH:MM:SS",
      "end_time": "HH:MM:SS",
      "is_active": boolean,
      "is_booked": boolean
    }
  ]
}
```

## Bookings

### Get User Bookings
```http
GET /bookings/?user={user_id}
Authorization: Bearer {access_token}

Response: {
  "count": number,
  "results": [
    {
      "id": number,
      "user": number,
      "field": number,
      "booking_date": "YYYY-MM-DD",
      "start_time": "HH:MM:SS",
      "end_time": "HH:MM:SS",
      "total_price": "string",
      "status": "pending" | "confirmed" | "rejected" | "cancelled",
      "payment_method": "string",
      "client_name": "string" | null,
      "client_phone": "string" | null,
      "note": "string" | null,
      "created_at": "ISO8601",
      "confirmed_at": "ISO8601" | null,
      "rejected_at": "ISO8601" | null,
      "reject_reason": "string" | null,
      "field_details": { ... }
    }
  ]
}
```

### Create Booking
```http
POST /bookings/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "field": number,
  "booking_date": "YYYY-MM-DD",
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "slot": number (optional),
  "total_price": number (optional),
  "note": "string" (optional)
}

Response: {
  "id": number,
  ...
}
```

### Update Booking Status
```http
PATCH /bookings/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "confirmed" | "rejected" | "cancelled"
}

Response: {
  "id": number,
  ...
}
```

## Admin

### Get Admin Bookings
```http
GET /admin/bookings/?status={status}
Authorization: Bearer {access_token}

Response: {
  "count": number,
  "results": [ ... ]
}
```

### Get Admin Stats
```http
GET /admin/stats/
Authorization: Bearer {access_token}

Response: {
  "today_revenue": "string",
  "total_revenue": "string",
  "balance": "string"
}
```

## Favorites

### Get Favorites
```http
GET /favorites/
Authorization: Bearer {access_token}

Response: {
  "count": number,
  "results": [
    {
      "id": number,
      "field": number
    }
  ]
}
```

### Add Favorite
```http
POST /favorites/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "field": number
}

Response: {
  "id": number,
  "field": number
}
```

### Remove Favorite
```http
DELETE /favorites/{id}/
Authorization: Bearer {access_token}
```

## Reviews

### Get Field Reviews
```http
GET /reviews/?field={field_id}

Response: {
  "count": number,
  "results": [
    {
      "id": number,
      "field": number,
      "user": number,
      "rating": number,
      "comment": "string",
      "created_at": "ISO8601",
      "user_details": {
        "first_name": "string",
        "last_name": "string"
      }
    }
  ]
}
```

### Get My Reviews
```http
GET /reviews/my/
Authorization: Bearer {access_token}

Response: {
  "count": number,
  "results": [ ... ]
}
```

### Submit Review
```http
POST /reviews/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "field": number,
  "rating": number (1-5),
  "comment": "string"
}

Response: {
  "id": number,
  ...
}
```

## Error Responses

Barcha xatolar quyidagi formatda qaytariladi:

```json
{
  "detail": "Xato xabari",
  "message": "Xato xabari",
  // yoki
  "field_name": ["Xato xabari"]
}
```

### Common Status Codes
- `200 OK` - Muvaffaqiyatli so'rov
- `201 Created` - Yangi resurs yaratildi
- `400 Bad Request` - Noto'g'ri so'rov
- `401 Unauthorized` - Autentifikatsiya kerak
- `403 Forbidden` - Ruxsat yo'q
- `404 Not Found` - Resurs topilmadi
- `500 Internal Server Error` - Server xatosi
