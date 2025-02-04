
export async function POST(req) {
  const tokenCookie = req.cookies.get('token');
  console.log(tokenCookie);
    
    const token = tokenCookie ? tokenCookie.value : null;
    const body = await req.json();
    
  
    if (!token) {
      return Response.json({ error: 'No authentication token found' }, { status: 401 });
    }
  
    try {
      const response = await fetch('https://mobazaar.instacdn.live/create-listing', {
        method: 'POST',
        headers: {
          'Authorization': 'bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
  
      return Response.json(data);
    } catch (error) {
      console.log(error);
      return Response.json({ error: 'Failed to create listing' }, { status: 500 });
    }
  }