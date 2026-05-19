// A simple script to test our API endpoint
const testUrlShortener = async () => {
    try {
        console.log("Sending a URL to be shortened...");
        
        const response = await fetch('http://localhost:5000/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                originalUrl: 'https://itu.edu.pk'
            })
        });

        const data = await response.json();
        console.log("\n--- SERVER RESPONSE ---");
        console.log(data);
        console.log("-----------------------\n");
        
    } catch (error) {
        console.error("Test failed completely ❌:", error.message);
    }
};

testUrlShortener();