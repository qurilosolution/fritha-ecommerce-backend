const axios = require('axios');

const WebhookService = {
  sendOrderCompletedWebhook: async (order) => {
    try {
      const webhookUrl = process.env.WEBHOOK_URL; 

      if (!webhookUrl) {
        console.warn("Webhook URL is not defined in environment variables.");
        return;
      }

      const payload = {
        orderId: order._id,
        status: order.status,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        completedAt: new Date(),
      };

      const response = await axios.post(webhookUrl, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Webhook sent successfully:", response.data);
    } catch (error) {
      console.error("Error sending webhook:", error.message);
    }
  },
};

module.exports = WebhookService;
