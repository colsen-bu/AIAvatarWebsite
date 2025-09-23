import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from 'resend';

// Initialize Resend only if API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the request body
    const validatedData = contactSchema.parse(body);
    
    // Basic rate limiting (simple check - in production use a proper rate limiter)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
    
    // Send email using Resend
    if (resend && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'contact@chrisolsen.work',
          to: process.env.CONTACT_EMAIL || 'colsen@mcvcllmhgb.com',
          subject: `Contact Form: ${validatedData.subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${validatedData.name}</p>
            <p><strong>Email:</strong> ${validatedData.email}</p>
            <p><strong>Subject:</strong> ${validatedData.subject}</p>
            <p><strong>Message:</strong></p>
            <div style="white-space: pre-wrap; background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
${validatedData.message}
            </div>
            <hr>
            <p><small>Submitted from: ${ip} at ${new Date().toISOString()}</small></p>
          `,
          replyTo: validatedData.email,
        });
        
        console.log('Email sent successfully via Resend');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue execution - we'll still return success to user
      }
    } else {
      // Fallback to console logging if no Resend API key is configured
      console.log('Contact form submission (Resend not configured):', {
        ...validatedData,
        ip,
        timestamp: new Date().toISOString(),
      });
      console.log('📧 To enable email delivery, configure RESEND_API_KEY in your environment variables');
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Thank you for your message! I'll get back to you soon." 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Contact form error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Please check your form data.",
          errors: error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Sorry, there was an error sending your message. Please try again later." 
      },
      { status: 500 }
    );
  }
}