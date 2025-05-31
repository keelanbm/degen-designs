import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.userId

        if (!userId) {
          console.error('No userId in session metadata')
          return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 })
        }

        // Update user to premium
        await db.user.update({
          where: { id: userId },
          data: {
            isPremium: true,
            stripeCustomerId: session.customer as string,
          },
        })

        console.log(`User ${userId} upgraded to premium`)
        break
      }

      case 'invoice.payment_succeeded': {
        // Handle subscription renewals if you add subscriptions later
        break
      }

      case 'customer.subscription.deleted': {
        // Handle subscription cancellations if you add subscriptions later
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}