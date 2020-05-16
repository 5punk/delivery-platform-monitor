module.exports = {
  // mail settings
  notifEnabled: true,

  // send to
  emailList: [], // prevent-sensitive-commit-array

  // send from
  fromEmail: "", // prevent-sensitive-commit-string

  // email body template
  serviceDownMessage: service =>
    "SERVICE: " + service + "\nPlease check tablet and restore connectivity",

  // nodemailer options
  // https://nodemailer.com/usage/
  nodeMailerOpts: {
    host: "", // prevent-sensitive-commit-string
    name: "", // prevent-sensitive-commit-string
    port: 465,
    secure: true,
    auth: {
      user: "", // prevent-sensitive-commit-string
      pass: "" // prevent-sensitive-commit-string
    }
  }
};
