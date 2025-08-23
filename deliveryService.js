// src/services/deliveryService.js
class DeliveryService {
  static calculateDeliveryFee(distance) {
      if (distance <= 5) return 1000; // ₦1000 for <= 5km
          if (distance <= 15) return 2000; // ₦2000 for <= 15km
              return 3000; // ₦3000 flat fee for long distance
                }

                  static estimateDeliveryTime(distance) {
                      if (distance <= 5) return "30-45 mins";
                          if (distance <= 15) return "1-2 hours";
                              return "2-4 hours";
                                }
                                }

                                module.exports = DeliveryService;