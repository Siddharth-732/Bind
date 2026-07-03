import dns from "dns";
// Force Node.js to use IPv4 first. This prevents the "ENETUNREACH" IPv6 error on Render and local Windows when connecting to Google SMTP.
dns.setDefaultResultOrder("ipv4first");
console.log(" DNS Result Order set to ipv4first");
