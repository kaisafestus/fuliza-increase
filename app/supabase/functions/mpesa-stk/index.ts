// STK Push Edge Function

Deno.serve(async (req) => {
  // Only allow POST method
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    )
  }

  try {
    // Parse request body
    const { 
      amount, 
      phoneNumber, 
      accountReference, 
      customerName,
      transactionDesc 
    } = await req.json()

    // Validate required fields
    if (!amount || !phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Amount and phone number are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // TODO: Implement payment gateway integration
    // Replace this with your payment gateway API call
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Payment gateway not configured',
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error('STK Push Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error", 
        details: error.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
