# Past Paper System Enhancement Summary

## Overview
Enhanced the past paper system to include all required fields for better categorization and search functionality for students.

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
  - `findDistinctIntakeBatches()` - Get distinct intake batches
- **Enhanced**: `filter()` method to accept new parameters (degreeLevel, faculty, intakeBatch)
- **Location**: `backend/src/main/java/com/sliit/library/repository/PastPaperRepository.java`

#### 4. Service (PastPaperService.java)
- **Enhanced**: `upload()` method to accept and save `degreeLevel` parameter
- **Enhanced**: `filter()` method to support multi-criteria filtering
- **Enhanced**: `getFilters()` method to return additional filter options
- **Enhanced**: `map()` method to include `degreeLevel` in response
- **Location**: `backend/src/main/java/com/sliit/library/service/PastPaperService.java`

#### 5. Controller (PastPaperController.java)
- **Enhanced**: `upload()` endpoint to accept `degreeLevel` parameter
- **Enhanced**: `filter()` endpoint to accept additional query parameters
- **Location**: `backend/src/main/java/com/sliit/library/controller/PastPaperController.java`

### Frontend Changes

#### 1. Past Papers Page (PastPapers.jsx)
- **Added**: New form field for Degree Level (Undergraduate/Postgraduate)
- **Enhanced**: Search filters to include:
  - Degree Level dropdown
  - Faculty dropdown  
  - Intake Batch dropdown
- **Updated**: Default intake batches to focus on January and June intakes
- **Enhanced**: Validation to require degree level
- **Enhanced**: Display to show degree level on paper cards
- **Location**: `frontend/src/pages/PastPapers.jsx`

#### 2. API Service (api.js)
- **Enhanced**: `pastPapersAPI.filter()` to accept additional parameters
- **Location**: `frontend/src/services/api.js`

## New Features

### For Students (Search Side)
Students can now filter past papers by:
- **Academic Year**: 1st Year, 2nd Year, 3rd Year, 4th Year
- **Semester**: 1, 2, 3, 4
- **Degree Level**: Undergraduate, Postgraduate
- **Faculty**: School of Computing, School of Engineering, School of Business, School of Humanities
- **Intake Batch**: 2024 January Intake, 2024 June Intake, etc.
- **Module Code**: Search by course code
- **Module Name**: Search by course name

### For Librarians (Upload Side)
Librarians can now upload past papers with:
- **Academic Year** (required)
- **Academic Semester** (required)
- **Semester** (required)
- **Intake Batch** (required)
- **Faculty** (required)
- **Degree Level** (required) - NEW
- **Department** (optional)
- **Course Code** (optional)
- **Course Name** (optional)
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
   - Fill in all required fields including new Degree Level field
   - Upload a PDF file
   - Verify successful upload

3. **Test Search/Filter Functionality**:
   - Login as student
   - Navigate to Past Papers section
   - Use new filters (Degree Level, Faculty, Intake Batch)
   - Verify filtering works correctly
   - View and download past papers

4. **Verify Display**:
   - Check that degree level appears on paper cards
   - Verify all metadata displays correctly

## Important Notes

- The database update is automatic due to Hibernate DDL auto-update
- Default values have been set for better UX (e.g., "Undergraduate" as default degree level)
- Intake batches now focus on January and June intakes as requested
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
2. Test the upload functionality with the new fields
3. Test the search/filter functionality
4. Verify the display of all new fields on the frontend
