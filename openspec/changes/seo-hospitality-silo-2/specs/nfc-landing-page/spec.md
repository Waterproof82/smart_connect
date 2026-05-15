# NFC Tap-to-Review Landing Page Specification

## Purpose

The `/tarjetas-nfc-google-reviews` landing page provides information about NFC Tap-to-Review technology, its benefits, and how it can be integrated into hospitality businesses.

## Requirements

### Requirement: Hero Section

The system **SHALL** display a prominent hero section with:

- A headline using the `t.nfcHeroTitle` key from `LanguageContext`.
- A subheadline using the `t.nfcHeroSubtitle` key.
- A primary call-to-action button using the `t.nfcCTA` key.
- A secondary call-to-action button linking to the contact form.

#### Scenario: Hero Section Rendering

- GIVEN the landing page is loaded
- WHEN the user visits `/tarjetas-nfc-google-reviews`
- THEN the hero section is rendered with the correct SEO title (`t.seoTitle`) and description (`t.seoDescription`).
- AND the primary CTA button is labeled with `t.nfcCTA`.

### Requirement: Testimonial Carousel

The system **SHALL** display a testimonial carousel with:

- Testimonials from hospitality businesses using NFC Tap-to-Review.
- A `t.testimonialNFC` key for testimonial content.

#### Scenario: Testimonial Carousel Rendering

- GIVEN the landing page is loaded
- WHEN the user scrolls through the testimonial carousel
- THEN testimonials are displayed using the `t.testimonialNFC` key.
- AND the carousel is responsive and accessible.

### Requirement: FAQ Accordion

The system **SHALL** include an FAQ accordion with:

- Questions and answers related to NFC Tap-to-Review.
- Keys like `t.faqNFCQuestion1`, `t.faqNFCAnswer1`, etc.

#### Scenario: FAQ Accordion Rendering

- GIVEN the landing page is loaded
- WHEN the user expands an FAQ item
- THEN the corresponding answer is displayed using the appropriate `t.faqNFCAnswerX` key.

### Requirement: Contact Section

The system **SHALL** include a contact section with:

- A heading using the `t.contactNFCTitle` key.
- A subtitle using the `t.contactNFCSubtitle` key.
- A contact form with fields for name, email, and message.

#### Scenario: Contact Form Submission

- GIVEN the user submits the contact form
- WHEN the form data is sent to the backend
- THEN a success message is displayed.
- AND the data is logged for follow-up.

---
