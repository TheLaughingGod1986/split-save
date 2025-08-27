import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params
  
  try {
    console.log('=== ACCEPT INVITATION START ===')
    console.log('1. Token received:', token)
    
    // Decode the invitation token (in a real app, this would be a JWT or secure token)
    // For now, we'll use the invitation ID directly
    const invitationId = token
    
    console.log('2. Looking up invitation:', invitationId)
    
    // Get the invitation
    const { data: invitation, error: invError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('status', 'pending')
      .single()
    
    if (invError || !invitation) {
      console.log('3. Invitation not found or not pending')
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }
    
    // Check if invitation has expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      console.log('4. Invitation expired')
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 })
    }
    
    console.log('5. Invitation found:', invitation)
    
    // Check if user actually exists in auth.users (not just public.users)
    const { data: existingAuthUser, error: authUserError } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingAuthUser.users.some(user => user.email === invitation.to_email)
    
    if (userExists) {
      console.log('6. User already exists in auth system, creating partnership automatically')
      
      // Find the existing user
      const existingUser = existingAuthUser.users.find(user => user.email === invitation.to_email)
      console.log('6a. Existing user found:', existingUser?.id, existingUser?.email)
      
      console.log('6b. About to update invitation with token:', token)
      console.log('6c. Invitation data:', invitation)
      
      // Update invitation with user_id and mark as accepted
      const { error: updateError } = await supabaseAdmin
        .from('partnership_invitations')
        .update({ 
          to_user_id: existingUser!.id,
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', token)
      
      if (updateError) {
        console.error('7. Invitation update error:', updateError)
        console.error('7a. Update details:', {
          token,
          invitationId: invitation.id,
          existingUserId: existingUser?.id,
          invitationData: invitation
        })
        return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
      }
      
      // Create the partnership
      const { error: partnershipError } = await supabaseAdmin
        .from('partnerships')
        .insert({
          user1_id: invitation.from_user_id,
          user2_id: existingUser!.id,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (partnershipError) {
        console.error('8. Partnership creation error:', partnershipError)
        return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 })
      }
      
      console.log('9. Success! Partnership established with existing user')
      
      // Return success page with redirect
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Partnership Invitation</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
            .container { border: 1px solid #ddd; border-radius: 8px; padding: 30px; text-align: center; }
            h1 { color: #333; margin-bottom: 20px; }
            .message { color: #666; margin-bottom: 20px; }
            .button { background: #6366f1; color: white; padding: 12px 24px; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; text-decoration: none; display: inline-block; }
            .button:hover { background: #4f46e5; }
            .success { color: #059669; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Partnership Invitation</h1>
            <p class="success">Partnership established successfully! 🎉</p>
            <p class="message">You can now sign in to your account and see your new partnership.</p>
            <a href="/" class="button">Go to SplitSave</a>
          </div>
        </body>
        </html>
      `
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    // Return a simple HTML page for account creation
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Accept Partnership Invitation</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
          .container { border: 1px solid #ddd; border-radius: 8px; padding: 30px; }
          h1 { color: #333; margin-bottom: 20px; }
          .form-group { margin-bottom: 20px; }
          label { display: block; margin-bottom: 5px; font-weight: bold; }
          input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
          button { background: #6366f1; color: white; padding: 12px 24px; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
          button:hover { background: #4f46e5; }
          .error { color: #dc2626; margin-top: 10px; }
          .success { color: #059669; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Accept Partnership Invitation</h1>
          <p>You've been invited to join SplitSave as a partner!</p>
          
          <form id="acceptForm">
            <div class="form-group">
              <label for="name">Your Name</label>
              <input type="text" id="name" name="name" required>
            </div>
            
            <div class="form-group">
              <label for="password">Create Password</label>
              <input type="password" id="password" name="password" required minlength="6">
            </div>
            
            <button type="submit">Accept Invitation & Create Account</button>
          </form>
          
          <div id="message"></div>
        </div>
        
        <script>
          document.getElementById('acceptForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            
            try {
              const response = await fetch('/api/invite/accept/${invitationId}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password })
              });
              
              const result = await response.json();
              
              if (response.ok) {
                messageDiv.innerHTML = '<div class="success">Account created successfully! You can now sign in.</div>';
                document.getElementById('acceptForm').style.display = 'none';
              } else {
                messageDiv.innerHTML = '<div class="error">' + result.error + '</div>';
              }
            } catch (error) {
              messageDiv.innerHTML = '<div class="error">An error occurred. Please try again.</div>';
            }
          });
        </script>
      </body>
      </html>
    `
    
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    })
    
  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params
  
  try {
    console.log('=== ACCEPT INVITATION POST START ===')
    const { name, password } = await request.json()
    
    if (!name || !password) {
      return NextResponse.json({ error: 'Name and password required' }, { status: 400 })
    }
    
    console.log('1. Creating account for invitation:', token)
    
    // Get the invitation
    const { data: invitation, error: invError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .eq('id', token)
      .eq('status', 'pending')
      .single()
    
    if (invError || !invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 })
    }
    
    // Check if invitation has expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 })
    }
    
    console.log('2. Invitation found:', invitation)
    
    // Check if user actually exists in auth.users (not just public.users)
    const { data: existingAuthUser, error: authUserError } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingAuthUser.users.some(user => user.email === invitation.to_email)
    
    if (userExists) {
      console.log('3. User already exists in auth system, linking to partnership')
      
      // Find the existing user
      const existingUser = existingAuthUser.users.find(user => user.email === invitation.to_email)
      
      // Update invitation with user_id and mark as accepted
      const { error: updateError } = await supabaseAdmin
        .from('partnership_invitations')
        .update({ 
          to_user_id: existingUser!.id,
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', token)
      
      if (updateError) {
        console.error('4. Invitation update error:', updateError)
        return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
      }
      
      // Create the partnership
      const { error: partnershipError } = await supabaseAdmin
        .from('partnerships')
        .insert({
          user1_id: invitation.from_user_id,
          user2_id: existingUser!.id,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (partnershipError) {
        console.error('5. Partnership creation error:', partnershipError)
        return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 })
      }
      
      console.log('6. Success! Partnership established with existing user')
      
      return NextResponse.json({
        message: 'Partnership established successfully! Please sign in to your existing account.',
        userId: existingUser!.id,
        partnership: 'active'
      })
    }
    
    console.log('3. Creating new user account')
    
    // Create the user account
    const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: invitation.to_email,
      password: password,
      email_confirm: true,
      user_metadata: { name }
    })
    
    if (userError) {
      console.error('4. User creation error:', userError)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }
    
    console.log('5. User created:', newUser.user.id)
    
    // Create public user record
    const { error: publicUserError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUser.user.id,
        email: invitation.to_email,
        name: name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (publicUserError) {
      console.error('6. Public user creation error:', publicUserError)
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
    }
    
    // Create user profile (optional - don't fail if this doesn't work)
    try {
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: newUser.user.id,
          income: 0,
          payday: 'last-working-day',
          currency: 'USD',
          country_code: 'US',
          personal_allowance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.error('7. Profile creation error (non-fatal):', profileError)
        // Don't fail the whole process if profile creation fails
      } else {
        console.log('7. User profile created successfully')
      }
    } catch (profileError) {
      console.error('7. Profile creation error (caught):', profileError)
      // Don't fail the whole process if profile creation fails
    }
    
    // Update invitation with user_id and mark as accepted
    const { error: updateError } = await supabaseAdmin
      .from('partnership_invitations')
      .update({ 
        to_user_id: newUser.user.id,
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', token)
    
    if (updateError) {
      console.error('8. Invitation update error:', updateError)
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
    }
    
    // Create the partnership
    const { error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .insert({
        user1_id: invitation.from_user_id,
        user2_id: newUser.user.id,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (partnershipError) {
      console.error('9. Partnership creation error:', partnershipError)
      return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 })
    }
    
    console.log('10. Success! Account created and partnership established')
    
    return NextResponse.json({
      message: 'Account created successfully! You can now sign in.',
      userId: newUser.user.id,
      partnership: 'active'
    })
    
  } catch (error) {
    console.error('Accept invitation POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
