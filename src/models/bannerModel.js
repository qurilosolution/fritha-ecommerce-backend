const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: [String], default: [] },
  description: { type: String },
  position: { type: Number },
  type: { 
    type: String, 
    enum: ['HERO', 'PROMOTIONAL', 'CATEGORY', 'TESTIMONIAL', 'PRODUCT_SPOTLIGHT', 'EVENT_ANNOUNCEMENT', 'NEWSLETTER_SIGNUP', 'SEASONAL'], 
    default: 'HERO' 
  },
  redirectUrl: { type: String }
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
