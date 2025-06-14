# System Update API Documentation

## Endpoint
```
PATCH /systems/{system_id}/
```

## Authentication
- Requires authentication token in the header
- User must be the owner of the system

## Request Headers
```
Authorization: Token your_auth_token
Content-Type: application/json
```

## Request Body
All fields are optional except `password`. You can update any combination of fields:

```json
{
    "password": "your_current_password",  // Required for verification
    "name": "New System Name",           // Optional
    "category": "restaurant",            // Optional - "restaurant" or "supermarket"
    "description": "New description",    // Optional
    "is_public": true,                   // Optional - boolean
    "subdomain": "new-subdomain",        // Optional
    "custom_domain": "example.com",      // Optional
    "is_active": true                    // Optional - boolean
}
```

## Field Validations

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

## Response

### Success Response (200 OK)
```json
{
    "message": "System updated successfully",
    "system": {
        "id": 1,
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "name": "New System Name",
        "category": "restaurant",
        "description": "New description",
        "subdomain": "new-subdomain",
        "custom_domain": "example.com",
        "is_public": true,
        "is_active": true,
        "created_at": "2024-03-14T12:00:00Z",
        "updated_at": "2024-03-14T12:30:00Z",
        "url": "https://new-subdomain.yourdomain.com"
    }
}
```

### Error Responses

#### 400 Bad Request
```json
{
    "password": ["Incorrect password"]
}
```
or
```json
{
    "name": ["This name is already taken"]
}
```
or
```json
{
    "subdomain": ["This subdomain is already taken"]
}
```

#### 401 Unauthorized
```json
{
    "detail": "Authentication credentials were not provided."
}
```

#### 403 Forbidden
```json
{
    "error": "You do not have permission to update this system"
}
```

#### 404 Not Found
```json
{
    "error": "System not found"
}
```

## Example Usage

### Update System Name
```javascript
// Frontend code example
const updateSystem = async (systemId, data) => {
  try {
    const response = await fetch(`/systems/${systemId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: 'current_password',
        name: 'New System Name'
      })
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Update failed');
    }
    return result;
  } catch (error) {
    console.error('Error updating system:', error);
    throw error;
  }
};
```

### Update Multiple Fields
```javascript
const updateMultipleFields = async (systemId) => {
  const data = {
    password: 'current_password',
    name: 'Updated Name',
    description: 'New description',
    is_public: false,
    subdomain: 'new-subdomain'
  };
  
  const result = await updateSystem(systemId, data);
  console.log('System updated:', result);
};
```

## Important Notes for Frontend Implementation

1. **Password Verification**
   - Always require the current password for updates
   - Show appropriate error messages if password is incorrect

2. **Field Validation**
   - Implement client-side validation for:
     - Subdomain format (letters, numbers, hyphens only)
     - Domain format
     - Required field lengths
   - Show validation errors before making the API call

3. **Error Handling**
   - Handle all possible error responses
   - Display user-friendly error messages
   - Implement proper error state management

4. **Loading States**
   - Show loading indicators during the update process
   - Disable the update button while the request is in progress

5. **Success Feedback**
   - Show success messages after successful updates
   - Update the UI to reflect the new system data
   - Consider implementing optimistic updates

## React Example Component

```jsx
import React, { useState } from 'react';

const SystemUpdateForm = ({ systemId, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    password: '',
    name: initialData.name || '',
    description: initialData.description || '',
    is_public: initialData.is_public || false,
    subdomain: initialData.subdomain || '',
    custom_domain: initialData.custom_domain || '',
    is_active: initialData.is_active || true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/systems/${systemId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Update failed');
      }

      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <div>
        <label>Current Password (Required)</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>System Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Subdomain</label>
        <input
          type="text"
          name="subdomain"
          value={formData.subdomain}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Custom Domain</label>
        <input
          type="text"
          name="custom_domain"
          value={formData.custom_domain}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            name="is_public"
            checked={formData.is_public}
            onChange={handleChange}
          />
          Public System
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
          Active
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update System'}
      </button>
    </form>
  );
};

export default SystemUpdateForm;
```

## Usage Example

```jsx
// In your parent component
const SystemSettings = () => {
  const handleUpdateSuccess = (updatedSystem) => {
    // Handle successful update
    console.log('System updated:', updatedSystem);
    // Maybe show a success message
    // Maybe refresh the system data
  };

  return (
    <div>
      <h1>System Settings</h1>
      <SystemUpdateForm
        systemId={1}
        initialData={{
          name: 'My System',
          description: 'Current description',
          is_public: true,
          subdomain: 'my-system',
          custom_domain: 'example.com',
          is_active: true
        }}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};
``` 