# ?? WebRTC Calling - Complete Test Checklist

## ? **Test 1: Successful Call Flow**
- [ ] Sai logs in ? sees "Ready for calls" (green)
- [ ] Raya logs in ? sees "Ready for calls" (green)
- [ ] Sai clicks "Call" on Raya ? sees "Calling..."
- [ ] Raya sees incoming call modal with Sai's name
- [ ] Raya clicks "Accept" ? microphone permission requested
- [ ] Both navigate to ActiveCallPage
- [ ] Both see caller name/avatar
- [ ] Timer is counting up (00:00, 00:01, 00:02...)
- [ ] Waveform animating
- [ ] Audio works - both can hear each other

**Status:** ____

---

## ? **Test 2: Mute Functionality**
- [ ] During call, click mute button
- [ ] Button turns yellow/orange
- [ ] Microphone icon shows as muted
- [ ] Other person can't hear you
- [ ] Waveform stops animating
- [ ] Click mute again ? unmutes
- [ ] Button returns to gray
- [ ] Other person can hear you again
- [ ] Waveform starts animating

**Status:** ____

---

## ? **Test 3: End Call (Initiator)**
- [ ] Sai is in call with Raya
- [ ] Sai clicks red "End Call" button
- [ ] Sai returns to Dashboard/Contacts
- [ ] Raya also disconnects immediately
- [ ] Raya returns to Dashboard/Contacts
- [ ] No errors in console

**Status:** ____

---

## ? **Test 4: End Call (Receiver)**
- [ ] Raya is in call with Sai
- [ ] Raya clicks red "End Call" button
- [ ] Raya returns to Dashboard/Contacts
- [ ] Sai also disconnects immediately
- [ ] Sai returns to Dashboard/Contacts
- [ ] No errors in console

**Status:** ____

---

## ? **Test 5: Call Rejection**
- [ ] Sai calls Raya
- [ ] Raya sees incoming call modal
- [ ] Raya clicks "Decline" button
- [ ] Raya stays on Contacts page
- [ ] Sai sees alert: "Call rejected"
- [ ] Sai returns to idle state
- [ ] No errors in console

**Status:** ____

---

## ? **Test 6: Call to Offline User**
- [ ] Logout Raya (or close her browser tab)
- [ ] Sai tries to call Raya
- [ ] Sai sees alert: "Call failed: Target user is not online"
- [ ] Sai returns to idle state
- [ ] No crash or hanging state

**Status:** ____

---

## ? **Test 7: Browser Refresh During Call**
- [ ] Start a call between Sai and Raya
- [ ] Sai refreshes browser (F5)
- [ ] Sai's call should end
- [ ] Raya should see disconnect/hangup
- [ ] No infinite loops or errors

**Status:** ____

---

## ? **Test 8: Network Simulation**
- [ ] Start call
- [ ] Disable WiFi on one computer for 5 seconds
- [ ] Re-enable WiFi
- [ ] Call should auto-reconnect OR show error
- [ ] No hanging or frozen state

**Status:** ____

---

## ? **Test 9: Multiple Call Attempts**
- [ ] Sai calls Raya (call in progress)
- [ ] Raya tries to call someone else while in call
- [ ] Should show error: "Already in a call"
- [ ] OR block the call button while in call

**Status:** ____

---

## ? **Test 10: Console Error Check**
- [ ] Open console (F12) on both tabs
- [ ] Make a complete call (initiate ? accept ? talk ? end)
- [ ] Check for RED errors
- [ ] Acceptable: Warnings (yellow)
- [ ] Not acceptable: Errors (red), crashes

**Errors Found:** ____

---

## ?? **Known Issues to Fix**
- [ ] Duplicate key warning: "Encountered two children with same key '4'"
- [ ] Caller name not showing correctly on ActiveCallPage
- [ ] Speaker button does nothing (placeholder)

---

## ?? **Test Summary**

Total Tests: 10
Passed: ___
Failed: ___
Blocked: ___

**Overall Status:** ____

**Next Steps:** ____

