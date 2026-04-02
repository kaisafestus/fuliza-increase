import { NextResponse } from 'next/server';
import { getTransactionStatus } from '@/app/lib/pesapal';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // PesaPal sends IPN notifications with these fields
    const { OrderTrackingId, OrderNotificationType, OrderMerchantReference } = body;

    console.log('PesaPal IPN received:', {
      OrderTrackingId,
      OrderNotificationType,
      OrderMerchantReference,
    });

    // Validate required fields
    if (!OrderTrackingId) {
      return NextResponse.json(
        { error: 'Missing OrderTrackingId' },
        { status: 400 }
      );
    }

    // Get transaction status from PesaPal
    const transactionStatus = await getTransactionStatus(OrderTrackingId);

    console.log('Transaction status:', transactionStatus);

    // Process based on payment status
    const { payment_status_description, confirmation_code } = transactionStatus;

    // Update database with payment status
    // You can add Supabase integration here to update the payment record
    // const { error: dbError } = await supabase
    //   .from('payments')
    //   .update({
    //     status: payment_status_description?.toLowerCase(),
    //     confirmation_code: confirmation_code,
    //     updated_at: new Date().toISOString(),
    //     raw_response: transactionStatus,
    //   })
    //   .eq('tracking_id', OrderTrackingId);

    // Handle different payment statuses
    if (payment_status_description === 'Completed') {
      // Payment successful
      console.log('Payment completed:', {
        trackingId: OrderTrackingId,
        confirmationCode: confirmation_code,
      });
      
      // Here you would:
      // 1. Update user's Fuliza limit in your database
      // 2. Send confirmation email/SMS
      // 3. Update payment status
      
    } else if (payment_status_description === 'Failed') {
      // Payment failed
      console.log('Payment failed:', {
        trackingId: OrderTrackingId,
      });
      
    } else if (payment_status_description === 'Pending') {
      // Payment pending
      console.log('Payment pending:', {
        trackingId: OrderTrackingId,
      });
    }

    // Return success response to PesaPal
    return NextResponse.json({
      success: true,
      message: 'IPN received and processed',
    });

  } catch (error) {
    console.error('PesaPal callback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process callback' },
      { status: 500 }
    );
  }
}

// Also handle GET requests for testing
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderTrackingId = searchParams.get('OrderTrackingId');

  if (!orderTrackingId) {
    return NextResponse.json(
      { error: 'Missing OrderTrackingId parameter' },
      { status: 400 }
    );
  }

  try {
    const transactionStatus = await getTransactionStatus(orderTrackingId);
    return NextResponse.json(transactionStatus);
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get transaction status' },
      { status: 500 }
    );
  }
}
