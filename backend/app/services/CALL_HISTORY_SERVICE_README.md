# CallHistoryService Implementation

## Overview

The `CallHistoryService` is a service layer component responsible for persisting and retrieving call history records in the VoiceShield application. It provides a clean abstraction for database operations related to completed voice calls.

## Implementation Details

### Location
- **File**: `backend/app/services/call_history.py`
- **Module**: `app.services.call_history`

### Class: `CallHistoryService`

#### Constructor
```python
def __init__(self, db: Session):
    """Initialize with SQLAlchemy database session"""
```

#### Methods

##### 1. `create_call_record()`
```python
async def create_call_record(
    self,
    call_session: CallSession,
    final_risk_level: Optional[str] = None,
    final_risk_score: Optional[int] = None
) -> Optional[CallHistory]
```

**Purpose**: Create a database record from a completed call session.

**Parameters**:
- `call_session`: In-memory CallSession object with call metadata
- `final_risk_level`: Override risk level (LOW/MEDIUM/HIGH), optional
- `final_risk_score`: Override risk score (0-100), optional

**Returns**: 
- `CallHistory` object if successful
- `None` if creation failed

**Behavior**:
- Extracts data from CallSession object
- Maps call states to database-friendly statuses:
  - `connected`, `ended` → `completed`
  - `rejected` → `rejected`
  - `initiating`, `ringing`, `accepted`, `failed` → `failed`
- Uses risk data from call_session if not explicitly provided
- Handles database errors gracefully with rollback
- Logs success/failure with detailed information

**Error Handling**:
- `IntegrityError`: Foreign key violations (invalid user IDs)
- General exceptions: Any other database errors
- Both cases: Rolls back transaction, logs error, returns `None`

##### 2. `get_user_call_history()`
```python
async def get_user_call_history(
    self,
    user_id: int,
    limit: int = 50
) -> List[CallHistory]
```

**Purpose**: Retrieve call history for a user.

**Parameters**:
- `user_id`: Database ID of the user
- `limit`: Maximum number of records to return (default: 50)

**Returns**: 
- List of `CallHistory` objects
- Empty list if query fails or no records found

**Behavior**:
- Queries calls where user is either caller OR callee
- Orders by `started_at` descending (most recent first)
- Applies limit to control result size
- Returns empty list on any errors (gracefully handles failures)

## Requirements Satisfied

### Requirement 8.1: Call History Persistence
✅ Creates call history records when calls end with all metadata

### Requirement 8.2: Call Metadata Storage
✅ Stores:
- Caller ID and Callee ID
- Start time and end time
- Duration in seconds
- Final call state (completed/rejected/failed)

### Requirement 8.3: Risk Analysis Results
✅ Stores:
- Risk level (LOW/MEDIUM/HIGH)
- Risk score (0-100)
- Both fields are optional for rejected/failed calls

### Requirement 8.4: Foreign Key Associations
✅ Associates participants via foreign keys to `users` table with CASCADE delete

### Requirement 8.5: Failed/Rejected Calls
✅ Creates records for all call outcomes:
- Rejected calls: status='rejected', duration=0
- Failed calls: status='failed', duration=0
- Completed calls: status='completed', duration>0

## Usage Examples

### 1. Basic Usage in WebSocket Handler
```python
from app.services.call_history import CallHistoryService
from app.database import get_db

# In WebSocket signaling handler when call ends
async def handle_hangup(call_id: str, session_manager, db: Session):
    # Get the call session
    call_session = session_manager.get_session(call_id)
    
    # Create service instance
    call_history_service = CallHistoryService(db)
    
    # Save call history
    result = await call_history_service.create_call_record(call_session)
    
    if result:
        logger.info(f"Call history saved for {call_id}")
    else:
        logger.error(f"Failed to save call history for {call_id}")
```

### 2. API Endpoint for Call History
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user

router = APIRouter()

