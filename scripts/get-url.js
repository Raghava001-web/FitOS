const http = require("http");

http.get("http://localhost:8081", (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    // Try to find expo tunnel URL in the response
    const expMatch = body.match(/exp[s]?:\/\/[^\s'"<>]+/);
    if (expMatch) {
      console.log("EXPO URL:", expMatch[0]);
    }
    
    // Try to find any tunnel URL
    const tunnelMatch = body.match(/https?:\/\/[^\s'"<>]*\.ngrok[^\s'"<>]*/);
    if (tunnelMatch) {
      console.log("TUNNEL URL:", tunnelMatch[0]);
    }

    // Also check for any expo dev URL
    const devMatch = body.match(/https?:\/\/[^\s'"<>]*expo[^\s'"<>]*/);  
    if (devMatch) {
      console.log("DEV URL:", devMatch[0]);
    }

    if (!expMatch && !tunnelMatch && !devMatch) {
      console.log("No tunnel URL found in response body.");
      console.log("Response length:", body.length);
      console.log("First 500 chars:", body.substring(0, 500));
    }
  });
}).on("error", (e) => {
  console.log("Error:", e.message);
});
