# Countdown Timer Feature

## Overview
A countdown timer feature has been added to your advertorial articles. This creates urgency and encourages visitors to take action before time runs out.

## Features

### 1. **Persistent Timer**
- The countdown timer persists across page reloads using localStorage
- Each visitor gets their own countdown that continues even if they leave and return
- When the timer reaches zero, it automatically resets

### 2. **Customizable Settings**
- **Enable/Disable**: Toggle the countdown timer on or off for each article
- **Duration**: Set the countdown duration in minutes (1-120 minutes, default: 20 minutes)

### 3. **Visual Design**
- Eye-catching red gradient design with pulsing animation
- Positioned in the top-right corner of the urgency box
- Displays time in MM:SS format (e.g., "20:00")
- Responsive design that works on mobile and desktop

## How to Use

### For Admins

#### Creating a New Article:
1. Go to **Admin Dashboard** → **Create New Article**
2. Scroll to the **"Countdown Timer"** section (after Urgency Box)
3. Check **"Enable Countdown Timer"** to activate it
4. Set the **Timer Duration** in minutes (default: 20)
5. Save the article

#### Editing an Existing Article:
1. Go to **Admin Dashboard** → Click **Edit** on any article
2. Scroll to the **"Countdown Timer"** section
3. Toggle the countdown timer on/off
4. Adjust the duration as needed
5. Save changes

### For Visitors
- When enabled, the countdown timer appears in the urgency box
- The timer counts down in real-time
- The countdown persists even if they refresh the page or return later
- When it reaches 00:00, it automatically resets to the configured duration

## Technical Details

### Database
- New field: `countdown_timer` (JSONB)
- Structure: `{ enabled: boolean, minutes: number }`
- Default: `{ enabled: false, minutes: 20 }`

### Files Modified
1. `/lib/db.js` - Database schema and functions
2. `/components/CountdownTimer.js` - Timer component (new)
3. `/app/article/[slug]/page.js` - Article display page
4. `/app/admin/edit/[slug]/page.js` - Edit article form
5. `/app/admin/new/page.js` - New article form

### Component Location
The countdown timer appears in the **urgency box** section of the article, positioned absolutely in the top-right corner.

## Best Practices

1. **Use Sparingly**: Enable the countdown timer only on high-converting articles
2. **Appropriate Duration**: 
   - 10-20 minutes for quick decisions
   - 30-60 minutes for considered purchases
3. **Match Your Message**: Ensure the urgency box text aligns with the countdown timer
4. **Test Different Durations**: Experiment to find what works best for your audience

## Example Usage

**Urgency Box Title**: "Don't Wait Until It's Too Late!"
**Urgency Box Text**: "Protect your family now. Limited stock available—order your kit today!"
**Countdown Timer**: Enabled, 20 minutes

This creates a sense of urgency that encourages immediate action.
