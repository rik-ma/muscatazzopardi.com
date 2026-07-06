---
page: site
title: Global text — newsletter, footer, contact form, 404
# EDIT-THEN-SYNC. These strings appear across the whole site (not on one page),
# so they don't live in a single page file. Edit any value here, tell Claude,
# and it gets synced into the right component. Keep the "Label:" prefixes — they
# tell Claude which string is which. Change only the text after the colon.
---

## Newsletter (now in the footer of every page)

Heading: New essays by email.
Email placeholder: you@example.com
Button: Subscribe
Success message: Done. You'll hear from me when there's something worth reading.
Not-yet-wired message: The signup isn't wired up yet. Try again in a day or two.
Error message: Something went wrong. Try again in a moment.

## Footer (every page)

Byline: Richard Muscat Azzopardi
Link 1 label: Contact
Link 2 label: LinkedIn
Mark: R/M/A

## Contact form (on the Contact page)

Name label: Name
Email label: Email
Message label: Message
Button: Send
Sending message: Sending…
Success message: Thanks. That's on its way to me. I'll reply soon.
Missing-fields message: Please fill in your name, email, and message.
Not-yet-wired message: The contact form isn't wired up yet. Please reach out on LinkedIn instead.
Error message: Something went wrong. Please try again or reach out on LinkedIn.

## 404 page (shown for a broken link)

Heading: Nothing here.
Body: The page you were after has moved, or never existed. Worth double-checking the link.
Back link: Home

## Notes

- The six nav words (Home, About, Writing, Playbooks, Now, Contact) and the
  LIGHT/DARK toggle are structural — renaming them changes routing, so ask Claude
  rather than editing them here.
- Each page's browser-tab title and its search/social description live in that
  page's file under src/pages/. Tell Claude if you want any of those reworded.
