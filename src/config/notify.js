module.exports = {
  // mail settings
  notifEnabled: false,

  // send to
  emailList: [
    "6177757640@txt.att.net",
    "7602168094@txt.att.net",
    "8583820463@tmomail.net"
  ], // prevent-sensitive-commit-array

  // send from
  fromEmail: "info@landonseastmeetswest.com", // prevent-sensitive-commit-string

  // email body template
  serviceDownMessage: service =>
    "SERVICE: " + service + "\nPlease check tablet and restore connectivity",

  // nodemailer options
  // https://nodemailer.com/usage/
  nodeMailerOpts: {
    host: "mail.landonseastmeetswest.com", // prevent-sensitive-commit-string
    name: "landonseastmeetswest.com", // prevent-sensitive-commit-string
    port: 465,
    secure: true,
    auth: {
      user: "info@landonseastmeetswest.com", // prevent-sensitive-commit-string
      pass: "@Landons2020" // prevent-sensitive-commit-string
    }
  }
};
