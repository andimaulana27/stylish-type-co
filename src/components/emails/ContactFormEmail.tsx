// src/components/emails/ContactFormEmail.tsx
import * as React from 'react';

interface ContactFormEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactFormEmail: React.FC<Readonly<ContactFormEmailProps>> = ({
  name,
  email,
  subject,
  message,
}) => (
  <div>
    <h1>New Contact Form Submission</h1>
    <p>
      You have received a new message from your website contact form.
    </p>
    <hr />
    <ul>
      <li><strong>Name:</strong> {name}</li>
      <li><strong>Email:</strong> {email}</li>
      <li><strong>Subject:</strong> {subject}</li>
    </ul>
    <hr />
    <h2>Message:</h2>
    <p>{message}</p>
  </div>
);

export default ContactFormEmail;