# Backend API Routes

This document provides an overview of all available API routes in the backend application.

## Authentication & User Management

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| api_login_check | ANY | /api/login_check | Check user login credentials |
| api_logout | POST | /api/logout | Logout the current user |
| api_me | GET | /api/me | Get current authenticated user information |
| api_register | POST | /api/register | Register a new user |
| app_register | POST | /api/register | Register a new user (duplicate) |
| api_change_password | POST | /api/change-password | Change user password |
| verify_email | GET | /api/verify-email/{token} | Verify user email with token |
| verification_success | GET | /verification-success | Email verification success page |
| verification_error | GET | /verification-error | Email verification error page |
| resend_verification_email | POST | /api/resend-verification-email | Resend verification email |

### Password Reset

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| api_reset_password_request | POST | /api/reset-password/request | Request password reset |
| api_reset_password_preflight_request | OPTIONS | /api/reset-password/request | CORS preflight for password reset request |
| api_reset_password_preflight_verify | OPTIONS | /api/reset-password/verify/{token} | CORS preflight for password reset verification |
| api_reset_password_preflight_reset | OPTIONS | /api/reset-password/reset/{token} | CORS preflight for password reset |
| api_reset_password_verify | GET | /api/reset-password/verify/{token} | Verify password reset token |
| api_reset_password_reset | POST | /api/reset-password/reset/{token} | Reset password with token |

### JWT Token Management

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| api_refresh_token_refresh_token | POST | /api/refresh | Refresh JWT token |
| api_refresh_token_revoke_token | POST | /api/revoke | Revoke JWT token |
| api_refresh_token_devices | GET | /api/refresh-token/devices | Get all devices with active refresh tokens |
| api_refresh_token_remove_device | DELETE | /api/refresh-token/remove/{tokenId} | Remove a specific device/token |
| api_refresh_token_clean | POST | /api/refresh-token/clean | Clean expired refresh tokens |
| api_refresh_token_clean_all | POST | /api/refresh-token/clean-all | Clean all refresh tokens |
| api_token_refresh | POST | /api/token/refresh | Refresh JWT token (alternative) |
| api_token_revoke | POST | /api/token/revoke | Revoke JWT token (alternative) |
| api_token_revoke_all | POST | /api/token/revoke-all | Revoke all tokens |
| api_token_devices | GET | /api/token/devices | Get all devices with active tokens |

## User Management

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| api_get_all_users | GET | /api/users | Get all users |
| api_update_user | PUT | /api/users/{id} | Update a specific user |
| api_delete_user | DELETE | /api/users/{id} | Delete a specific user |
| api_users_list | GET | /api/users/list | Get users list (possibly formatted differently) |
| user_autocomplete | GET | /api/user-autocomplete | Autocomplete user search |
| user_autocomplete_debug | GET | /api/user-autocomplete-debug | Debug autocomplete user search |

### User Roles

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| api_users_by_role | GET | /api/user-roles/users/{roleName} | Get users by role |
| api_change_user_role | POST | /api/user-roles/change-role | Change a user's role |
| api_all_roles | GET | /api/user-roles/roles | Get all available roles |

## Profile Management

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| api_profil_user_data | GET | /api/profile/user-data | Get user profile data |
| api_profil_diplomas | GET | /api/profile/diplomas | Get user diplomas |
| api_profil_addresses | GET | /api/profile/addresses | Get user addresses |
| api_profil_stats | GET | /api/profile/stats | Get user profile statistics |
| api_profil_consolidated | GET | /api/profile/consolidated | Get consolidated profile information |
| api_profil_public | GET | /api/profile/public/{id} | Get public profile for a specific user |
| api_profil_me | GET | /api/profile/me | Get current user's profile |
| api_profil_address_update | PUT | /api/profile/address | Update user address |
| api_user_profile | GET | /api/profile | Get user profile |
| api_user_profile_update | PUT | /api/profile | Update user profile |

