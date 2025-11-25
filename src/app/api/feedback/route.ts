import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const feedbackSchema = z.object({
  name: z.string().max(100).optional().default(''),
  email: z.string().email().optional().or(z.literal('')),
  company: z.string().max(200).optional().default(''),
  meetingType: z.string().max(50).optional().default(''),
  date: z.string().optional().default(''),
  overallImpression: z.string().max(50).optional().default(''),
  strengths: z.string().max(2000).optional().default(''),
  areasForImprovement: z.string().max(2000).optional().default(''),
  additionalComments: z.string().max(2000).optional().default(''),
  wouldRecommend: z.string().max(50).optional().default(''),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = feedbackSchema.parse(body);
    
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';

    // Format the feedback email
    const formatField = (label: string, value: string) => {
      if (!value) return '';
      return `<p><strong>${label}:</strong> ${value}</p>`;
    };

    const emailHtml = `
      <h2>📝 New Feedback Submission</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #495057;">Contact Information</h3>
        ${formatField('Name', validatedData.name) || '<p><em>Anonymous</em></p>'}
        ${formatField('Email', validatedData.email || '')}
        ${formatField('Company', validatedData.company)}
        ${formatField('Meeting Type', validatedData.meetingType)}
        ${formatField('Date', validatedData.date)}
      </div>

      <div style="background-color: #e7f5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1971c2;">Feedback</h3>
        ${formatField('Overall Impression', validatedData.overallImpression)}
        ${formatField('Would Recommend', validatedData.wouldRecommend)}
      </div>

      ${validatedData.strengths ? `
      <div style="background-color: #d3f9d8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2f9e44;">💪 Strengths</h3>
        <p style="white-space: pre-wrap;">${validatedData.strengths}</p>
      </div>
      ` : ''}

      ${validatedData.areasForImprovement ? `
      <div style="background-color: #fff3bf; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #e67700;">📈 Areas for Improvement</h3>
        <p style="white-space: pre-wrap;">${validatedData.areasForImprovement}</p>
      </div>
      ` : ''}

      ${validatedData.additionalComments ? `
      <div style="background-color: #f1f3f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #495057;">💬 Additional Comments</h3>
        <p style="white-space: pre-wrap;">${validatedData.additionalComments}</p>
      </div>
      ` : ''}

      <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
      <p><small style="color: #868e96;">Submitted from: ${ip} at ${new Date().toISOString()}</small></p>
    `;

    if (resend && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'feedback@chrisolsen.work',
          to: process.env.CONTACT_EMAIL || 'colsen@mcvcllmhgb.com',
          subject: `Feedback: ${validatedData.meetingType || 'General'} - ${validatedData.overallImpression || 'No rating'}`,
          html: emailHtml,
          replyTo: validatedData.email || undefined,
        });
        
        console.log('Feedback email sent successfully via Resend');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    } else {
      console.log('Feedback submission (Resend not configured):', {
        ...validatedData,
        ip,
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Thank you for your feedback! I truly appreciate you taking the time to help me improve." 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Feedback form error:', error);
    
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
        message: "An unexpected error occurred. Please try again later." 
      },
      { status: 500 }
    );
  }
}
