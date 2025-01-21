const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },  
  redirectUrl: { type: String }  
});

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: [imageSchema], default: [] },  
  description: { type: String },
  position: { type: Number },
  type: { 
    type: String, 
    enum: ['HERO', 'PROMOTIONAL', 'CATEGORY', 'TESTIMONIAL', 'PRODUCT_SPOTLIGHT', 'EVENT_ANNOUNCEMENT', 'NEWSLETTER_SIGNUP', 'SEASONAL'], 
    default: 'HERO' 
  },
  deletedAt: { type: Date, default: null }, 
 
}, { timestamps: true });

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