### Profile Picture

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| api_user_profile_picture_upload | POST | /api/profile/picture | Upload profile picture |
| api_user_profile_picture_delete | DELETE | /api/profile/picture | Delete profile picture |
| api_user_profile_picture_get | GET | /api/profile/picture | Get profile picture |

### User Diplomas

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| api_user_diplomas_available | GET | /api/user-diplomas/available | Get available diplomas |
| api_user_diplomas_list | GET | /api/user-diplomas | List user diplomas |
| api_user_diplomas_add | POST | /api/user-diplomas | Add a diploma to user |
| api_user_diplomas_update | PUT | /api/user-diplomas/{id} | Update a specific diploma |
| api_user_diplomas_delete | DELETE | /api/user-diplomas/{id} | Delete a specific diploma |

## Student Management

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| app_domains_student_studentprofile_getmyprofile | GET | /api/student/profile | Get student profile |
| app_domains_student_studentprofile_updatejobseekingstatus | PATCH/PUT | /api/student/profile/job-seeking-status | Update job seeking status |
| app_domains_student_studentprofile_updateportfoliourl | PATCH/PUT | /api/student/profile/portfolio-url | Update portfolio URL |
| app_domains_student_studentprofile_getstudentsseekinginternship | GET | /api/student/profile/seeking-internship | Get students seeking internship |
| app_domains_student_studentprofile_getstudentsseekingapprenticeship | GET | /api/student/profile/seeking-apprenticeship | Get students seeking apprenticeship |
| app_domains_student_studentprofile_getstudentsseekingjobs | GET | /api/student/profile/seeking-jobs | Get students seeking jobs |
| app_domains_student_studentprofile_toggleinternshipseeking | PATCH/PUT | /api/student/profile/toggle-internship-seeking | Toggle internship seeking status |
| app_domains_student_studentprofile_toggleapprenticeshipseeking | PATCH/PUT | /api/student/profile/toggle-apprenticeship-seeking | Toggle apprenticeship seeking status |

## Message System

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| app_message_list | GET | /api/messages | List all messages |
| app_message_recent | GET | /api/messages/recent | Get recent messages |
| app_message_privatemessages | GET | /api/messages/private/{userId} | Get private messages with a specific user |
| app_message_create | POST | /api/messages | Create a new message |
| app_message_createprivate | POST | /api/messages/private | Create a private message |
| app_message_markasread | POST | /api/messages/{id}/read | Mark a message as read |
| app_admin_messagecleanup_cleanupmessages | POST | /api/admin/messages/cleanup | Admin cleanup of messages |

## Ticket System

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| app_ticket_gettickets | GET | /api/tickets | Get all tickets |
| app_ticket_getticketstatuses | GET | /api/tickets/status | Get all ticket statuses |
| app_ticket_getrawtickets | GET | /api/tickets/raw-data | Get raw ticket data |
| app_ticket_getticket | GET | /api/tickets/{id} | Get a specific ticket |
| app_ticket_createticket | POST | /api/tickets | Create a new ticket |
| app_ticket_updateticket | PUT | /api/tickets/{id} | Update a specific ticket |
| assign_ticket | PUT | /api/tickets/{id}/assign | Assign a ticket |
| api_bulk_update_ticket_status | PUT | /api/tickets/actions/bulk-update-status | Bulk update ticket status |
| app_ticket_custombulkupdate | POST | /api/tickets/custom-bulk-update | Custom bulk update for tickets |
| app_ticket_debugtoken | GET | /api/tickets/tools/debug-token | Debug token for ticket system |

### Ticket Comments

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| app_ticketcomment_getticketcomments | GET | /api/tickets/{id}/comments | Get comments for a specific ticket |
| app_ticketcomment_addcomment | POST | /api/tickets/{id}/comments | Add a comment to a specific ticket |

### Ticket Services

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| app_ticketservice_getallservices | GET | /api/ticket-services | Get all ticket services |
| app_ticketservice_getservice | GET | /api/ticket-services/{id} | Get a specific ticket service |
| app_ticketservice_createservice | POST | /api/ticket-services | Create a new ticket service |
| app_ticketservice_updateservice | PUT | /api/ticket-services/{id} | Update a specific ticket service |
| app_ticketservice_deleteservice | DELETE | /api/ticket-services/{id} | Delete a specific ticket service |

