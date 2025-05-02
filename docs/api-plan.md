# REST API Plan

## 1. Resources
- **Users** (Table: users)
- **Profiles** (Table: profiles)
- **Journeys** (Table: journeys)
- **Generations** (Table: generations)
- **Generation Error Logs** (Table: generation_error_logs)

## 2. Endpoints

### Profiles
- **GET /api/profiles/{id}**  
  Description: Retrieve a specific user's profile by ID.  
  Success: 200 OK with profile data.  
  Errors: 404 if the profile is not found or the user does not have access.

- **GET /api/profile**  
  Description: Get the current authenticated user's profile.  
  Success: 200 OK with profile data.  
  Errors: 401 if the user is not authenticated.

- **PUT /api/profile**  
  Description: Update the current authenticated user's profile preferences.  
  Request JSON:  
  ```json
  {
    "preferences": { ... },
    "level": number
  }
  ```  
  Success: 200 OK with updated profile.  
  Errors:  
  - 400 for validation errors (e.g., level not between 1 and 5).  
  - 401 if the user is not authenticated.  
  
### Journeys
- **GET /api/journeys**  
    Description: List all journeys for the current user with pagination, filtering, and sorting.  
    Query Params: `page`, `pageSize`, `sort`, `filter`.  
    Success: 200 OK with list of journeys.

- **POST /api/journeys**  
    Description: Create a new journey.  
    Request JSON:
    ```json
    {
        "destination": "string",
        "departure_date": "YYYY-MM-DD",
        "return_date": "YYYY-MM-DD",
        "activities": "string",
        "additional_notes": ["string"]
    }
    ```  
    Success: 201 Created with journey details.  
    Errors: 400 (validation errors, e.g. departure_date > return_date).

- **GET /api/journeys/{id}**  
    Description: Retrieve details of a specific journey.  
    Success: 200 OK with journey data.

- **PATCH /api/journeys/{id}**  
    Description: Update an existing journey.  
    Request JSON: Same as POST.  
    Success: 200 OK with updated journey.

- **DELETE /api/journeys/{id}**  
    Description: Delete a journey along with its related notes/plans.  
    Success: 200 OK confirmation.

### Generations
- **GET /api/journeys/{id}/generations**  
    Description: List all travel plan generations for a given journey.  
    Returns generation records with keys such as generated_text, edited_text, status, etc.  
    Success: 200 OK with array of generations.

- **POST /api/journeys/{id}/generations**  
    Description: Generate a new travel plan using an external AI service.  
    Request JSON:
    {
        "plan_preferences": { ... } // Optional additional preferences
    }  
    Note: The response record will include generated_text and an initial status 'generated'.  
    Success: 201 Created with the generated plan details.  
    Errors: 400 or 500 if AI service fails.

- **GET /api/generations/{id}**  
    Description: Get details of a specific generation including its generated_text, edited_text, and status.  
    Success: 200 OK with generation data.

- **PATCH /api/generations/{id}**  
    Description: Edit an existing travel plan generation (e.g., update edited_text or change status).  
    Request JSON:
    {
        "edited_text": "string",  // optional, if user edits the plan
        "status": "accepted_unedited" // or "accepted_edited", "rejected", etc.
    }  
    Success: 200 OK with updated generation details.

- **DELETE /api/generations/{id}**  
    Description: Delete a specific travel plan generation.  
    Success: 200 OK confirmation.  
    Errors: 404 if generation not found.

### Generation Error Logs
- **GET /api/journeys/{id}/error-logs**  
  Description: List error logs for a journey's generation attempts.  
  Success: 200 OK with an array of error logs.

- **GET /api/error-logs/{id}**  
  Description: Retrieve a specific error log's details.  
  Success: 200 OK with error log info.

## 3. Authentication and Authorization
- Mechanism: Token-based authentication using Supabase Auth.
- Process:
  - Users authenticate via /auth/login or /auth/register, receiving a bearer token.
  - Protected endpoints require the token in the Authorization header.
  - Database-level Row-Level Security (RLS) ensures that users access only records with matching user_id.
- Additional Considerations: Use HTTPS, rate limiting, and secure error messaging to mitigate security risks.
- Users can only access resources associated with their own user ID.

## 4. Validation and Business Logic
- Validate all incoming payloads using a schema (e.g., via Zod).
- Enforce business rules:
  - Departure date must be less or equal to return date.
  - Profiles: level must be between 1 and 5.
  - Unique email for registration.
  - Journey dates must have departure_date <= return_date.
  - Generation status must be one of ['generated', 'accepted_unedited', 'accepted_edited', 'rejected'].
- For travel plan generation (POST /api/journeys/{id}/generations):
  - Validate journey ownership.
  - Call and handle errors from the external AI service.
- Implement pagination, filtering, and sorting on list endpoints.
- Use early returns and guard clauses to manage error conditions.

## 5. Error Handling
- Use meaningful HTTP status codes:
  - 200 OK / 201 Created for success.
  - 400 Bad Request for validations.
  - 401 Unauthorized for invalid/missing authentication.
  - 404 Not Found when resource is missing.
  - 500 Internal Server Error for unexpected issues.
- Return error objects with a message and code for client feedback.
