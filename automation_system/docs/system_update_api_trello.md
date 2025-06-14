# 🔄 System Update API

## 📌 Endpoint
`PATCH /systems/{system_id}/`

## 🔐 Authentication
- Token required in header
- Must be system owner

## 📤 Request Body
```json
{
    "password": "current_password",  // Required
    "name": "New Name",             // Optional
    "category": "restaurant",       // Optional
    "description": "New desc",      // Optional
    "is_public": true,             // Optional
    "subdomain": "new-sub",        // Optional
    "custom_domain": "example.com", // Optional
    "is_active": true              // Optional
}
```

## ✅ Field Validations

### Name
- Must be unique across all systems
- Cannot be empty if provided

### Category
- Must be either "restaurant" or "supermarket"
- Cannot be empty if provided

### Subdomain
- Must be unique across all systems
- Can only contain letters, numbers, and hyphens
- Must be at least 3 characters long
- Cannot be longer than 63 characters
- Will be converted to lowercase

### Custom Domain
- Must be unique across all systems
- Can only contain letters, numbers, dots, and hyphens
- Cannot be longer than 255 characters
- Will be converted to lowercase

## 📥 Response Format

### Success (200 OK)
```json
{
    "message": "System updated successfully",
    "system": {
        "id": 1,
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "name": "New Name",
        "category": "restaurant",
        "description": "New desc",
        "subdomain": "new-sub",
        "custom_domain": "example.com",
        "is_public": true,
        "is_active": true,
        "created_at": "2024-03-14T12:00:00Z",
        "updated_at": "2024-03-14T12:30:00Z",
        "url": "https://new-sub.yourdomain.com"
    }
}
```

### Error Responses
- 400: Bad Request (password/name/subdomain errors)
- 401: Unauthorized (no token)
- 403: Forbidden (not owner)
- 404: Not Found (system not found)

## 💻 Frontend Implementation

### Required Features
1. Password verification
2. Field validation
3. Error handling
4. Loading states
5. Success feedback

### Example Code
```javascript
const updateSystem = async (systemId, data) => {
  const response = await fetch(`/systems/${systemId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Token ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

### React Component Props
```typescript
interface SystemUpdateFormProps {
  systemId: number;
  initialData: {
    name?: string;
    description?: string;
    is_public?: boolean;
    subdomain?: string;
    custom_domain?: string;
    is_active?: boolean;
  };
  onSuccess: (data: any) => void;
}
```

## 🎯 Implementation Checklist
- [ ] Add password field
- [ ] Implement field validations
- [ ] Add loading states
- [ ] Handle all error cases
- [ ] Add success feedback
- [ ] Update UI after success
- [ ] Add form validation
- [ ] Test all scenarios

## 🔍 Testing Scenarios
1. Update single field
2. Update multiple fields
3. Invalid password
4. Duplicate name/subdomain
5. Invalid field formats
6. Network errors
7. Unauthorized access
8. System not found

## 📝 Notes
- Password required for all updates
- All fields optional except password
- Subdomain/domain must be unique
- Category must be valid type
- Show loading during update
- Display clear error messages 