const Message = require("./../models/messageModel");

exports.contactMessage = async (req, res) => {
  const doc = await Message.create(req.body);

  if (!doc) {
    return res.status(500).json({
      status: "failed",
      error: "there was and error sending message",
    });
  }

  return res.status(200).json({
    message:
      "Message sent successfully...We thank You for your valuable message",
  });
};
