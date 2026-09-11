# B.A.B.C Quotation App

## Goal
Build a fast, polished quotation workspace for B.A.B.C BIG-WIG ARCHITECTURE AND BUILDING CONSTRUCTION COMPANY, optimized for Android, A5 printing, PDF/JPEG export, and WhatsApp sharing.

## Experience
- Light, premium corporate interface using royal blue, golden orange, and white.
- Modern, elegant typography inspired by Trajan Pro for the brand, with a highly readable companion font for forms and figures.
- Slightly rounded controls, sharp document layout, restrained motion, and high-contrast financial totals.
- Responsive dashboard and quotation editor designed around fast one-handed mobile entry.

## Core Screens
1. **Dashboard** — quotation totals, accepted/pending/rejected values, payments, outstanding balances, recent documents, and quick actions.
2. **Quotation editor** — client details, project/service details, editable line items, quantities, rates, tax/discount, notes, expiry, deposit, and dual-currency conversion.
3. **Document preview** — branded A5 quotation with company details, bank instructions, authorized signatory, totals in NGN and USD, and print-safe pagination.
4. **Quotation details** — status timeline, payment records, reminders, duplicate/edit/send/export actions, and invoice conversion.
5. **Client response page** — secure public acceptance/rejection and signature flow.
6. **Invoices and payments** — generated invoices, deposits, partial payments, outstanding balances, and status tracking.
7. **Settings** — company profile, services, bank details, exchange-rate default, numbering, expiry defaults, and document preferences.

## Functional Scope
- Super Admin login and protected workspace.
- Auto-generated quotation and invoice numbers with dates and expiry dates.
- Draft, sent, viewed, accepted, rejected, expired, invoiced, partially paid, and paid states.
- Saved construction service templates for architectural drawing, full construction, inspections, and consultation.
- Project cost estimates with reusable line items and accurate decimal calculations.
- Editable NGN/USD exchange rate per document; both values appear beneath the final total.
- PDF generation and A5 printing.
- JPEG export optimized for WhatsApp, plus a prefilled WhatsApp message to the client.
- Client acceptance/rejection, captured signature, timestamp, and response history.
- Invoice creation from accepted quotations and manual payment recording.
- Expiry reminders surfaced in the dashboard, with direct WhatsApp reminder actions.
- Client-side and server-side validation for all editable data.

## Data and Security
- Enable Lovable Cloud for authentication, quotations, clients, line items, signatures, invoices, payments, and settings.
- Restrict management data to the authenticated Super Admin.
- Use unguessable public response tokens for client quotation review; expose only the document data required for that response.
- Store money as integer minor units and exchange rates as validated decimals.
- Keep the supplied bank accounts visible only on finalized quotation/invoice documents and previews.

## Company Content
Use the supplied company name, slogan, address, phone, email, website, registration number, social links, signatory, services, and NGN/USD UBA payment instructions exactly as provided, with punctuation normalized for presentation.

## Asset Note
No attached logo file is currently available in the project. Build a replaceable branded monogram mark so the app is complete, then swap in the official logo when it is uploaded.

## Verification
- Validate quote calculations, status changes, invoice conversion, payments, and signature handling.
- Test the complete create → preview → export/share → accept → invoice → payment flow.
- Visually inspect desktop and Android-sized layouts.
- Generate sample A5 PDF/JPEG outputs and verify legibility, margins, pagination, and bank details.