@router.get("/api/calls/history")
async def get_call_history(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get call history for the authenticated user"""
    service = CallHistoryService(db)
    history = await service.get_user_call_history(
        user_id=current_user.id,
        limit=50
    )
    return {"calls": [call.to_dict() for call in history]}
```

### 3. Creating Record with Explicit Risk Data
```python
# Override risk data (useful when risk updates stored separately)
await call_history_service.create_call_record(
    call_session=call_session,
    final_risk_level="HIGH",
    final_risk_score=85
)
```

### 4. Creating Record for Rejected Call
```python
# Call session for rejected call (no risk data)
call_session = CallSession(...)
call_session.set_state(CallState.REJECTED)

# This will create a record with:
# - status='rejected'
# - duration_seconds=0
# - risk_level=None, risk_score=None
await call_history_service.create_call_record(call_session)
```

## Testing

### Test Coverage
✅ **8 comprehensive unit tests** in `test_call_history.py`:

1. `test_create_call_record_completed` - Completed call with risk data
2. `test_create_call_record_rejected` - Rejected call, zero duration
3. `test_create_call_record_with_explicit_risk` - Override risk data
4. `test_create_call_record_invalid_user` - Error handling
5. `test_get_user_call_history` - Retrieve multiple records
6. `test_get_user_call_history_with_limit` - Pagination
7. `test_get_user_call_history_empty` - No records case
8. `test_create_call_record_failed_call` - Failed call handling

### Running Tests
```bash
cd backend
python -m pytest app/services/test_call_history.py -v
```

**Result**: ✅ All 8 tests passing

## Integration Points

### Database Models
- **CallHistory**: SQLAlchemy model in `app/models/call_history.py`
- **User**: Related via foreign keys (caller_id, callee_id)

### In-Memory Models
- **CallSession**: In-memory data class in `app/models/call_session.py`
- Provides `to_dict()` and `calculate_duration()` methods

### Services
- **CallSessionManager**: Manages active call sessions
- **ConnectionManager**: WebSocket connection tracking
- **AudioBuffer**: Transient audio storage (cleanup on call end)

### API Integration
Will be integrated in Task 4.4:
- `GET /api/calls/history` endpoint
- Returns CallHistoryResponse schemas
- Includes caller/callee user information

## Database Schema

```sql
CREATE TABLE call_history (
    id UUID PRIMARY KEY,                          -- Call ID from CallSession
    caller_id INTEGER REFERENCES users(id),       -- Foreign key to caller
    callee_id INTEGER REFERENCES users(id),       -- Foreign key to callee
    started_at TIMESTAMP NOT NULL,                -- Call initiation time
    ended_at TIMESTAMP,                           -- Call end time (nullable)
    duration_seconds INTEGER DEFAULT 0,           -- Call duration
    status VARCHAR(50) NOT NULL,                  -- completed/rejected/failed
    risk_level VARCHAR(20),                       -- LOW/MEDIUM/HIGH (nullable)
    risk_score INTEGER,                           -- 0-100 (nullable)
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_call_history_caller ON call_history(caller_id);
CREATE INDEX idx_call_history_callee ON call_history(callee_id);
CREATE INDEX idx_call_history_started ON call_history(started_at DESC);
CREATE INDEX idx_call_history_risk ON call_history(risk_level);
```

## Next Steps

### Task 4.2: Integrate call cleanup on hangup
- Update signaling message handler to call `create_call_record()` on hangup
- Extract final risk level/score from most recent risk update
- Clear audio buffer after saving history

### Task 4.3: Implement cleanup on unexpected disconnect
- Call `create_call_record()` for all active sessions when user disconnects
- Set status to 'failed' for unexpected disconnects
- Notify other participants

### Task 4.4: Create call history API endpoint
- Implement `GET /api/calls/history` endpoint
- Use `get_user_call_history()` method
- Return CallHistoryResponse schemas with user info

## Logging

The service provides comprehensive logging:
- **INFO**: Successful operations with key details
- **ERROR**: Database errors with exception traces
- **WARNING**: Integrity errors (foreign key violations)

Example log output:
```
INFO: Created call history record: call_id=abc-123, caller_id=1, callee_id=2, duration=120s, status=completed, risk_level=LOW
ERROR: IntegrityError creating call history for call_id=xyz-789: FOREIGN KEY constraint failed
```

## Performance Considerations

1. **Async Operations**: All methods are async for non-blocking I/O
2. **Indexed Queries**: Database indexes on caller_id, callee_id, started_at
3. **Bounded Results**: Default limit of 50 records prevents large result sets
4. **Graceful Degradation**: Returns empty list on errors instead of raising exceptions

## Security Considerations

1. **SQL Injection**: Uses SQLAlchemy ORM (parameterized queries)
2. **Input Validation**: CallHistory model has CHECK constraints
3. **Foreign Key Enforcement**: Ensures referential integrity
4. **Error Handling**: No sensitive data in error messages

## File Structure

```
backend/app/services/
├── call_history.py              # Service implementation
├── test_call_history.py         # Unit tests (8 tests)
├── call_history_example.py      # Usage examples
├── CALL_HISTORY_SERVICE_README.md  # This documentation
└── __init__.py                  # Export CallHistoryService
```

## Summary

✅ **Task 4.1 Complete**: CallHistoryService fully implemented with:
- Two async methods: `create_call_record()` and `get_user_call_history()`
- Comprehensive error handling with rollback
- 8 passing unit tests
- Complete documentation and examples
- Ready for integration in WebSocket handlers and API endpoints

**Requirements Coverage**: 8.1, 8.2, 8.3, 8.4, 8.5 ✅
