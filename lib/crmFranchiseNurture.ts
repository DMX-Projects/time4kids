/**
 * Manual franchise nurturing templates (Email + WhatsApp).
 * Paid-campaign franchise leads only; eligible statuses only.
 */

import { isFranchiseCampaignSource } from "@/lib/crmLeadKind";

/** Franchise funnel baskets that may use nurturing templates. */
export const FRANCHISE_NURTURE_STATUSES = new Set([
  "not_answering_calls",
  "follow_up",
  "join_later",
  "not_interested",
  "warm",
  "cold",
]);

export type FranchiseNurtureOption = {
  id: string;
  label: string;
  theme: string;
  emailSubject: string;
  emailBody: string;
  whatsapp: string;
};

function firstName(fullName: string): string {
  const part = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)[0];
  return part || "there";
}

/** True for franchise paid-campaign leads in an eligible nurture status. */
export function canUseFranchiseNurture(lead: {
  source?: string | null;
  status?: string | null;
} | null | undefined): boolean {
  if (!lead) return false;
  if (!isFranchiseCampaignSource(lead.source)) return false;
  const status = String(lead.status || "").trim().toLowerCase();
  return FRANCHISE_NURTURE_STATUSES.has(status);
}

/** Build the 5 nurture options with the lead's name filled in. */
export function getFranchiseNurtureOptions(leadName: string): FranchiseNurtureOption[] {
  const name = firstName(leadName);

  return [
    {
      id: "nurture-1",
      label: "Option 1",
      theme: "Don't miss the opportunity",
      emailSubject: `${name} - Don't Miss the Opportunity to Start Your Own Preschool with T.I.M.E. Kids`,
      emailBody: `Dear ${name},

Have you ever thought of starting your own business in an industry that continues to grow with the increasing demand for quality preschool education?

A T.I.M.E. Kids preschool gives you the opportunity to build your own education business with the support of an established preschool brand.

From curriculum and training to marketing, admissions and operational guidance, you get support at every stage of your preschool journey.

This could be the right time to turn your business idea into your own preschool.

Connect with our representative today to understand the T.I.M.E. Kids preschool franchise opportunity and how you can get started.

Regards,
T.I.M.E. Kids`,
      whatsapp: `🌱 ${name}, start your own preschool with T.I.M.E. Kids!

Explore a rewarding business opportunity with an established preschool brand.

Connect with us today to know more.`,
    },
    {
      id: "nurture-2",
      label: "Option 2",
      theme: "A Franchisee's Journey",
      emailSubject: `${name}, See What a T.I.M.E. Kids Franchisee Has to Say`,
      emailBody: `Dear ${name},

Starting a business is a big decision. Hearing from someone who has already taken the journey can make that decision easier.

Meet Komal, a T.I.M.E. Kids franchisee, and discover her preschool journey.

From taking the first step to managing her preschool, her experience gives you an insight into what it is like to build a preschool business with T.I.M.E. Kids.

Every successful preschool journey starts with one important decision—the decision to begin.

Could your T.I.M.E. Kids journey be next?

Connect with our representative to understand the opportunity.

Regards,
T.I.M.E. Kids`,
      whatsapp: `🎓 ${name}, see the T.I.M.E. Kids journey through a franchisee's eyes.

Hear her experience and discover what your preschool journey could look like.

Watch now & know more.`,
    },
    {
      id: "nurture-3",
      label: "Option 3",
      theme: "Balance Business & Life",
      emailSubject: `${name}, Build a Business That Fits Your Life`,
      emailBody: `Dear ${name},

A business should not only help you earn—it should also give you the flexibility to manage your time and priorities.

A preschool can offer you the opportunity to build a meaningful business while staying connected to your family and community.

With T.I.M.E. Kids, you get the support of an established preschool system, allowing you to focus on managing and growing your centre while our team supports you with academic and operational guidance.

Build your business. Be part of a child's early learning journey. And create a work-life balance that works for you.

Explore the T.I.M.E. Kids preschool franchise opportunity today.

Regards,
T.I.M.E. Kids`,
      whatsapp: `🌱 ${name}, build a preschool business that fits your life.

Start your own T.I.M.E. Kids preschool and enjoy the opportunity to balance business and family.

Explore the opportunity today.`,
    },
    {
      id: "nurture-4",
      label: "Option 4",
      theme: "Business & ROI",
      emailSubject: `${name}, Explore a High-Potential Business Opportunity – T.I.M.E. Kids Preschool`,
      emailBody: `Dear ${name},

Looking for a business opportunity in a sector with strong and continuing demand?

Preschool education is a growing business opportunity, driven by parents' increasing focus on quality early childhood education.

A T.I.M.E. Kids preschool gives you the opportunity to enter this sector with the backing of an established preschool brand, structured academic programmes, training and ongoing support.

The right location, effective admissions and proper centre management can help create a sustainable preschool business.

Explore the business potential. Understand the investment. Evaluate the opportunity.

Speak to our representative today to know more about starting your own T.I.M.E. Kids preschool.

Regards,
T.I.M.E. Kids`,
      whatsapp: `📈 ${name}, explore the business potential of a T.I.M.E. Kids preschool.

A growing sector. An established brand. A business opportunity worth exploring.

Connect with us today.`,
    },
    {
      id: "nurture-5",
      label: "Option 5",
      theme: "Take the Next Step",
      emailSubject: `${name}, Let's Talk About the Growing Preschool Industry`,
      emailBody: `Dear ${name},

The preschool education sector is creating exciting opportunities for entrepreneurs who want to build a business while making a meaningful difference in children's early learning years.

You have explored the opportunity. You have seen the franchisee journey. You have understood the lifestyle and business potential.

Now, it's time to take the next step.

Connect with a T.I.M.E. Kids representative today to understand:
• The preschool franchise model
• Investment requirements
• Location and infrastructure requirements
• Support provided by T.I.M.E. Kids
• Admissions and marketing support
• The potential of the preschool market in your location

Your preschool journey could start with one conversation.

Connect with us today.

Regards,
T.I.M.E. Kids`,
      whatsapp: `🚀 ${name}, ready to take the next step in preschool industry?

Connect with a T.I.M.E. Kids representative to understand the preschool franchise opportunity.

Let's talk today!`,
    },
  ];
}
