export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET') { return res.status(405).json({ error: 'Method Not Allowed' }); }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesError) throw profilesError;

    const users = authData?.users || [];
    const profiles = profilesData || [];
    const mergedMap = {};

    // 1. Populate from auth users (Google, OTP, Email)
    users.forEach(u => {
      mergedMap[u.id] = {
        id: u.id,
        email: u.email || '',
        phone: u.phone || u.user_metadata?.phone || '',
        full_name: u.user_metadata?.full_name || u.user_metadata?.name || '',
        created_at: u.created_at,
      };
    });

    // 2. Merge with profiles table
    profiles.forEach(p => {
      if (!mergedMap[p.id]) {
        mergedMap[p.id] = { 
          id: p.id, 
          email: p.email || '', 
          phone: p.phone || '',
          full_name: p.full_name || '',
          created_at: p.created_at 
        };
      } else {
        if (p.full_name) mergedMap[p.id].full_name = p.full_name;
        if (p.phone) mergedMap[p.id].phone = p.phone;
        if (p.email && !mergedMap[p.id].email) mergedMap[p.id].email = p.email;
      }
    });

    return res.status(200).json({ profiles: Object.values(mergedMap) });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
