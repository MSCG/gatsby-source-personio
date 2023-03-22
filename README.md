# gatsby-source-personio

Source plugin for pulling data into [Gatsby](https://github.com/gatsbyjs) from
[Personio](https://www.personio.com/).

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-personio",
      options: {
        // Your Personio domain name.
        domainName: "acme",
        // The language to fetch the jobs in.
        language: "de",
        // Remove styling from job description.
        removeStyling: true
      },
    },
  ],
}
```
