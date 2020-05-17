const nodemailer = require("nodemailer");
const {
  emailList,
  notifEnabled,
  fromEmail,
  nodeMailerOpts
} = require("../config/notify");
const logger = require("./logger");

const transporter = nodemailer.createTransport(nodeMailerOpts);

const notify = async ({ subject, body }) => {
  if (notifEnabled) {
    logger.log("[EMAIL]", "Sending email", subject, body);

    const mailOptions = {
      from: fromEmail,
      to: emailList,
      subject,
      text: body
    };

    try {
      const { response } = await transporter.sendMail(mailOptions);
      logger.log("[EMAIL]", "Email send success", response);
    } catch (err) {
      const newErr = new Error("[EMAIL] Email send failed! " + err.message);
      logger.error(newErr);
      throw newErr;
    }
  }
};

module.exports = notify;
