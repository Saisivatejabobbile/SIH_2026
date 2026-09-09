# WebRTC Calling - Testing Checklist

## Setup
1. ? Backend running on http://localhost:8000
2. ? Frontend running on http://localhost:5173
3. ? Two browser tabs/windows (one for Sai, one for Raya)

## Test 1: Login and WebSocket Connection
**Sai's Tab:**
- [ ] Navigate to http://localhost:5173
- [ ] Login with sai@gmail.com / password123
- [ ] Check browser console for:
  - `Creating NEW WebSocket connection`
  - `WebSocket CONNECTED`
- [ ] Check backend terminal for:
  - `WebSocket connection attempt to /ws/signaling`
  - `User 4 (Sai ...) authenticated for WebSocket`

**Raya's Tab (Incognito/Private):**
- [ ] Navigate to http://localhost:5173
- [ ] Login with raya123@gmail.com / password123
- [ ] Check browser console for WebSocket CONNECTED
- [ ] Check backend terminal for User 2 authenticated

## Test 2: Outgoing Call (Sai ? Raya)
**Sai's Tab:**
- [ ] Go to Contacts page
- [ ] Click "Call" button on Raya's contact
- [ ] Browser console should show:
  - `[Call] Initiating call to Raya (ID: 2) with call_id: call_...`
  - `Sent: call_initiate`
- [ ] Backend terminal should show:
  - Blue message: `RAW MESSAGE RECEIVED FROM USER 4: {"type":"call_initiate"...}`
  - `Routing message from user 4: call_initiate`
  - `Call initiated: Sai ? Raya (ID: call_...)`

**Raya's Tab:**
- [ ] Incoming call modal should appear
- [ ] Shows "Sai" as caller name
- [ ] Browser console shows: `[Call] Incoming call from: Sai`

## Test 3: Accept Call
**Raya's Tab:**
- [ ] Click "Accept" button
- [ ] Browser asks for microphone permission ? Allow
- [ ] Console shows:
  - `[Call] Accepting call`
  - `[WebRTC] Sending signal to caller`

**Sai's Tab:**
- [ ] Console shows:
  - `[Call] Call accepted, creating peer as INITIATOR`
  - `[WebRTC] Sending signal to callee`
  - `[WebRTC] Got remote stream!`
- [ ] Call timer starts counting

**Both Tabs:**
- [ ] Call status shows "Call Active"
- [ ] Timer is running
- [ ] Audio should be working (test by speaking)

## Test 4: Mute/Unmute
- [ ] Click mute button
- [ ] Icon changes to muted state
- [ ] Other person can't hear you
- [ ] Click again to unmute
- [ ] Audio resumes

## Test 5: End Call
**Either Tab:**
- [ ] Click "End Call" button
- [ ] Console shows: `[Call] Ending call`
- [ ] Backend shows: `Call ... ended by user ...`
- [ ] Other tab receives hangup message
- [ ] Both tabs return to idle state

## Test 6: Reject Call
**Repeat Test 2, but:**
- [ ] Raya clicks "Reject" instead of "Accept"
- [ ] Sai sees "Call rejected" alert
- [ ] Both return to idle state

## Test 7: Call Offline User
- [ ] Logout Raya (or close her tab)
- [ ] Sai tries to call Raya
- [ ] Should see "Call failed: Target user is not online"

## Expected Backend Logs (Complete Call Flow)
```
WebSocket connection attempt to /ws/signaling
User 4 (Sai) authenticated for WebSocket
WebSocket connection attempt to /ws/signaling
User 2 (Raya) authenticated for WebSocket
RAW MESSAGE RECEIVED FROM USER 4: {"type":"call_initiate","call_id":"call_...","callee_id":2}
PARSED MESSAGE: {'type': 'call_initiate', 'call_id': '...', 'callee_id': 2}
Routing message from user 4: call_initiate
Call initiated: Sai ? Raya (ID: call_...)
RAW MESSAGE RECEIVED FROM USER 2: {"type":"call_accept","call_id":"call_..."}
Routing message from user 2: call_accept
Call call_... accepted by user 2
[Multiple webrtc_signal messages...]
RAW MESSAGE RECEIVED FROM USER 4: {"type":"hangup","call_id":"call_..."}
Call call_... ended by user 4
```

## Troubleshooting
- **No WebSocket connection:** Check token in localStorage
- **No messages in backend:** Frontend not sending, check browser console errors
- **Call failed immediately:** Check backend logs for reason
- **No audio:** Check microphone permissions in browser
- **Peer connection fails:** Check ICE candidate exchange in console

