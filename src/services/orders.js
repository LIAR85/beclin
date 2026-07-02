import { requireSupabase } from './supabase';

async function upsertClient({ fullName, phone, email }) {
  const supabase = requireSupabase();
  const clientPayload = {
    full_name: fullName,
    phone,
  };

  if (email) {
    clientPayload.email = email;
  }

  const { data, error } = await supabase
    .from('clients')
    .upsert(
      clientPayload,
      {
        onConflict: 'phone',
      }
    )
    .select('id, full_name, phone, email')
    .single();

  if (error) throw error;
  return data;
}

export async function createOrderWithClient(formValues) {
  const supabase = requireSupabase();
  const client = await upsertClient(formValues);

  const { data, error } = await supabase
    .from('orders')
    .insert({
      client_id: client.id,
      service_type: formValues.serviceType,
      service_mode: String(formValues.serviceMode || 'Regular').toLowerCase(),
      quantity: formValues.quantity,
      notes: formValues.notes || null,
    })
    .select('id, service_type, service_mode, quantity, status, client_id')
    .single();

  if (error) throw error;

  return {
    ...data,
    client_name: client.full_name,
    client_email: client.email,
  };
}


export async function markOrderCompleted(orderId) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'completed' })
    .eq('id', orderId)
    .select('id, status')
    .single();

  if (error) throw error;
  return data;
}
