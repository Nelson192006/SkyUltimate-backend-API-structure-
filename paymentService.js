// src/services/paymentService.js
class PaymentService {
  static async processPayment(amount, method) {
      // For now, simulate payment success
          if (!amount || !method) {
                throw new Error("Invalid payment request");
                    }
                        return {
                              status: "success",
                                    method,
                                          amount,
                                                transactionId: "TXN" + Date.now(),
                                                    };
                                                      }
                                                      }

                                                      module.exports = PaymentService;