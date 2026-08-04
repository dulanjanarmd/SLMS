# Debug Session: event-creation-failure

Status: [OPEN] — Post-fix verification pending
Created: 2026-08-03
Symptom: User reports "when i try to create event it doesn't work" — event creation in admin-frontend Events.jsx fails silently or shows generic error.

## Hypotheses (Falsifiable)

1. **H1 (CONFIRMED via H2/H3): Missing `@Valid` + Jackson deserialization errors unreported**: The EventController create endpoints lack `@Valid`, and Jackson exceptions (LocalDate/LocalTime format) fall through to generic handler with unhelpful message.
2. **H2 (CONFIRMED): Frontend error message mismatch**: GlobalExceptionHandler returns `Map<String,String>` for MethodArgumentNotValidException (field errors without a `message` property), so `err.response.data.message` is undefined in Events.jsx line 127, masking all actual validation errors.
3. **H3 (CONFIRMED): HttpMessageNotReadableException caught by generic handler**: Jackson JSON parse errors (bad date/time formats, nulls for required fields) trigger the generic `@ExceptionHandler(Exception.class)` → returns 500 "An unexpected error occurred" — a 400 Bad Request user error masquerading as 500 server error.
4. **H4 (NOT CONFIRMED): `isActive`/`isPublic` nullability**: NOT the root cause — EventService.create() explicitly handles nulls via `eventRequest.getIsActive() != null ? … : true`.
5. **H5 (UNVERIFIED but LOW likelihood): JWT ROLE\_ prefix mismatch**: Possible but GETs on `/admin/events` would also fail; user would see 403 redirect to login via interceptor, not "doesn't work".

## Evidence Log

| #   | Timestamp | Source | Event                                                                                                                                  | Status                    |
| --- | --------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1   | pre-fix   | Static | EventController missing `@Valid` on 4× POST/PUT endpoints                                                                              | Confirmed code smell      |
| 2   | pre-fix   | Static | GlobalExceptionHandler#handleValidationExceptions returns `Map<String,String>` (no `message` field) vs frontend reading `data.message` | Confirmed format mismatch |
| 3   | pre-fix   | Static | GlobalExceptionHandler lacks handler for `HttpMessageNotReadableException` — Jackson parse errors go to generic 500 handler            | Confirmed                 |
| 4   | pre-fix   | Static | Events.jsx L127 ignores `data.errors` Map, only reads `data.message` — field errors invisible to user                                  | Confirmed                 |
| 5   | post-fix  | Maven  | `mvn compile -DskipTests` exit=0 — backend compiles clean                                                                              | Verified                  |
| 6   | post-fix  | VSCode | GetDiagnostics on all 3 changed files: 0 errors                                                                                        | Verified                  |

## Fixes Applied (4 files changed)

1. **EventController.java** — Added `import jakarta.validation.Valid` + `@Valid` annotation on `@RequestBody Event event` for 4 endpoints:
   - POST `/api/librarian/events` (L72)
   - POST `/api/admin/events` (L79)
   - PUT `/api/librarian/events/{id}` (L86)
   - PUT `/api/admin/events/{id}` (L93)
2. **GlobalExceptionHandler.java** — Three changes:
   - `handleValidationExceptions`: Now returns `MessageResponse` (with `message` + `errors` fields) instead of raw `Map<String,String>`
   - NEW `handleHttpMessageNotReadable`: Catches `HttpMessageNotReadableException` (Jackson parse failures), extracts field name + expected format, returns human-friendly 400 (e.g., "Invalid value 'bad-date' for field 'eventDate' (expected YYYY-MM-DD date format).")
   - Added imports: `JsonMappingException`, `InvalidFormatException`, `HttpMessageNotReadableException`, `Collectors`
3. **MessageResponse.java** — Added `private Map<String, String> errors;` field so validation field-level errors travel alongside `message`
4. **Events.jsx (admin-frontend)** — Enhanced `handleSubmit` catch block (L124-144):
   - Reads `data.errors` map and joins field-level errors into displayable string
   - Fallback: if response body IS a raw Map (no wrapper), extracts string-valued entries as field errors
   - Preserves backwards-compatible `data.message` extraction first

## Verdict

- **Confirmed Hypotheses**: H1 (partial), H2 (full), H3 (full)
- **Root Cause (1-sentence)**: Event creation API lacked `@Valid` bean validation, had no dedicated Jackson deserialization error handler, the validation handler returned unreadable Map format (missing `message` key), and the frontend only read `data.message` — together making every failure mode display "Save failed." without disclosing what field was wrong.
- **Fix Commit Scope**: 4 files (EventController, GlobalExceptionHandler, MessageResponse, admin-frontend/Events.jsx) — ~80 lines delta. No behavior changes for non-error happy paths; only error reporting + validation enforcement improved.
