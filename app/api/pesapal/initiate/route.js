import { NextResponse } from 'next/server';
import { submitOrder, generateOrderId, formatPhoneNumber } from '@/app/lib/pesapal';

export async function POST(request) {
  try {
    const body = await request.json();
    const { package: pkg, phone, email, name } = body;

    // Validate required fields
    if (!pkg || !pkg.limit || !pkg.fee) {
      return NextResponse.json(
        { error: 'Invalid package data' },
        { status: 400 }
      );
    }

    if (!phone || !email || !name) {
      return NextResponse.json(
        { error: 'Phone, email, and name are required' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = generateOrderId();

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);

    // Get the base URL for callback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    // Prepare order data for PesaPal
    const orderData = {
      id: orderId,
      currency: 'KES',
      amount: pkg.fee,
      description: `Fuliza Limit Increase - KSh ${pkg.limit}`,
      callback_url: `${baseUrl}/payment/callback?order_id=${orderId}`,
      notification_id: process.env.PESAPAL_IPN_ID,
      billing_address: {
        email_address: email,
        phone_number: formattedPhone,
        first_name: name.split(' ')[0] || name,
        last_name: name.split(' ').slice(1).join(' ') || '',
        country_code: 'KE',
      },
    };

    // Submit order to PesaPal
    const pesapalResponse = await submitOrder(orderData);

    // Store order in database (optional - for tracking)
    // You can add Supabase integration here to store the order
    // const { error: dbError } = await supabase
    //   .from('payments')
    //   .insert({
    //     order_id: orderId,
    //     tracking_id: pesapalResponse.order_tracking_id,
    //     amount: pkg.fee,
    //     package_limit: pkg.limit,
    //     phone: formattedPhone,
    //     email: email,
    //     name: name,
    //     status: 'pending',
    //     created_at: new Date().toISOString(),
    //   });

    return NextResponse.json({
      success: true,
      order_id: orderId,
      tracking_id: pesapalResponse.order_tracking_id,
      redirect_url: pesapalResponse.redirect_url,
      message: 'Payment initiated successfully',
    });

  } catch (error) {
    console.error('PesaPal initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
