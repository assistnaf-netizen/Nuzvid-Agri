import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import './Blogs.css';

const blogsData = [
  {
    title: "Brown Sugar by Nuzvid Agri Farms: Pure, Wholesome Sweetness Rooted in Tradition",
    description: "Every grain brings authentic, natural sweetness with nourishing benefits. We believe your food should be honest and pure. Our brown sugar reflects our dedication to quality, tradition, and sustainability.",
    link: "https://www.nuzvidagrifarms.com/blogs/news/brown-sugar-by-nuzvid-agri-farms-pure-wholesome-sweetness-rooted-in-tradition",
    date: "Latest Release"
  },
  {
    title: "Buffalo Ghee by Nuzvid Agri Farms : The Golden Elixir of Purity and Tradition",
    description: "Made from the rich, creamy milk of grass-fed buffaloes and carefully slow-cooked using time-honored methods, this ghee captures the very essence of purity and nourishment in every golden spoonful.",
    link: "https://www.nuzvidagrifarms.com/blogs/news/buffalo-ghee-by-nuzvid-agri-farms-the-golden-elixir-of-purity-and-tradition",
    date: "Featured"
  },
  {
    title: "Himalayan Pink Salt by Nuzvid Agri Farms | Nature’s Purest Gift",
    description: "Our Himalayan pink salt is not just a seasoning. It’s purity preserved in every crystal, a bridge to ancient natural processes, and a simple luxury that nourishes both body and soul.",
    link: "https://www.nuzvidagrifarms.com/blogs/news/himalayan-pink-salt-by-nuzvid-agri-farms-nature-s-purest-gift-crystal-by-crystal",
    date: "Wellness"
  },
  {
    title: "Nuzvid Agri Farms | A Return to Real Food",
    description: "This isn’t just about what’s on your plate. It’s about how it got there. We support traditional farmers because their way of farming heals—not only the land, but our bodies and communities.",
    link: "https://www.nuzvidagrifarms.com/blogs/news/nuzvid-agri-farms-a-return-to-real-food",
    date: "Our Story"
  },
  {
    title: "Red Chilli Powder by Nuzvid Agri Farms | Bold Flavor Rooted in Nature",
    description: "At Nuzvid Agri Farms, every product tells a story. Our Naturally Grown, Hand-Pounded Red Chilli Powder, made from premium Guntur chillies, carries the essence of that story in every grain.",
    link: "https://www.nuzvidagrifarms.com/blogs/news/red-chilli-powder-by-nuzvid-agri-farms-bold-flavor-rooted-in-nature-and-tradition",
    date: "Spices"
  },
  {
    title: "Turmeric Powder by Nuzvid Agri Farms | Nature’s Golden Gift",
    description: "Food should do more than fill the stomach. It should nourish, heal, and connect us to the land. Our Naturally Grown, Hand-Pounded Turmeric Powder is made with this belief at its core.",
    link: "https://www.nuzvidagrifarms.com/blogs/news/turmeric-powder-by-nuzvid-agri-farms-nature-s-golden-gift-for-everyday-wellness",
    date: "Spices"
  },
  {
    title: "Organic Jaggery by Nuzvid Agri Farms | Sweetness Rooted in Tradition",
    description: "Experience the Warmth of Real Jaggery. Now available from Nuzvid Agri Farms 100% Organic | Small-Batch | Wood-Fired | Chemical-Free",
    link: "https://www.nuzvidagrifarms.com/blogs/news/organic-jaggery-by-nuzvid-agri-farms-sweetness-rooted-in-tradition-and-wellness",
    date: "Sweeteners"
  },
  {
    title: "Wood Cold Pressed Oils by Nuzvid Agri Farms | Nourishment Crafted with Care",
    description: "We don’t just make oil. We preserve stories, values, and vitality. From seed selection to extraction, our process is rooted in respect for nature, tradition, and your health.",
    link: "https://www.nuzvidagrifarms.com/blogs/news/wood-coldpressed-oils-by-nuzvid-agri-farms-nourishment-crafted-with-care",
    date: "Oils"
  },
  {
    title: "A2 Ghee by Nuzvid Agri Farms | Tradition, Nutrition, and a Touch of Home",
    description: "Opening a jar of Nuzvid A2 Ghee is welcoming a legacy of love, tradition, and healing into your home. It’s a reminder that the food we eat can be medicine, joy, and connection.",
    link: "https://www.nuzvidagrifarms.com/blogs/news/a2-ghee-by-nuzvid-agri-farms-tradition-nutrition-and-a-touch-of-home",
    date: "Dairy"
  },
  {
    title: "Raw Forest Honey by Nuzvid Agri Farms | Nature’s Sweetest Gift",
    description: "By choosing this honey, you’re not just choosing better health. You’re choosing sustainable practices, natural purity, and a return to the way honey was meant to be: raw, wild, and full of life.",
    link: "https://www.nuzvidagrifarms.com/blogs/news/raw-forest-honey-by-nuzvid-agri-farms-nature-s-sweetest-gift-bottled-with-care",
    date: "Wellness"
  }
];

const Blogs = () => {
  useSEO({ title: 'News & Blog', description: 'Read our latest blogs, updates, and news from Nuzvid Agri Farms' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="blogs-page-wrapper">
      <section className="blogs-hero">
        <h1>News & Stories</h1>
        <p>Discover our roots, traditional farming practices, and the wholesome goodness behind every Nuzvid Agri Farms product.</p>
        <div className="breadcrumb">
          <Link to="/">Home</Link> &nbsp;|&nbsp; <span>Blogs</span>
        </div>
      </section>

      <div className="blogs-grid">
        {blogsData.map((blog, index) => (
          <div key={index} className="blog-card">
            <div className="blog-image-placeholder">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 11h10v2H7zm0-4h10v2H7zm0 8h7v2H7z"></path></svg>
            </div>
            <div className="blog-card-content">
              <div className="blog-date">{blog.date}</div>
              <h2 className="blog-title">{blog.title}</h2>
              <p className="blog-description">{blog.description}</p>
              <a href={blog.link} target="_blank" rel="noopener noreferrer" className="blog-read-more">
                Read Full Story
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