## Document Management

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| app_documents_list | GET | /api/documents | List all documents |
| app_document_upload_cv | POST | /api/documents/upload/cv | Upload CV document |
| app_document_upload_cv_for_student | POST | /api/documents/upload/cv/{studentId} | Upload CV for a specific student |
| app_document_download | GET | /api/documents/{id}/download | Download a specific document |
| app_document_delete | DELETE | /api/documents/{id} | Delete a specific document |
| app_documents_by_type | GET | /api/documents/type/{type} | Get documents by type |

## Formation Management

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| api_formations_list | GET | /api/formations | List all formations |
| api_formations_create | POST | /api/formations | Create a new formation |
| api_formations_available_students | GET | /api/formations/available-students | Get available students for formations |
| api_formations_add_student | POST | /api/formations/{id}/students | Add a student to a formation |
| formation_list | GET | /formations | List formations (non-API route) |
| formation_add_students | GET/POST | /formation/{id}/add-students | Add students to a formation (non-API route) |
| formation_new | GET/POST | /formation/new | Create a new formation (non-API route) |

## Signature Management

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| app_signature_checktodaysignature | GET | /api/signatures/today | Check today's signature |
| app_signature_show | GET | /api/signatures/{id} | Show a specific signature |
| app_signature_list | GET | /api/signatures | List all signatures |
| app_signature_create | POST | /api/signatures | Create a new signature |
| app_signature_validate | POST | /api/signatures/{id}/validate | Validate a specific signature |

## Specialization Management

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| api_specialization_get | GET | /api/specialization/{id} | Get a specific specialization |
| api_specialization_list | GET | /api/specialization | List all specializations |
| api_specialization_by_domain | GET | /api/specialization/by-domain/{domainId} | Get specializations by domain |

## Scheduling

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| api_create_schedule_event | POST | /api/create-event | Create a schedule event |
| api_get_user_events | GET | /api/get-user-events | Get events for current user |

## Address API

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| api_address_search | GET | /api/address/search | Search for addresses |
| api_address_reverse | GET | /api/address/reverse | Reverse geocode an address |

## Testing & Debug Routes

| Route Name | Method | Path | Description |
|------------|--------|------|-------------|
| app_test_mail | GET | /api/test/mail | Test mail functionality |
| app_test_mail_direct | GET | /api/test/mail/direct | Test direct mail sending |
| app_test | GET | /api/test | General test endpoint |
| _preview_error | ANY | /_error/{code}.{_format} | Preview error pages |
| _wdt_stylesheet | ANY | /_wdt/styles | Web Debug Toolbar stylesheet |
| _wdt | ANY | /_wdt/{token} | Web Debug Toolbar |
| _profiler_home | ANY | /_profiler/ | Profiler home |
| _profiler_search | ANY | /_profiler/search | Profiler search |
| _profiler_search_bar | ANY | /_profiler/search_bar | Profiler search bar |
| _profiler_phpinfo | ANY | /_profiler/phpinfo | PHP info |
| _profiler_xdebug | ANY | /_profiler/xdebug | XDebug profiler |
| _profiler_font | ANY | /_profiler/font/{fontName}.woff2 | Profiler fonts |
| _profiler_search_results | ANY | /_profiler/{token}/search/results | Profiler search results |
| _profiler_open_file | ANY | /_profiler/open | Open profiler file |
| _profiler | ANY | /_profiler/{token} | Profiler details |
| _profiler_router | ANY | /_profiler/{token}/router | Profiler router |
| _profiler_exception | ANY | /_profiler/{token}/exception | Profiler exception |
| _profiler_exception_css | ANY | /_profiler/{token}/exception.css | Profiler exception CSS |

---

*This document was generated automatically and may be incomplete. Please refer to the controller code for detailed documentation of each endpoint.* 