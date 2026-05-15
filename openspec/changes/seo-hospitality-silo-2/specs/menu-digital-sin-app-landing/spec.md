# Digital Menu without App Landing Page Specification

## Purpose

The `/menu-digital-sin-app` landing page explains how QR-based digital menus can be implemented without requiring an app.

## Requirements

### Requirement: Hero Section

The system **SHALL** display a hero section with:

- A headline using the `t.menuDigitalHeroTitle` key from `LanguageContext`.
- A subheadline using the `t.menuDigitalHeroSubtitle` key.
- A primary call-to-action button using the `t.menuDigitalCTA` key.

#### Scenario: Hero Section Rendering

- GIVEN the landing page is loaded
- WHEN the user visits `/menu-digital-sin-app`
- THEN the hero section is rendered with the correct SEO title (`t.seoTitle`) and description (`t.seoDescription`).

### Requirement: Testimonial Carousel

The system **SHALL** display testimonials from businesses using QR-based digital menus.

#### Scenario: Testimonial Carousel Rendering

- GIVEN the landing page is loaded
- WHEN the user scrolls through the testimonial carousel
- THEN testimonials are displayed using the `t.testimonialMenuDigital` key.

### Requirement: FAQ Accordion

The system **SHALL** include an FAQ accordion with:

- Questions and answers related to QR-based digital menus.
- Keys like `t.faqMenuDigitalQuestion1`, `t.faqMenuDigitalAnswer1`, etc.

#### Scenario: FAQ Accordion Rendering

- GIVEN the landing page is loaded
- WHEN the user expands an FAQ item
- THEN the corresponding answer is displayed using the appropriate `t.faqMenuDigitalAnswerX` key.

### Requirement: Contact Section

The system **SHALL** include a contact section with:

- A heading using the `t.contactMenuDigitalTitle` key.
- A subtitle using the `t.contactMenuDigitalSubtitle` key.
- A contact form with fields for name, email, and message.

#### Scenario: Contact Form Submission

- GIVEN the user submits the contact form
- WHEN the form data is sent to the backend
- THEN a success message is displayed.
- AND the data is logged for follow-up.

---
