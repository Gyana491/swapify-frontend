export const verifyToken = async (token: string) => {
    if (!token) return false;
    
    try {
        const response = await fetch(`${process.env.BACKEND}/verify-token`, {
            method: 'POST',
            headers: {
                'Authorization': 'bearer ' + token
            }
        });
        const data = await response.json();
        return {
            isLoggedIn: data.isLoggedIn,
            user: data.user // Assuming the backend returns user data
        };
    } catch (error) {
        console.error('Token verification failed:', error);
        return {
            isLoggedIn: false,
            user: null
        };
    }
}
