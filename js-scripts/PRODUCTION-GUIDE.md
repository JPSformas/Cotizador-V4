# Production Integration Guide - Razón Social Autocomplete

## Quick Steps to Go Live

### 1. Set API Endpoint
**Location:** Line 43 in `razon-social-autocomplete.js`

```javascript
const CONFIG = {
    API_ENDPOINT: '/api/clients',  // ← Set your actual endpoint here
    // ... other config
};
```

### 2. Replace `loadClientData()` Function
**Location:** Lines 153-189

**Remove:** All mock data (lines 167-188)

**Replace with:**
```javascript
function loadClientData() {
    fetch(CONFIG.API_ENDPOINT)
        .then(response => response.json())
        .then(data => {
            // Filter only active clients
            clientData = Array.isArray(data) ? data.filter(client => client.activo) : [];
        })
        .catch(error => {
            console.error('Error loading clients:', error);
            clientData = []; // Fallback to empty array
        });
}
```

### 3. Replace `performSearch()` Function
**Location:** Lines 194-251

**Remove:** The entire `setTimeout` block (lines 224-250)

**Replace with:**
```javascript
function performSearch(fieldId, query) {
    // ... existing code until line 207 ...
    
    // Replace setTimeout block with:
    fetch(`${CONFIG.API_ENDPOINT}?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            const filtered = Array.isArray(data) ? data.filter(client => client.activo) : [];
            const limitedResults = filtered.slice(0, CONFIG.MAX_RESULTS);
            renderResults(fieldId, limitedResults, filtered.length, query);
        })
        .catch(error => {
            console.error('Error searching clients:', error);
            hideDropdown();
        });
}
```

### 4. Update `showAllClients()` (Optional)
**Location:** Lines 256-261

If your API supports fetching all clients, replace with:
```javascript
function showAllClients(fieldId) {
    fetch(`${CONFIG.API_ENDPOINT}?limit=${CONFIG.MAX_RESULTS}`)
        .then(response => response.json())
        .then(data => {
            const activeClients = Array.isArray(data) ? data.filter(client => client.activo) : [];
            const limitedResults = activeClients.slice(0, CONFIG.MAX_RESULTS);
            renderResults(fieldId, limitedResults, activeClients.length, '');
        })
        .catch(error => {
            console.error('Error loading all clients:', error);
            hideDropdown();
        });
}
```

**OR** keep current implementation if you want to use the already-loaded `clientData`.

### 5. Update `createNewClient()` (Optional)
**Location:** Lines 485-510

If you want to enable creating new clients:
```javascript
function createNewClient(fieldId, name) {
    fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name })
    })
    .then(response => response.json())
    .then(newClient => {
        // Add to clientData
        clientData.push(newClient);
        // Select the new client
        selectClient(fieldId, newClient.codigo, newClient.nombre);
    })
    .catch(error => {
        console.error('Error creating client:', error);
        // Fallback: just set the value
        const input = document.getElementById(fieldId);
        if (input) {
            input.value = name;
            input.dataset.selectedId = 'new';
            input.dataset.selectedValue = name;
        }
    });
}
```

## API Requirements

Your API must return data in this format:
```json
[
    {
        "codigo": "0001",
        "nombre": "FINNEGANS S.A.",
        "descripcion": "",
        "activo": true
    }
]
```

**Search endpoint:** Should accept `?q=searchterm` query parameter

**Response:** Array of client objects (filtered by `activo: true` on frontend)

## Testing Checklist

- [ ] API endpoint is accessible
- [ ] Search returns filtered results
- [ ] Loading state shows during API calls
- [ ] Error handling works (network failures)
- [ ] Empty results show "No se encontraron resultados"
- [ ] Selected value is stored correctly
- [ ] Works in both main form and modal

## Notes

- The script automatically filters `activo: true` clients
- Results are limited to 50 for performance
- Debouncing (300ms) reduces API calls
- No changes needed to HTML or CSS


