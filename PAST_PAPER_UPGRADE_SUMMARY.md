# Past Paper System Enhancement Summary

## Overview
Enhanced the past paper system to include all required fields for better categorization and search functionality for students. **Updated with proper field ordering and search functionality.**

## Changes Made

### Backend Changes

#### 1. Entity Model (PastPaper.java)
- **Added**: `degreeLevel` field (String, max 50 chars) to store Undergraduate/Postgraduate information
- **Location**: `backend/src/main/java/com/sliit/library/entity/PastPaper.java`

#### 2. DTO (PastPaperResponse.java)
- **Added**: `degreeLevel` field to API response
- **Location**: `backend/src/main/java/com/sliit/library/dto/PastPaperResponse.java`

#### 3. Repository (PastPaperRepository.java)
- **Added**: New query methods for filter enhancement:
  - `findDistinctDegreeLevels()` - Get distinct degree levels
  - `findDistinctFaculties()` - Get distinct faculties  
- **Enhanced**: `filter()` method to accept new parameters (degreeLevel, faculty, intakeBatch, searchModule)
- **Added**: Search functionality for intake, module code and name using LIKE queries
- **Location**: `backend/src/main/java/com/sliit/library/repository/PastPaperRepository.java`

#### 4. Service (PastPaperService.java)
- **Enhanced**: `upload()` method to accept and save `degreeLevel` parameter
- **Enhanced**: `filter()` method to support multi-criteria filtering including intake and module search
- **Enhanced**: `getFilters()` method to return filter options (removed intakeBatches since it's now a text search)
- **Enhanced**: `map()` method to include `degreeLevel` in response
- **Location**: `backend/src/main/java/com/sliit/library/service/PastPaperService.java`

#### 5. Controller (PastPaperController.java)
- **Enhanced**: `upload()` endpoint to accept `degreeLevel` parameter
- **Enhanced**: `filter()` endpoint to accept additional query parameters including searchModule
- **Location**: `backend/src/main/java/com/sliit/library/controller/PastPaperController.java`

### Frontend Changes

#### 1. Past Papers Page (PastPapers.jsx)
- **Added**: New form field for Degree Level (Undergraduate/Postgraduate)
- **Reorganized**: Search filters in correct order:
  1. Faculty (dropdown)
  2. Degree Level (dropdown)
  3. Academic Year (dropdown)
  4. Semester (dropdown)
  5. Intake (search bar) - changed from dropdown
  6. Module Code/Name (search bar)
- **Reorganized**: Upload form fields in the same order as search
- **Changed**: Intake field from dropdown to text input for flexible entry
- **Removed**: INTAKE_BATCHES constant since intake is now free text
- **Enhanced**: Validation to require degree level
- **Enhanced**: Display to show degree level on paper cards
- **Location**: `frontend/src/pages/PastPapers.jsx`

#### 2. API Service (api.js)
- **Enhanced**: `pastPapersAPI.filter()` to accept additional parameters including searchModule
- **Location**: `frontend/src/services/api.js`

## New Features

### For Students (Search Side)
Students can now filter past papers by:
- **Faculty** (1st filter): Faculty of Computing, Faculty of Business, Faculty of Engineering, Faculty of Humanities and Science, Faculty of Architecture, Faculty of Law
- **Degree Level** (2nd filter): Undergraduate, Postgraduate
- **Academic Year** (3rd filter): 1st Year, 2nd Year, 3rd Year, 4th Year
- **Semester** (4th filter): 1, 2 (only 2 semesters per year)
- **Intake** (5th filter - search bar): Free text search (e.g., "2024 June", "2025 January")
- **Module Code/Name** (6th filter - search bar): Free text search for course code or name

### For Librarians (Upload Side)
Librarians can now upload past papers with fields in the same order:
- **Faculty** (required)
- **Degree Level** (required)
- **Academic Year** (required)
- **Academic Semester** (required)
- **Semester** (required)
- **Intake** (required) - Text input for entering intake (e.g., "2024 June", "2025 January")
- **Department** (optional)
- **Module Code** (optional)
- **Module Name** (optional)
- **Exam Type** (optional)
- **Description** (optional)

## Database Schema Update
The database will be automatically updated when the backend restarts due to:
- `spring.jpa.hibernate.ddl-auto=update` in application.properties
- New `degree_level` column will be added to `past_papers` table

## Testing Steps

1. **Restart Backend Server**: 
   - Navigate to backend directory
   - Run `mvn spring-boot:run`
   - Verify that the new column is created in the database

2. **Test Upload Functionality**:
   - Login as librarian/admin
   - Navigate to Past Papers section
   - Click "Upload" tab
   - Fill in all required fields in the correct order (Faculty → Degree Level → Academic Year → Semester → Intake)
   - Add module code and/or name
   - Upload a PDF file
   - Verify successful upload

3. **Test Search/Filter Functionality**:
   - Login as student
   - Navigate to Past Papers section
   - Use filters in the correct order (Faculty → Degree Level → Academic Year → Semester → Intake)
   - Use the search bar for module code/name
   - Verify filtering works correctly
   - View and download past papers

4. **Verify Display**:
   - Check that degree level appears on paper cards
   - Verify all metadata displays correctly

## Important Notes

- The database update is automatic due to Hibernate DDL auto-update
- Field ordering has been standardized across search and upload forms
- Search bar allows free text search for module code/name when dropdown selections are not sufficient
- Intake is now a search bar (text input) instead of dropdown for flexible entry
- Backend uses LIKE query for intake search to support partial matches
- All fields are properly validated on both frontend and backend
- The filtering system supports multiple criteria simultaneously

## Files Modified

### Backend
- `backend/src/main/java/com/sliit/library/entity/PastPaper.java`
- `backend/src/main/java/com/sliit/library/dto/PastPaperResponse.java`
- `backend/src/main/java/com/sliit/library/repository/PastPaperRepository.java`
- `backend/src/main/java/com/sliit/library/service/PastPaperService.java`
- `backend/src/main/java/com/sliit/library/controller/PastPaperController.java`

### Frontend
- `frontend/src/pages/PastPapers.jsx`
- `frontend/src/services/api.js`

## Next Steps

1. Restart the backend server to apply database changes
2. Test the upload functionality with the new field ordering
3. Test the search/filter functionality with the new search bar
4. Verify the display of all new fields on the frontend
