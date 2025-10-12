# 🌐 DNS and Ads Configuration Instructions

## 📋 **DNS SPF Record Configuration**

### **SPF Record Setup**
Add the following SPF record to your domain's DNS configuration:

```
Type: TXT
Name: @ (or your domain name)
Value: v=spf1 include:_spf.google.com include:sendgrid.net include:mailgun.org ~all
TTL: 3600
```

### **Purpose**
- **SPF (Sender Policy Framework)**: Prevents email spoofing
- **Google**: For Gmail/Google Workspace emails
- **SendGrid**: For transactional emails
- **Mailgun**: For marketing emails
- **~all**: Soft fail for other sources

---

## 📄 **ads.txt File Configuration**

### **Create ads.txt File**
Create a file named `ads.txt` in your website's root directory (`/public/ads.txt`):

```
# ads.txt file for mobilegamehunt.com
# Format: domain.com, publisher-account-id, relationship, certification-authority-id

# Google AdSense (if using)
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0

# Google Ad Manager (if using)
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0

# Facebook Audience Network (if using)
facebook.com, XXXXXXXX, DIRECT, c3e20eee3f780d68

# Add other ad networks as needed
```

### **Implementation Steps**

1. **Create the file**:
   ```bash
   touch public/ads.txt
   ```

2. **Add content** with your actual publisher IDs

3. **Verify access**:
   - Visit: `https://yourdomain.com/ads.txt`
   - Should return the ads.txt content

4. **Submit to ad networks**:
   - Google AdSense: Submit in AdSense dashboard
   - Facebook: Submit in Facebook Business Manager

---

## 🔧 **Next.js Implementation**

### **Static File Serving**
The `ads.txt` file will be automatically served from `/public/ads.txt` by Next.js.

### **Verification Route** (Optional)
Create an API route to verify ads.txt content:

```typescript
// pages/api/ads-verification.ts
export default function handler(req: NextRequest) {
  if (req.method === 'GET') {
    return NextResponse.json({
      status: 'ads.txt configured',
      lastUpdated: new Date().toISOString(),
      domain: process.env.NEXT_PUBLIC_SITE_URL
    });
  }
}
```

---

## 🚨 **Important Notes**

### **SPF Record**
- **Maximum 10 lookups**: Keep SPF record simple
- **Test before deploying**: Use SPF record testing tools
- **Update TTL**: Reduce TTL before changes, increase after

### **ads.txt**
- **Case sensitive**: Must be exactly `ads.txt`
- **Root domain only**: Must be at domain root, not subdomain
- **Regular updates**: Update when adding new ad networks
- **Verification**: Use ads.txt validators

### **Security Considerations**
- **HTTPS only**: Serve ads.txt over HTTPS
- **No redirects**: Must be direct file access
- **Correct MIME type**: Should return `text/plain`

---

## ✅ **Verification Checklist**

### **DNS SPF**
- [ ] SPF record added to DNS
- [ ] SPF record tested with online tools
- [ ] Email delivery verified
- [ ] No SPF record errors in email headers

### **ads.txt**
- [ ] File created in `/public/ads.txt`
- [ ] File accessible at `https://domain.com/ads.txt`
- [ ] Content format verified
- [ ] Publisher IDs are correct
- [ ] Submitted to ad networks

### **Performance Impact**
- [ ] ads.txt file size < 1KB
- [ ] No redirects or slow responses
- [ ] Proper caching headers set

---

## 🛠 **Tools for Testing**

### **SPF Testing**
- **MXToolbox SPF Checker**: https://mxtoolbox.com/spf.aspx
- **SPF Record Testing Tool**: https://www.kitterman.com/spf/validate.html

### **ads.txt Testing**
- **ads.txt Validator**: https://adstxt.com/
- **Google ads.txt Tester**: In Google Search Console
- **Facebook ads.txt Checker**: In Facebook Business Manager

---

## 📊 **Expected Performance Impact**

### **DNS SPF**
- **No performance impact**: DNS lookup happens once per email
- **Security benefit**: Prevents email spoofing attacks

### **ads.txt**
- **Minimal impact**: Single HTTP request on page load
- **Caching**: Should be cached by browsers
- **Size**: Typically < 1KB

---

**Last Updated**: $(date)
**Status**: Ready for production implementation
