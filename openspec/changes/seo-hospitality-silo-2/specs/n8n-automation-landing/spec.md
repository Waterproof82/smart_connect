# n8n Automation Landing Page Specification

## Purpose

The `/automatizacion-restaurantes-n8n` landing page explains how n8n workflow automation can streamline operations for restaurants and hospitality businesses.

## Requirements

### Requirement: Hero Section

The system **SHALL** display a hero section with:

- A headline using the `t.n8nHeroTitle` key from `LanguageContext`.
- A subheadline using the `t.n8nHeroSubtitle` key.
- A primary call-to-action button using the `t.n8nCTA` key.

#### Scenario: Hero Section Rendering

- GIVEN the landing page is loaded
- WHEN the user visits `/automatizacion-restaurantes-n8n`
- THEN the hero section is rendered with the correct SEO title (`t.seoTitle`) and description (`t.seoDescription`).

### Requirement: Testimonial Carousel

The system **SHALL** display testimonials from businesses using n8n automation.

#### Scenario: Testimonial Carousel Rendering

- GIVEN the landing page is loaded
- WHEN the user scrolls through the testimonial carousel
- THEN testimonials are displayed using the `t.testimonialN8n` key.

### Requirement: FAQ Accordion

The system **SHALL** include an FAQ accordion with:

- Questions and answers related to n8n automation.
- Keys like `t.faqN8nQuestion1`, `t.faqN8nAnswer1`, etc.

#### Scenario: FAQ Accordion Rendering

- GIVEN the landing page is loaded
- WHEN the user expands an FAQ item
- THEN the corresponding answer is displayed using the appropriate `t.faqN8nAnswerX` key.

### Requirement: Contact Section

The system **SHALL** include a contact section with:

- A heading using the `t.contactN8nTitle` key.
- A subtitle using the `t.contactN8nSubtitle` key.
- A contact form with fields for name, email, and message.

#### Scenario: Contact Form Submission

- GIVEN the user submits the contact form
- WHEN the form data is sent to the backend
- THEN a success message is displayed.
- AND the data is logged for follow-up.

---
