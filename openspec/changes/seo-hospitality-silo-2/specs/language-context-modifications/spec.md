# LanguageContext Modifications Specification

## MODIFIED Requirements

### Requirement: Add New SEO Keys for Landing Pages

The system **SHALL** add 12 new SEO keys to the `LanguageContext` for the 6 new landing pages. These keys will be used across both Spanish (`es`) and English (`en`) locales.

#### Scenario: Add Keys for NFC Landing Page

- GIVEN the `LanguageContext` is initialized
- WHEN the `t.seoTitle` and `t.seoDescription` keys are added for `/tarjetas-nfc-google-reviews`
- THEN the keys are available in both Spanish (`es`) and English (`en`) locales.
- AND the keys are used in the `<Helmet>` component.

#### Scenario: Add Keys for n8n Landing Page

- GIVEN the `LanguageContext` is initialized
- WHEN the `t.seoTitle` and `t.seoDescription` keys are added for `/automatizacion-restaurantes-n8n`
- THEN the keys are available in both Spanish (`es`) and English (`en`) locales.

#### Scenario: Add Keys for WhatsApp Landing Page

- GIVEN the `LanguageContext` is initialized
- WHEN the `t.seoTitle` and `t.seoDescription` keys are added for `/automatizacion-whatsapp-restaurante`
- THEN the keys are available in both Spanish (`es`) and English (`en`) locales.

#### Scenario: Add Keys for Canarias Software Landing Page

- GIVEN the `LanguageContext` is initialized
- WHEN the `t.seoTitle` and `t.seoDescription` keys are added for `/software-restaurantes-canarias`
- THEN the keys are available in both Spanish (`es`) and English (`en`) locales.

#### Scenario: Add Keys for Digitalization Tenerife Landing Page

- GIVEN the `LanguageContext` is initialized
- WHEN the `t.seoTitle` and `t.seoDescription` keys are added for `/digitalizacion-hosteleria-tenerife`
- THEN the keys are available in both Spanish (`es`) and English (`en`) locales.

#### Scenario: Add Keys for Digital Menu Landing Page

- GIVEN the `LanguageContext` is initialized
- WHEN the `t.seoTitle` and `t.seoDescription` keys are added for `/menu-digital-sin-app`
- THEN the keys are available in both Spanish (`es`) and English (`en`) locales.

#### Scenario: Add Hero and CTA Keys for All Pages

- GIVEN the `LanguageContext` is initialized
- WHEN the hero title, subtitle, and CTA keys are added for all 6 landing pages
- THEN all keys are available in both Spanish (`es`) and English (`en`) locales.
- AND these keys are used in the hero sections of their respective landing pages.

---
