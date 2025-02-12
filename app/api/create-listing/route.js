export async function POST(req) {
  const tokenCookie = req.cookies.get('token');
  console.log(tokenCookie);
    
    const token = tokenCookie ? tokenCookie.value : null;
    const body = await req.json();
    
  
    if (!token) {
      return Response.json({ error: 'No authentication token found' }, { status: 401 });
    }
  
    try {
      const response = await fetch(`${process.env.BACKEND}/create-listing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing');
      }

      const data = await response.json();
      
  
      return Response.json(data);
    } catch (error) {
      console.error('Error creating listing:', error);
      return Response.json({ 
        error: error.message || 'Failed to create listing' 
      }, { status: 500 });
    }
  }