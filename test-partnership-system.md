# Partnership System Test Plan

## Overview
This document outlines the testing steps to verify the new partnership invitation system works correctly and doesn't create any loops.

## Test Scenarios

### 1. Basic Partnership Flow
- [ ] User can navigate to Partnerships tab
- [ ] User can see "No Partnerships Yet" message when no partnerships exist
- [ ] User can click "Invite Partner" button
- [ ] User can enter partner's email address
- [ ] User can send invitation
- [ ] Invitation appears in "Pending Invitations" section
- [ ] Invitation shows correct status and expiry date

### 2. Invitation Response Flow
- [ ] Partner receives invitation email (if email system is configured)
- [ ] Partner can accept invitation via API
- [ ] Partnership is created when invitation is accepted
- [ ] Invitation status changes to "accepted"
- [ ] Both users can see the partnership in their list

### 3. Loop Prevention Tests
- [ ] User cannot invite themselves
- [ ] User cannot send duplicate invitations to the same email
- [ ] User cannot accept invitations not sent to them
- [ ] User cannot accept expired invitations
- [ ] User cannot accept already accepted/declined invitations

### 4. Partnership Management
- [ ] Users can see current partnerships
- [ ] Users can remove partnerships
- [ ] Partnership removal requires confirmation
- [ ] After partnership removal, users return to "no partnerships" state

### 5. Navigation Integration
- [ ] Partnerships tab appears in desktop navigation
- [ ] Partnerships tab appears in mobile navigation
- [ ] Dashboard shows "Set Up Partnership" button when no partnership exists
- [ ] Clicking "Set Up Partnership" navigates to Partnerships tab

## API Endpoints to Test

### POST /api/invite
- [ ] Sends invitation successfully
- [ ] Prevents self-invitation
- [ ] Prevents duplicate invitations
- [ ] Returns appropriate success/error messages

### POST /api/invite/respond
- [ ] Accepts invitation successfully
- [ ] Declines invitation successfully
- [ ] Prevents unauthorized access
- [ ] Handles expired invitations correctly

### GET /api/invite
- [ ] Returns user's partnerships
- [ ] Returns user's invitations (sent and received)
- [ ] Handles authentication correctly

### DELETE /api/partnerships
- [ ] Removes partnership successfully
- [ ] Prevents unauthorized removal
- [ ] Returns appropriate success/error messages

## Database Verification

### Tables to Check
- [ ] `partnerships` - stores active partnerships
- [ ] `partnership_invitations` - stores invitation history
- [ ] `users` - user information for partnerships

### Data Integrity
- [ ] Foreign key constraints work correctly
- [ ] RLS policies prevent unauthorized access
- [ ] Soft delete works for partnerships (status = 'removed')

## Error Handling

### Expected Errors
- [ ] 400: Invalid email format
- [ ] 400: Self-invitation attempt
- [ ] 400: Duplicate invitation
- [ ] 401: Unauthorized access
- [ ] 403: Forbidden action (wrong user)
- [ ] 404: Invitation not found
- [ ] 500: Internal server error

## Performance Considerations

### Database Queries
- [ ] Indexes exist for frequently queried columns
- [ ] Queries don't create N+1 problems
- [ ] RLS policies don't significantly impact performance

### API Response Times
- [ ] Invitation creation < 500ms
- [ ] Partnership listing < 200ms
- [ ] Invitation response < 300ms

## Security Tests

### Authentication
- [ ] All endpoints require valid authentication
- [ ] Users can only access their own data
- [ ] RLS policies enforce proper access control

### Input Validation
- [ ] Email addresses are properly validated
- [ ] SQL injection is prevented
- [ ] XSS attacks are prevented

## Integration Tests

### With Existing Features
- [ ] Partnership status affects expense creation
- [ ] Partnership status affects goal creation
- [ ] Partnership removal affects shared data access
- [ ] Approval system works with partnerships

## Manual Testing Steps

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Navigate to Partnerships tab**
   - Click on "Partnerships" in the navigation
   - Verify "No Partnerships Yet" message appears

3. **Send an invitation**
   - Click "Invite Partner"
   - Enter a test email address
   - Click "Send Invitation"
   - Verify invitation appears in pending list

4. **Test invitation response**
   - Use the API endpoint to accept/decline invitation
   - Verify partnership is created/removed accordingly

5. **Test partnership management**
   - Verify partnership appears in current partnerships list
   - Test partnership removal functionality

6. **Test navigation integration**
   - Verify dashboard button works
   - Verify all navigation tabs are accessible

## Success Criteria

- [ ] All test scenarios pass
- [ ] No infinite loops or recursive calls
- [ ] Database remains consistent
- [ ] API responses are fast and reliable
- [ ] User experience is smooth and intuitive
- [ ] Error handling is graceful and informative
